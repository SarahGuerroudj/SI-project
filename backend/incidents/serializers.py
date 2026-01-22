from rest_framework import serializers
from .models import Incident
from drivers.serializers import DriverSerializer
from vehicles.serializers import VehicleSerializer

class IncidentSerializer(serializers.ModelSerializer):
    driver_details = DriverSerializer(source='driver', read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)

    class Meta:
        model = Incident
        fields = '__all__'
