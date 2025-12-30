from django.db import models
from django.conf import settings

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
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.city})"

class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50) # Delivery, Logistics, etc.
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_delivery_time = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Shipment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Transit', 'In Transit'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
        ('Delayed', 'Delayed'),
    )
    
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shipments')
    destination = models.ForeignKey(Destination, on_delete=models.SET_NULL, null=True)
    weight_kg = models.FloatField()
    volume_m3 = models.FloatField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    
    # Store history as JSON for simplicity, or separate model
    history = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"Shipment {self.id} - {self.client.username}"

class Route(models.Model):
    STATUS_CHOICES = (
        ('Planned', 'Planned'),
        ('Active', 'Active'),
        ('Completed', 'Completed'),
    )
    
    driver = models.ForeignKey('fleet.Driver', on_delete=models.CASCADE, related_name='routes')
    vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.CASCADE, related_name='routes')
    shipments = models.ManyToManyField(Shipment, related_name='routes')
    date = models.DateField()
    actual_distance_km = models.FloatField(null=True, blank=True)
    actual_duration_hours = models.FloatField(null=True, blank=True)
    fuel_consumed_liters = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planned')
    
    def __str__(self):
        return f"Route {self.id} - {self.driver}"
