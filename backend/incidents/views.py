from rest_framework import viewsets
from .models import Incident
from .serializers import IncidentSerializer
from users.permissions import IsManager, IsDriver
from users.audit import AuditLogMixin, AuditLog, get_client_ip

class IncidentViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Incidents: Drivers can report, Managers can view/manage all
    """
    queryset = Incident.objects.all().order_by('-date')
    serializer_class = IncidentSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'driver' and hasattr(user, 'driver_profile'):
            instance = serializer.save(driver=user.driver_profile)
        else:
            instance = serializer.save()
            
        AuditLog.log(
            action='resource_created',
            user=user if user.is_authenticated else None,
            resource_type='Incident',
            resource_id=str(instance.id),
            ip_address=get_client_ip(self.request),
            severity='low',
            details=serializer.data
        )

    def get_permissions(self):
        if self.action == 'create':
            return [IsDriver()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsManager()]
        return [IsDriver()]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['admin', 'manager']:
            return Incident.objects.all().order_by('-date')
        elif user.role == 'driver':
            return Incident.objects.filter(driver__user=user).order_by('-date')
        
        return Incident.objects.none()
