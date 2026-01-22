from rest_framework import viewsets
from .models import Driver
from .serializers import DriverSerializer
from users.permissions import IsManager
from users.audit import AuditLogMixin

class DriverViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Drivers: Manager-only access for driver management
    """
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsManager]
