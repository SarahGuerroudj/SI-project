from django.db import models

class PricingRule(models.Model):
    service_type = models.ForeignKey('service_types.ServiceType', on_delete=models.CASCADE, related_name='pricing_rules')
    destination = models.ForeignKey('destinations.Destination', on_delete=models.CASCADE, related_name='pricing_rules')
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('service_type', 'destination')

    def __str__(self):
        return f"{self.service_type} -> {self.destination} ({self.base_price} DZD)"
