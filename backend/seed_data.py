import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def create_test_accounts():
    accounts = [
        ('admin', 'admin@routemind.com', 'admin123', 'admin'),
        ('manager', 'manager@routemind.com', 'manager123', 'manager'),
        ('client', 'client@routemind.com', 'client123', 'client'),
        ('driver', 'driver@routemind.com', 'driver123', 'driver'),
    ]
    
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
            print(f"User {username} created/updated.")
        else:
            print(f"User {username} already exists.")

if __name__ == '__main__':
    create_test_accounts()
