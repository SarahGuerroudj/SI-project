from rest_framework import serializers
from .models import ServiceType

class ServiceTypeSerializer(serializers.ModelSerializer):
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2, required=False)
    pricePerKm = serializers.DecimalField(source='price_per_km', max_digits=10, decimal_places=2, allow_null=True, required=False)
    estimatedDeliveryTime = serializers.CharField(source='estimated_delivery_time', required=False, allow_blank=True)
    isActive = serializers.BooleanField(source='is_active', required=False)
    pricingModel = serializers.CharField(source='pricing_model', required=False)
    additionalFees = serializers.DecimalField(source='additional_fees', max_digits=10, decimal_places=2, required=False)
    allowedPackageSizes = serializers.JSONField(source='allowed_package_sizes', required=False)
    driverNotes = serializers.CharField(source='driver_notes', required=False, allow_blank=True)

    class Meta:
        model = ServiceType
        fields = (
            'id', 'name', 'description', 'category', 'basePrice', 'pricePerKm', 
            'estimatedDeliveryTime', 'isActive', 'requirements', 'pricingModel', 
            'additionalFees', 'allowedPackageSizes', 'driverNotes'
        )
    
    def create(self, validated_data):
        validated_data.setdefault('base_price', 0)
        validated_data.setdefault('estimated_delivery_time', '')
        return ServiceType.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        # Allow partial updates
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
