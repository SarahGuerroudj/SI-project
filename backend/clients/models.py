from django.db import models
from django.conf import settings

class Client(models.Model):
    CLIENT_TYPE_CHOICES = (
        ('Individual', 'Individual'),
        ('Company', 'Company'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='client_profile')
    client_type = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES, default='Individual')
    company_name = models.CharField(max_length=100, blank=True, null=True)
    tax_id = models.CharField(max_length=50, blank=True, null=True) # NIST/NIF
    website = models.URLField(blank=True, null=True)
    
    def __str__(self):
        if self.client_type == 'Company':
            return f"{self.company_name} (Company)"
        return f"{self.user.get_full_name() or self.user.username} (Individual)"
