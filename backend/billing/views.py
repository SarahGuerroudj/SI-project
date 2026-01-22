from rest_framework import viewsets
from .models import Invoice, PaymentRecord
from .serializers import InvoiceSerializer, PaymentRecordSerializer
from users.permissions import IsManager, IsClient

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    Invoices: Managers create/manage, clients view their own
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsManager]
    
    def get_queryset(self):
        """Clients see only their own invoices"""
        user = self.request.user
        if user.role in ['admin', 'manager']:
            return Invoice.objects.all()
        elif user.role == 'client':
            return Invoice.objects.filter(client=user)
        return Invoice.objects.none()


class PaymentRecordViewSet(viewsets.ModelViewSet):
    """
    Payment Records: Manager-only access
    """
    queryset = PaymentRecord.objects.all()
    serializer_class = PaymentRecordSerializer
    permission_classes = [IsManager]
