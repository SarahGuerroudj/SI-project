from django.db import models
from django.conf import settings

class Complaint(models.Model):
    STATUS_CHOICES = (
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    )
    
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    )
    
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='complaints')
    description = models.TextField()
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Complaint {self.id} - {self.client.username}"

class ComplaintItem(models.Model):
    TYPE_CHOICES = (
        ('shipment', 'Shipment'),
        ('invoice', 'Invoice'),
        ('service', 'Service'),
    )
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='related_items')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    entity_id = models.CharField(max_length=50, blank=True) # Loose coupling
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.type} {self.entity_id} for {self.complaint}"
