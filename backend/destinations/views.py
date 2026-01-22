from rest_framework import viewsets
from .models import Destination
from .serializers import DestinationSerializer
from users.permissions import IsManagerOrReadOnly
from users.audit import AuditLogMixin

class DestinationViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Destinations: Managers can modify, others read-only
    """
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsManagerOrReadOnly]
