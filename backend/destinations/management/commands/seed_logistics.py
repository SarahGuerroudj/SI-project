from django.core.management.base import BaseCommand
from service_types.models import ServiceType
from destinations.models import Destination
from pricing.models import PricingRule

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
        service_types = [
            {
                'name': 'Standard',
                'description': 'Livraison standard avec délai de 3-5 jours ouvrables.',
                'category': 'Delivery',
                'base_price': 500.00,
                'price_per_km': 15.00,
                'estimated_delivery_time': '3-5 jours',
                'is_active': True,
            },
            {
                'name': 'Express',
                'description': 'Livraison express avec délai de 24-48 heures.',
                'category': 'Delivery',
                'base_price': 1200.00,
                'price_per_km': 25.00,
                'estimated_delivery_time': '24-48 heures',
                'is_active': True,
            },
            # ... adding more from previous history
        ]
        # Adding some more to match the previous rich data
        service_types.extend([
            {
                'name': 'International',
                'description': 'Livraison internationale avec délai de 7-14 jours.',
                'category': 'Logistics',
                'base_price': 3500.00,
                'price_per_km': 35.00,
                'estimated_delivery_time': '7-14 jours',
                'is_active': True,
            },
            {
                'name': 'Same Day',
                'description': 'Livraison le jour même.',
                'category': 'Delivery',
                'base_price': 2500.00,
                'price_per_km': 45.00,
                'estimated_delivery_time': 'Même jour',
                'is_active': True,
            }
        ])

        for st_data in service_types:
            obj, created = ServiceType.objects.update_or_create(
                name=st_data['name'],
                defaults=st_data
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(f'  {status}: {obj.name}')

    def seed_destinations(self):
        destinations = [
            {'name': 'Algiers Centre', 'country': 'Algeria', 'city': 'Algiers', 'delivery_zone': 'Zone A', 'distance_km': 0, 'type': 'Main Hub', 'is_active': True},
            {'name': 'Oran Centre', 'country': 'Algeria', 'city': 'Oran', 'delivery_zone': 'Zone B', 'distance_km': 430, 'type': 'Main Hub', 'is_active': True},
            {'name': 'Constantine Centre', 'country': 'Algeria', 'city': 'Constantine', 'delivery_zone': 'Zone C', 'distance_km': 320, 'type': 'Main Hub', 'is_active': True},
            {'name': 'Paris CDG', 'country': 'France', 'city': 'Paris', 'delivery_zone': 'International', 'distance_km': 2000, 'type': 'Stock Warehouse', 'is_active': True},
        ]

        for dest_data in destinations:
            obj, created = Destination.objects.update_or_create(
                name=dest_data['name'],
                city=dest_data['city'],
                defaults=dest_data
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(f'  {status}: {obj.name} ({obj.city})')

    def seed_pricing_rules(self):
        try:
            standard = ServiceType.objects.get(name='Standard')
            alg = Destination.objects.get(name='Algiers Centre')
            oran = Destination.objects.get(name='Oran Centre')
            
            rules = [
                {'service_type': standard, 'destination': alg, 'base_price': 500, 'price_per_km': 15, 'is_active': True},
                {'service_type': standard, 'destination': oran, 'base_price': 1000, 'price_per_km': 20, 'is_active': True},
            ]

            for rule_data in rules:
                PricingRule.objects.update_or_create(
                    service_type=rule_data['service_type'],
                    destination=rule_data['destination'],
                    defaults=rule_data
                )
        except Exception as e:
            self.stdout.write(f'Error seeding pricing rules: {e}')
