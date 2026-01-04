from rest_framework import serializers
from .models import Destination, ServiceType, Shipment, Route, PricingRule
from users.serializers import UserSerializer
from fleet.serializers import DriverSerializer, VehicleSerializer

class DestinationSerializer(serializers.ModelSerializer):
    deliveryZone = serializers.CharField(source='delivery_zone')
    distanceKm = serializers.FloatField(source='distance_km')
    
    class Meta:
        model = Destination
        fields = '__all__'
        extra_kwargs = {
            'delivery_zone': {'write_only': True},
            'distance_km': {'write_only': True},
        }

class ServiceTypeSerializer(serializers.ModelSerializer):
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    pricePerKm = serializers.DecimalField(source='price_per_km', max_digits=10, decimal_places=2)
    estimatedDeliveryTime = serializers.CharField(source='estimated_delivery_time')

    class Meta:
        model = ServiceType
        fields = '__all__'
        extra_kwargs = {
            'base_price': {'write_only': True},
            'price_per_km': {'write_only': True},
            'estimated_delivery_time': {'write_only': True},
        }

class ShipmentSerializer(serializers.ModelSerializer):
    client_details = UserSerializer(source='client', read_only=True)
    destination_details = DestinationSerializer(source='destination', read_only=True)
    dateCreated = serializers.DateTimeField(source='created_at', read_only=True)
    estimatedDelivery = serializers.DateTimeField(source='estimated_delivery', required=False)
    
    class Meta:
        model = Shipment
        fields = '__all__'
        extra_kwargs = {
            'created_at': {'write_only': True},
            'estimated_delivery': {'write_only': True},
        }

class RouteSerializer(serializers.ModelSerializer):
    driver_details = DriverSerializer(source='driver', read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    shipments_details = ShipmentSerializer(source='shipments', many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = '__all__'

class PricingRuleSerializer(serializers.ModelSerializer):
    serviceTypeId = serializers.PrimaryKeyRelatedField(source='service_type', queryset=ServiceType.objects.all())
    serviceTypeDetails = ServiceTypeSerializer(source='service_type', read_only=True)
    destinationId = serializers.PrimaryKeyRelatedField(source='destination', queryset=Destination.objects.all())
    destinationDetails = DestinationSerializer(source='destination', read_only=True)
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    pricePerKm = serializers.DecimalField(source='price_per_km', max_digits=10, decimal_places=2, required=False)
    isActive = serializers.BooleanField(source='is_active')

    class Meta:
        model = PricingRule
        fields = '__all__'
        extra_kwargs = {
            'base_price': {'write_only': True},
            'price_per_km': {'write_only': True},
            'is_active': {'write_only': True},
        }
