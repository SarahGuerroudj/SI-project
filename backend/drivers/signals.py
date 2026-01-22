from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Driver

@receiver(post_delete, sender=Driver)
def delete_driver_user(sender, instance, **kwargs):
    """
    When a Driver profile is deleted, delete the associated User account.
    """
    if instance.user:
        instance.user.delete()
