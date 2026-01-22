from django.db import models

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
