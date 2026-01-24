from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client
from .serializers import ClientSerializer
from users.permissions import IsManager, IsAuthenticated
from users.audit import AuditLogMixin

class ClientViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Clients: Manager-only access for client management
    Clients can access their own record via /clients/me/
    """
    queryset = Client.objects.filter(user__role='client')
    serializer_class = ClientSerializer
    permission_classes = [IsManager]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current user's client record.
        Allows clients to access their own client profile.
        """
        try:
            client = Client.objects.get(user=request.user)
            serializer = self.get_serializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response(
                {'detail': 'Client profile not found for this user.'},
                status=404
            )
