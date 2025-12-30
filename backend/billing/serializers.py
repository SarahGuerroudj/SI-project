from rest_framework import serializers
from .models import Invoice, PaymentRecord
from users.serializers import UserSerializer

class PaymentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRecord
        fields = '__all__'

from logistics.models import Shipment

class InvoiceSerializer(serializers.ModelSerializer):
    client_details = UserSerializer(source='client', read_only=True)
    payments = PaymentRecordSerializer(many=True, read_only=True)
    shipments = serializers.PrimaryKeyRelatedField(many=True, queryset=Shipment.objects.all(), required=False, allow_empty=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
