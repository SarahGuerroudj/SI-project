import os
import django
import sys

# Add the project root to the python path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from logistics.models import Destination

try:
    if not Destination.objects.filter(id=1).exists():
        Destination.objects.create(
            id=1, 
            name="Default Destination", 
            country="Algeria", 
            city="Algiers", 
            delivery_zone="Zone 1", 
            distance_km=0, 
            type="Regular"
        )
        print("Created default destination with ID 1")
    else:
        print("Destination with ID 1 already exists")
except Exception as e:
    print(f"Error: {e}")
