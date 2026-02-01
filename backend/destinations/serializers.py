from rest_framework import serializers
from .models import Destination
from pricing.models import PricingRule
from service_types.models import ServiceType

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
        destination = super().create(validated_data)
        
        # Automatically create pricing rules for all active service types
        self._create_default_pricing_rules(destination)
        
        return destination
    
    def _create_default_pricing_rules(self, destination):
        """Create default pricing rules for the new destination with all service types"""
        try:
            # Get all active service types
            service_types = ServiceType.objects.filter(is_active=True)
            
            # Define default pricing based on destination type
            if destination.destination_type == 'International':
                base_price_multiplier = 2.0
                price_per_km_multiplier = 2.0
            else:
                base_price_multiplier = 1.0
                price_per_km_multiplier = 1.0
            
            for service_type in service_types:
                # Calculate default prices based on service type and destination type
                base_price = service_type.base_price * base_price_multiplier
                price_per_km = (service_type.price_per_km or 15) * price_per_km_multiplier
                
                # Create pricing rule
                PricingRule.objects.update_or_create(
                    service_type=service_type,
                    destination=destination,
                    defaults={
                        'base_price': base_price,
                        'price_per_km': price_per_km,
                        'is_active': True
                    }
                )
        except Exception as e:
            # Fail silently if pricing rule creation fails
            print(f"Warning: Could not create pricing rules for destination {destination.id}: {e}")
