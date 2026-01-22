from django.db import models

class Route(models.Model):
    STATUS_CHOICES = (
        ('Planned', 'Planned'),
        ('Active', 'Active'),
        ('Completed', 'Completed'),
    )
    
    driver = models.ForeignKey('drivers.Driver', on_delete=models.CASCADE, related_name='routes')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='routes')
    shipments = models.ManyToManyField('shipments.Shipment', related_name='routes')
    date = models.DateField()
    actual_distance_km = models.FloatField(null=True, blank=True)
    actual_duration_hours = models.FloatField(null=True, blank=True)
    fuel_consumed_liters = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planned')
    
    def __str__(self):
        return f"Route {self.id} - {self.driver}"
