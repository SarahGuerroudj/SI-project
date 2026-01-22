from rest_framework import serializers
from .models import PricingRule
from service_types.models import ServiceType
from service_types.serializers import ServiceTypeSerializer
from destinations.models import Destination
from destinations.serializers import DestinationSerializer

class PricingRuleSerializer(serializers.ModelSerializer):
    serviceTypeId = serializers.PrimaryKeyRelatedField(source='service_type', queryset=ServiceType.objects.all())
    serviceTypeDetails = ServiceTypeSerializer(source='service_type', read_only=True)
    destinationId = serializers.PrimaryKeyRelatedField(source='destination', queryset=Destination.objects.all())
    destinationDetails = DestinationSerializer(source='destination', read_only=True)
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    pricePerKm = serializers.DecimalField(source='price_per_km', max_digits=10, decimal_places=2, allow_null=True)
    isActive = serializers.BooleanField(source='is_active')

    class Meta:
        model = PricingRule
        fields = ('id', 'serviceTypeId', 'serviceTypeDetails', 'destinationId', 'destinationDetails', 'basePrice', 'pricePerKm', 'isActive')
    
    def create(self, validated_data):
        return PricingRule.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
