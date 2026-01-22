"""
Audit Logging System
====================
Track security events, permission denials, and sensitive actions
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class AuditLog(models.Model):
    """
    Comprehensive audit trail for security and compliance
    """
    ACTION_CHOICES = [
        ('permission_denied', 'Permission Denied'),
        ('role_changed', 'Role Changed'),
        ('manager_created', 'Manager Created'),
        ('login_success', 'Login Success'),
        ('login_failed', 'Login Failed'),
        ('logout', 'Logout'),
        ('resource_created', 'Resource Created'),
        ('resource_updated', 'Resource Updated'),
        ('resource_deleted', 'Resource Deleted'),
        ('password_changed', 'Password Changed'),
        ('2fa_enabled', '2FA Enabled'),
        ('2fa_disabled', '2FA Disabled'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Who
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    username = models.CharField(max_length=255, blank=True)  # Store even if user deleted
    
    # What
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100, blank=True)
    resource_id = models.CharField(max_length=100, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='low')
    
    # Where
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    endpoint = models.CharField(max_length=255, blank=True)
    http_method = models.CharField(max_length=10, blank=True)
    
    # When
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    
    # Additional details (JSON for flexibility)
    details = models.JSONField(default=dict, blank=True)
    
    # Success/failure
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp', 'user']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['severity', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.username or 'Anonymous'} - {self.action} - {self.timestamp}"
    
    @classmethod
    def log(cls, action, user=None, resource_type='', resource_id='', 
            ip_address=None, user_agent='', endpoint='', http_method='',
            severity='low', success=True, error_message='', **details):
        """
        Convenience method for creating audit logs
        """
        return cls.objects.create(
            user=user,
            username=user.username if user else 'Anonymous',
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
            http_method=http_method,
            severity=severity,
            success=success,
            error_message=error_message,
            details=details
        )


def get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class AuditLogMixin:
    """
    Mixin for ViewSets to automatically log CRUD operations with data diffs.
    """
    audit_resource_type = None

    def get_audit_resource_type(self):
        if self.audit_resource_type:
            return self.audit_resource_type
        return self.queryset.model.__name__

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.log(
            action='resource_created',
            user=self.request.user if self.request.user.is_authenticated else None,
            resource_type=self.get_audit_resource_type(),
            resource_id=str(instance.id),
            ip_address=get_client_ip(self.request),
            severity='low',
            details=serializer.data
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        # Capture old data before saving
        from django.forms.models import model_to_dict
        old_data = model_to_dict(old_instance)
        
        instance = serializer.save()
        new_data = model_to_dict(instance)
        
        # Calculate diff
        diff = {}
        for field, value in new_data.items():
            if field in old_data and old_data[field] != value:
                # Convert decimal to string for JSON serialization
                from decimal import Decimal
                old_val = str(old_data[field]) if isinstance(old_data[field], Decimal) else old_data[field]
                new_val = str(value) if isinstance(value, Decimal) else value
                diff[field] = {
                    'before': old_val,
                    'after': new_val
                }

        AuditLog.log(
            action='resource_updated',
            user=self.request.user if self.request.user.is_authenticated else None,
            resource_type=self.get_audit_resource_type(),
            resource_id=str(instance.id),
            ip_address=get_client_ip(self.request),
            severity='low',
            details={
                'updated_fields': list(diff.keys()),
                'changes': diff
            }
        )

    def perform_destroy(self, instance):
        resource_id = str(instance.id)
        resource_type = self.get_audit_resource_type()
        
        # Capture some identifying info before deletion
        details = {}
        if hasattr(instance, 'name'): details['name'] = instance.name
        if hasattr(instance, 'username'): details['username'] = instance.username
        if hasattr(instance, 'plate'): details['plate'] = instance.plate
        
        instance.delete()
        
        AuditLog.log(
            action='resource_deleted',
            user=self.request.user if self.request.user.is_authenticated else None,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=get_client_ip(self.request),
            severity='medium',
            details=details
        )
