from rest_framework import viewsets
from .models import Vehicle
from .serializers import VehicleSerializer
from users.permissions import IsManager
from users.audit import AuditLogMixin

class VehicleViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Vehicles: Manager-only access for fleet management
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsManager]
