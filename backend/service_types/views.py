from rest_framework import viewsets
from .models import ServiceType
from .serializers import ServiceTypeSerializer
from users.permissions import IsManagerOrReadOnly
from users.audit import AuditLogMixin

class ServiceTypeViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Service Types: Managers can modify, authenticated users can read
    """
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer
    permission_classes = [IsManagerOrReadOnly]
