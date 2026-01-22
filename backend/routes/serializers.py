from rest_framework import serializers
from .models import Route
from drivers.serializers import DriverSerializer
from vehicles.serializers import VehicleSerializer
from shipments.serializers import ShipmentSerializer

class RouteSerializer(serializers.ModelSerializer):
    driver_details = DriverSerializer(source='driver', read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    shipments_details = ShipmentSerializer(source='shipments', many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = '__all__'
