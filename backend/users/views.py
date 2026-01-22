from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, EmailTokenObtainPairSerializer, UserRegistrationSerializer, AuditLogSerializer
from .permissions import IsAdmin, IsManager, IsAuthenticated
from .audit import AuditLog, get_client_ip, AuditLogMixin
from rest_framework import filters, mixins


class UserViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    User management with role-based permissions:
    - Admin: Full CRUD
    - Manager: Read only
    - Others: No list access
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    audit_resource_type = 'User'

    def perform_update(self, serializer):
        old_instance = self.get_object()
        user = self.request.user
        
        # Check for role change specifically for special logging
        if 'role' in serializer.validated_data and serializer.validated_data['role'] != old_instance.role:
            AuditLog.log(
                action='role_changed',
                user=user,
                resource_type='User',
                resource_id=old_instance.id,
                ip_address=get_client_ip(self.request),
                severity='high',
                details={
                    'old_role': old_instance.role,
                    'new_role': serializer.validated_data['role'],
                    'target_username': old_instance.username
                }
            )
        
        # Continue with standard mixin update (which logs before/after)
        super().perform_update(serializer)
    
    def get_permissions(self):
        """
        Method-level permission control:
        - LIST: Admin or Manager
        - RETRIEVE: Admin or Manager
        - CREATE: Admin only
        - UPDATE/DELETE: Admin only
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsManager]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get', 'patch', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get or update current user's profile.
        Any authenticated user can access their own profile.
        """
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        else:
            # PATCH or PUT - update user profile
            # Users can only update their own profile
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def create_manager(self, request):
        """
        Admin-only endpoint to create a new manager.
        Enforces role assignment.
        """
        data = request.data.copy()
        data['role'] = 'manager'  # Force manager role
        
        serializer = UserRegistrationSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailTokenObtainPairView(TokenObtainPairView):
    """Public endpoint for login"""
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # We need to capture the response to know if it succeeded
        try:
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                # Login Success
                email = request.data.get('email')
                user = User.objects.get(email=email)
                AuditLog.log(
                    action='login_success',
                    user=user,
                    resource_type='User',
                    resource_id=user.id,
                    ip_address=get_client_ip(request),
                    severity='low'
                )
            return response
        except Exception as e:
            # Login Failed (likely 401)
            AuditLog.log(
                action='login_failed',
                ip_address=get_client_ip(request),
                severity='medium',
                success=False,
                details={'email_attempt': request.data.get('email')}
            )
            raise e


class RegisterView(generics.CreateAPIView):
    """
    Public endpoint for user registration.
    New users default to 'client' role.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        AuditLog.log(
            action='resource_created',
            user=user,
            resource_type='User',
            resource_id=user.id,
            ip_address=get_client_ip(self.request),
            severity='low',
            details={'registration_method': 'email'}
        )


from rest_framework import mixins

class AuditLogViewSet(mixins.CreateModelMixin, 
                      mixins.ListModelMixin, 
                      mixins.RetrieveModelMixin, 
                      viewsets.GenericViewSet):
    """
    ViewSet for Audit Logs.
    - LIST/RETRIEVE: Only accessible by Admins.
    - CREATE: Accessible by all authenticated users (for frontend sync).
    Provides comprehensive audit trail for security and compliance.
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        # Auto-fill system fields if not provided
        serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            username=self.request.user.username if self.request.user.is_authenticated else 'Anonymous',
            ip_address=get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')[:500]
        )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'action', 'resource_type', 'ip_address']
    ordering_fields = ['timestamp', 'severity', 'action']
    
    def get_queryset(self):
        """
        Allow filtering by severity and action via query params
        """
        queryset = AuditLog.objects.all().order_by('-timestamp')
        
        # Filter by severity if provided
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by action if provided
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        return queryset

