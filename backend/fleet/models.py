from django.db import models
from django.conf import settings

class Vehicle(models.Model):
    STATUS_CHOICES = (
        ('Available', 'Available'),
        ('On Route', 'On Route'),
        ('Maintenance', 'Maintenance'),
    )
    
    plate = models.CharField(max_length=20, unique=True)
    model = models.CharField(max_length=50)
    capacity_kg = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    
    def __str__(self):
        return f"{self.plate} ({self.model})"

class Driver(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='Available')
    
    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Incident(models.Model):
    TYPE_CHOICES = (
        ('Accident', 'Accident'),
        ('Breakdown', 'Breakdown'),
        ('Delay', 'Delay'),
        ('Lost Cargo', 'Lost Cargo'),
        ('Other', 'Other'),
    )
    
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField()
    date = models.DateField()
    related_entity_id = models.CharField(max_length=50, blank=True, null=True, help_text="ID of related shipment, route, etc.")
    resolved = models.BooleanField(default=False)
    
    # Optional links to specific entities if we want strict FKs later, 
    # but based on requirements keeping it simple for now, maybe link to driver/vehicle
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.date}"
