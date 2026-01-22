"""
Custom Exception Handler for Secure 403 Responses
==================================================
Ensures consistent, non-leaky error messages
"""
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import PermissionDenied, NotAuthenticated
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Custom exception handler that:
    1. Returns standard 403 for all permission errors
    2. Does not leak information about why access was denied
    3. Logs security events for auditing
    """
    # Call REST framework's default exception handler first
    response = drf_exception_handler(exc, context)
    
    # Handle permission-related exceptions
    if isinstance(exc, (PermissionDenied, NotAuthenticated)):
        # Log the security event (for admin auditing)
        request = context.get('request')
        if request:
            user = getattr(request, 'user', None)
            path = getattr(request, 'path', 'unknown')
            method = getattr(request, 'method', 'unknown')
            
            # Log audit event
            try:
                from .audit import AuditLog, get_client_ip
                AuditLog.log(
                    action='permission_denied',
                    user=user if user and user.is_authenticated else None,
                    resource_type=context.get('view').__class__.__name__ if context.get('view') else '',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    endpoint=path,
                    http_method=method,
                    severity='medium',
                    success=False,
                    error_message=str(exc)
                )
            except Exception as e:
                # Don't let logging errors break the response
                print(f"[AUDIT LOG ERROR] {e}")
            
            # Console log format: [SECURITY] user_id | method | path | exception_type
            user_id = getattr(user, 'id', 'anonymous')
            print(f"[SECURITY] {user_id} | {method} | {path} | {exc.__class__.__name__}")
        
        # Return generic 403 response (no details leaked)
        return Response(
            {"detail": "Access denied."},
            status=403
        )
    
    return response
