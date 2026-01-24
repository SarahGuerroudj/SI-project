from rest_framework import serializers
from .models import Destination

class DestinationSerializer(serializers.ModelSerializer):
    # Map frontend camelCase fields to backend snake_case model fields
    deliveryZone = serializers.CharField(source='delivery_zone', required=False, allow_blank=True)
    distanceKm = serializers.FloatField(source='distance_km', required=False)
    destinationType = serializers.CharField(source='destination_type', required=False)
    isActive = serializers.BooleanField(source='is_active', required=False)
    
    class Meta:
        model = Destination
        fields = ('id', 'name', 'country', 'city', 'deliveryZone', 'distanceKm', 'type', 'destinationType', 'isActive')
        read_only_fields = ('id',)

    def create(self, validated_data):
        # Ensure defaults for required model fields if not provided
        validated_data.setdefault('delivery_zone', '')
        validated_data.setdefault('distance_km', 0.0)
        validated_data.setdefault('destination_type', 'Domestic')
        validated_data.setdefault('is_active', True)
        return super().create(validated_data)
