from django.db import models
from django.conf import settings

class Driver(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='Available')
    
    def __str__(self):
        return self.user.get_full_name() or self.user.username
