from django.core.management.base import BaseCommand
from users.models import User
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
                if created or not user.check_password(password):
                    user.set_password(password)
                    user.email = email
                    user.role = role
                    user.save()
                    status = 'created' if created else 'updated'
                    self.stdout.write(self.style.SUCCESS(f'User "{username}" {status}.'))
                else:
                    self.stdout.write(f'User "{username}" already exists.')
        
        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
