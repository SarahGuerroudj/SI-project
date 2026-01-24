from rest_framework import serializers
from .models import Shipment
from users.serializers import UserSerializer
from destinations.serializers import DestinationSerializer

class ShipmentSerializer(serializers.ModelSerializer):
    client_details = UserSerializer(source='client', read_only=True)
    destination_details = DestinationSerializer(source='destination', read_only=True)
    dateCreated = serializers.DateTimeField(source='created_at', read_only=True)
    estimatedDelivery = serializers.DateTimeField(source='estimated_delivery', required=False, allow_null=True)
    weight = serializers.FloatField(source='weight_kg')
    volume = serializers.FloatField(source='volume_m3')
    routeId = serializers.SerializerMethodField()
    isLocked = serializers.SerializerMethodField()
    
    def get_routeId(self, obj):
        # Get the first route ID if shipment is assigned to any route
        routes = obj.routes.all()
        if routes.exists():
            return routes.first().id
        return None
    
    def get_isLocked(self, obj):
        # Shipment is locked if it's assigned to any route
        return obj.routes.exists()
    
    class Meta:
        model = Shipment
        fields = (
            'id', 'client', 'client_details', 'destination', 'destination_details', 
            'weight', 'volume', 'price', 'status', 'dateCreated', 
            'estimatedDelivery', 'history', 'routeId', 'isLocked'
        )
