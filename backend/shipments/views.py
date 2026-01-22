from rest_framework import viewsets, status
from .models import Shipment
from .serializers import ShipmentSerializer
from users.permissions import (
    IsManager, IsClient, IsShipmentOwner, 
    ClientCanCreateOnly
)
from users.audit import AuditLogMixin

class ShipmentViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Shipments with role-based and owner-based access:
    - Admin/Manager: Full access to all
    - Client: Full access to own shipments only
    - Driver: Read access to assigned shipments only
    """
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [ClientCanCreateOnly()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsManager()]
        return [IsClient()]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['admin', 'manager']:
            return Shipment.objects.all()
        elif user.role == 'client':
            return Shipment.objects.filter(client=user)
        elif user.role == 'driver':
            from drivers.models import Driver as DriverModel
            try:
                driver = DriverModel.objects.get(user=user)
                return Shipment.objects.filter(routes__driver=driver)
            except DriverModel.DoesNotExist:
                return Shipment.objects.none()
        
        return Shipment.objects.none()
    
    def check_object_permissions(self, request, obj):
        if not IsShipmentOwner().has_object_permission(request, self, obj):
            self.permission_denied(
                request,
                message="Access denied."
            )
