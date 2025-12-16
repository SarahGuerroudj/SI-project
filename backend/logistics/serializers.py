from rest_framework import serializers
from .models import Destination, ServiceType, Shipment, Route
from users.serializers import UserSerializer
from fleet.serializers import DriverSerializer, VehicleSerializer

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'

class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'

class ShipmentSerializer(serializers.ModelSerializer):
    client_details = UserSerializer(source='client', read_only=True)
    destination_details = DestinationSerializer(source='destination', read_only=True)
    
    class Meta:
        model = Shipment
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    driver_details = DriverSerializer(source='driver', read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    shipments_details = ShipmentSerializer(source='shipments', many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = '__all__'
