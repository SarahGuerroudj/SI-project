from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from drivers.models import Driver
from clients.models import Client

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Auto-create related profiles based on user role when a User is created.
    """
    if created:
        if instance.role == 'driver':
            Driver.objects.get_or_create(user=instance, defaults={
                'license_number': 'PENDING',
                'status': 'Available'
            })
        elif instance.role == 'client':
            Client.objects.get_or_create(user=instance, defaults={
                'client_type': 'Individual', # Default to Individual
            })

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Ensure profile is saved when user is saved (if anything needs syncing)
    """
    if instance.role == 'driver' and hasattr(instance, 'driver_profile'):
        instance.driver_profile.save()
    elif instance.role == 'client' and hasattr(instance, 'client_profile'):
        instance.client_profile.save()
