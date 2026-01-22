from django.db import models
from django.conf import settings

class Shipment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Transit', 'In Transit'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
        ('Delayed', 'Delayed'),
    )
    
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shipments')
    destination = models.ForeignKey('destinations.Destination', on_delete=models.SET_NULL, null=True)
    weight_kg = models.FloatField()
    volume_m3 = models.FloatField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    
    # Store history as JSON for simplicity
    history = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"Shipment {self.id} - {self.client.username}"
