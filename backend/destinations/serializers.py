from rest_framework import serializers
from .models import Destination

class DestinationSerializer(serializers.ModelSerializer):
    deliveryZone = serializers.CharField(source='delivery_zone', required=False, allow_blank=True)
    distanceKm = serializers.FloatField(source='distance_km', required=False)
    destinationType = serializers.CharField(source='destination_type', required=False)
    isActive = serializers.BooleanField(source='is_active', required=False)
    
    class Meta:
        model = Destination
        fields = ('id', 'name', 'country', 'city', 'deliveryZone', 'distanceKm', 'type', 'destinationType', 'isActive')
    
    def create(self, validated_data):
        validated_data.setdefault('delivery_zone', '')
        validated_data.setdefault('distance_km', 0.0)
        validated_data.setdefault('destination_type', 'Domestic')
        return Destination.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        if 'delivery_zone' not in validated_data:
            validated_data['delivery_zone'] = instance.delivery_zone
        if 'distance_km' not in validated_data:
            validated_data['distance_km'] = instance.distance_km
        if 'destination_type' not in validated_data:
            validated_data['destination_type'] = instance.destination_type
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
