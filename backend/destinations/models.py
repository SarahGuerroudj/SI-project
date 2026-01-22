from django.db import models

class Destination(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    delivery_zone = models.CharField(max_length=100)
    distance_km = models.FloatField()
    type_choices = (
        ('Stock Warehouse', 'Stock Warehouse'),
        ('Main Hub', 'Main Hub'),
        ('Checkpoint', 'Checkpoint'),
        ('Regular', 'Regular'),
    )
    type = models.CharField(max_length=50, choices=type_choices)
    
    # Destination category: Domestic or International
    destination_type_choices = (
        ('Domestic', 'Domestic'),
        ('International', 'International'),
    )
    destination_type = models.CharField(max_length=20, choices=destination_type_choices, default='Domestic')
    
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.city}) - {self.destination_type}"
