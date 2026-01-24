from django.core.management.base import BaseCommand
from users.models import User
from drivers.models import Driver
from clients.models import Client
from django.db import transaction

class Command(BaseCommand):
    help = 'Seeds initial test accounts for Admiral'

    def handle(self, *args, **options):
        accounts = [
            ('admin', 'admin@routemind.com', 'admin123', 'admin'),
            ('manager', 'manager@routemind.com', 'manager123', 'manager'),
            ('client', 'client@routemind.com', 'client123', 'client'),
            ('driver', 'driver@routemind.com', 'driver123', 'driver'),
        ]
        
        self.stdout.write('Seeding test accounts...')
        
        with transaction.atomic():
            for username, email, password, role in accounts:
                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={'email': email, 'role': role}
                )
                
                # Update role-based flags
                user.role = role
                if role == 'admin':
                    user.is_staff = True
                    user.is_superuser = True
                elif role == 'manager':
                    user.is_staff = True
                user.save()

                if created or not user.check_password(password):
                    user.set_password(password)
                    user.email = email
                    user.save()
                    status = 'created' if created else 'updated'
                    self.stdout.write(self.style.SUCCESS(f'User "{username}" {status}.'))
                else:
                    self.stdout.write(f'User "{username}" already exists (flags updated).')

                # Create profiles for drivers and clients if they don't exist
                if role == 'driver':
                    Driver.objects.get_or_create(
                        user=user,
                        defaults={'license_number': 'LIC-12345', 'status': 'Available'}
                    )
                    self.stdout.write(f'  - Driver profile ensured for "{username}"')
                elif role == 'client':
                    Client.objects.get_or_create(
                        user=user,
                        defaults={'client_type': 'Individual'}
                    )
                    self.stdout.write(f'  - Client profile ensured for "{username}"')
        
        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
