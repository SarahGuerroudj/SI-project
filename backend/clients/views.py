from rest_framework import viewsets
from .models import Client
from .serializers import ClientSerializer
from users.permissions import IsManager
from users.audit import AuditLogMixin

class ClientViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Clients: Manager-only access for client management
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsManager]
