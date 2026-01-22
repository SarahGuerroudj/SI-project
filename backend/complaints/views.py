from rest_framework import viewsets, permissions
from .models import Complaint
from .serializers import ComplaintSerializer
from users.permissions import IsManager, IsAuthenticated
from users.audit import AuditLogMixin

class ComplaintViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Complaints: Any authenticated user can create, managers view/manage all
    """
    queryset = Complaint.objects.all().order_by('-date')
    serializer_class = ComplaintSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsManager()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'manager']:
            return Complaint.objects.all().order_by('-date')
        return Complaint.objects.filter(client=user).order_by('-date')
