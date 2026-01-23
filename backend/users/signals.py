from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from drivers.models import Driver
from clients.models import Client

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatic profile creation removed to allow explicit creation via API.
    """
    pass

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Ensure profile is saved when user is saved (if anything needs syncing)
    """
    if instance.role == 'driver' and hasattr(instance, 'driver_profile'):
        instance.driver_profile.save()
    elif instance.role == 'client' and hasattr(instance, 'client_profile'):
        instance.client_profile.save()
