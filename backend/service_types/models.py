from django.db import models

class ServiceType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50) # Delivery, Logistics, etc.
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_delivery_time = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    # New fields to match frontend
    requirements = models.JSONField(default=list, blank=True)
    pricing_model = models.CharField(max_length=50, default='Distance-based')
    additional_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    allowed_package_sizes = models.JSONField(default=list, blank=True)
    driver_notes = models.TextField(blank=True)
    
    def __str__(self):
        return self.name
