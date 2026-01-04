"""
Seed command to populate ServiceType and Destination data.
Run with: python manage.py seed_logistics
"""
from django.core.management.base import BaseCommand
from logistics.models import ServiceType, Destination


class Command(BaseCommand):
    help = 'Seeds the database with service types and destinations for pricing'

    def handle(self, *args, **options):
        self.stdout.write('Seeding service types...')
        self.seed_service_types()
        
        self.stdout.write('Seeding destinations...')
        self.seed_destinations()
        
        self.stdout.write('Seeding pricing rules...')
        self.seed_pricing_rules()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded logistics data!'))

    def seed_service_types(self):
        # ... (keep existing)
        service_types = [
            {
                'name': 'Standard',
                'description': 'Livraison standard avec délai de 3-5 jours ouvrables. Idéal pour les envois non urgents.',
                'category': 'Delivery',
                'base_price': 500.00,
                'price_per_km': 15.00,
                'estimated_delivery_time': '3-5 jours',
                'is_active': True,
            },
            {
                'name': 'Express',
                'description': 'Livraison express avec délai de 24-48 heures. Pour les envois urgents.',
                'category': 'Delivery',
                'base_price': 1200.00,
                'price_per_km': 25.00,
                'estimated_delivery_time': '24-48 heures',
                'is_active': True,
            },
            {
                'name': 'International',
                'description': 'Livraison internationale avec délai de 7-14 jours. Inclut dédouanement.',
                'category': 'Logistics',
                'base_price': 3500.00,
                'price_per_km': 35.00,
                'estimated_delivery_time': '7-14 jours',
                'is_active': True,
            },
            {
                'name': 'Same Day',
                'description': 'Livraison le jour même. Disponible uniquement dans les zones urbaines.',
                'category': 'Delivery',
                'base_price': 2500.00,
                'price_per_km': 45.00,
                'estimated_delivery_time': 'Même jour',
                'is_active': True,
            },
            {
                'name': 'Freight',
                'description': 'Transport de marchandises en vrac ou de grande taille.',
                'category': 'Logistics',
                'base_price': 5000.00,
                'price_per_km': 50.00,
                'estimated_delivery_time': '5-10 jours',
                'is_active': True,
            },
            {
                'name': 'Cold Chain',
                'description': 'Transport réfrigéré pour produits périssables et pharmaceutiques.',
                'category': 'Handling',
                'base_price': 4000.00,
                'price_per_km': 55.00,
                'estimated_delivery_time': '24-72 heures',
                'is_active': True,
            },
        ]

        for st_data in service_types:
            obj, created = ServiceType.objects.update_or_create(
                name=st_data['name'],
                defaults=st_data
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(f'  {status}: {obj.name}')

    def seed_pricing_rules(self):
        try:
            standard = ServiceType.objects.get(name='Standard')
            express = ServiceType.objects.get(name='Express')
            international = ServiceType.objects.get(name='International')
            
            # Fetch some destinations to link
            alg_warehouse = Destination.objects.filter(city='Algiers').first()
            oran_hub = Destination.objects.filter(city='Oran').first()
            euro_hub = Destination.objects.filter(delivery_zone='International - Europe').first()

            if not (alg_warehouse and oran_hub):
                self.stdout.write(self.style.WARNING('Destinations not found, skipping pricing rules.'))
                return

        except ServiceType.DoesNotExist:
            self.stdout.write(self.style.WARNING('Service types not found, skipping pricing rules.'))
            return

        from logistics.models import PricingRule

        rules = [
            # Standard Delivery Rules
            {
                'service_type': standard,
                'destination': alg_warehouse,
                'base_price': 500.00,
                'price_per_km': 15.00,
                'is_active': True
            },
            {
                'service_type': standard,
                'destination': oran_hub,
                'base_price': 800.00,
                'base_price': 1200.00,
                'price_per_km': 25.00,
                'minimum_charge': 1000.00,
                'maximum_weight_kg': 500,
                'estimated_time_range': '24 heures',
                'urgency': 'Express',
            },
            {
                'service_type': international,
                'zone': 'International - Europe',
                'region': 'Europe',
                'base_price': 4000.00,
                'price_per_km': 40.00,
                'minimum_charge': 3500.00,
                'maximum_weight_kg': 2000,
                'estimated_time_range': '7-14 jours',
                'urgency': 'Standard',
            },
        ]

        for rule_data in rules:
            if not rule_data: continue
            
            # Use update_or_create searching by unique constraints
            obj, created = PricingRule.objects.update_or_create(
                service_type=rule_data['service_type'],
                destination=rule_data['destination'],
                defaults=rule_data
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(f'  {status}: {obj.service_type.name} -> {obj.destination.name}')

    def seed_destinations(self):
        destinations = [
            # Algiers Region
            {
                'name': 'Algiers Centre',
                'country': 'Algeria',
                'city': 'Algiers',
                'delivery_zone': 'Zone A - Capital',
                'distance_km': 0,
                'type': 'Main Hub',
                'is_active': True,
            },
            {
                'name': 'Bab El Oued',
                'country': 'Algeria',
                'city': 'Algiers',
                'delivery_zone': 'Zone A - Capital',
                'distance_km': 5,
                'type': 'Regular',
                'is_active': True,
            },
            {
                'name': 'Hussein Dey',
                'country': 'Algeria',
                'city': 'Algiers',
                'delivery_zone': 'Zone A - Capital',
                'distance_km': 8,
                'type': 'Regular',
                'is_active': True,
            },
            # Oran Region
            {
                'name': 'Oran Centre',
                'country': 'Algeria',
                'city': 'Oran',
                'delivery_zone': 'Zone B - West',
                'distance_km': 430,
                'type': 'Main Hub',
                'is_active': True,
            },
            {
                'name': 'Es Sénia',
                'country': 'Algeria',
                'city': 'Oran',
                'delivery_zone': 'Zone B - West',
                'distance_km': 440,
                'type': 'Regular',
                'is_active': True,
            },
            # Constantine Region
            {
                'name': 'Constantine Centre',
                'country': 'Algeria',
                'city': 'Constantine',
                'delivery_zone': 'Zone C - East',
                'distance_km': 320,
                'type': 'Main Hub',
                'is_active': True,
            },
            {
                'name': 'El Khroub',
                'country': 'Algeria',
                'city': 'Constantine',
                'delivery_zone': 'Zone C - East',
                'distance_km': 335,
                'type': 'Regular',
                'is_active': True,
            },
            # Blida
            {
                'name': 'Blida Centre',
                'country': 'Algeria',
                'city': 'Blida',
                'delivery_zone': 'Zone A - Capital',
                'distance_km': 45,
                'type': 'Checkpoint',
                'is_active': True,
            },
            # Setif
            {
                'name': 'Setif Centre',
                'country': 'Algeria',
                'city': 'Setif',
                'delivery_zone': 'Zone D - Highland',
                'distance_km': 280,
                'type': 'Main Hub',
                'is_active': True,
            },
            # International
            {
                'name': 'Tunis',
                'country': 'Tunisia',
                'city': 'Tunis',
                'delivery_zone': 'International - Maghreb',
                'distance_km': 1000,
                'type': 'Stock Warehouse',
                'is_active': True,
            },
            {
                'name': 'Casablanca',
                'country': 'Morocco',
                'city': 'Casablanca',
                'delivery_zone': 'International - Maghreb',
                'distance_km': 1500,
                'type': 'Stock Warehouse',
                'is_active': True,
            },
            {
                'name': 'Paris CDG',
                'country': 'France',
                'city': 'Paris',
                'delivery_zone': 'International - Europe',
                'distance_km': 2000,
                'type': 'Stock Warehouse',
                'is_active': True,
            },
        ]

        for dest_data in destinations:
            obj, created = Destination.objects.update_or_create(
                name=dest_data['name'],
                city=dest_data['city'],
                defaults=dest_data
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(f'  {status}: {obj.name} ({obj.city})')
