from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Client

@receiver(post_delete, sender=Client)
def delete_client_user(sender, instance, **kwargs):
    """
    When a Client profile is deleted, delete the associated User account.
    """
    if instance.user:
        instance.user.delete()
