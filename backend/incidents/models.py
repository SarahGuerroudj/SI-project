from django.db import models

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
    photo = models.ImageField(upload_to='incidents/photos/', blank=True, null=True)
    attachment = models.FileField(upload_to='incidents/docs/', blank=True, null=True)
    resolved = models.BooleanField(default=False)
    
    driver = models.ForeignKey('drivers.Driver', on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.date}"
