"""
Enterprise-Grade Permission System
===================================
Implements Zero Trust, RBAC, ABAC, and Method-Level Permissions
"""
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied


# ============================================================================
# ZERO TRUST: Base Permission (Deny-by-Default)
# ============================================================================
class DenyByDefault(permissions.BasePermission):
    """
    Deny all access by default. 
    All endpoints MUST explicitly specify permission classes.
    """
    message = "Access denied."
    
    def has_permission(self, request, view):
        return False
    
    def has_object_permission(self, request, view, obj):
        return False


# ============================================================================
# RBAC: Role-Based Access Control
# ============================================================================
class IsAuthenticated(permissions.BasePermission):
    """Require authentication (base requirement for all roles)"""
    message = "Access denied."
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(permissions.BasePermission):
    """Admin-only access"""
    message = "Access denied."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsManager(permissions.BasePermission):
    """Manager or Admin access"""
    message = "Access denied."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'manager']
        )


class IsClient(permissions.BasePermission):
    """Client, Manager, or Admin access"""
    message = "Access denied."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'manager', 'client']
        )


class IsDriver(permissions.BasePermission):
    """Driver, Manager, or Admin access"""
    message = "Access denied."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'manager', 'driver']
        )


# ============================================================================
# ABAC: Attribute-Based / Object-Level Permissions
# ============================================================================
class IsOwner(permissions.BasePermission):
    """
    Object-level permission: User can only access their own objects.
    Requires the model to have either:
    - 'user' field (ForeignKey to User)
    - 'client' field (ForeignKey to User) 
    - 'owner' field (ForeignKey to User)
    """
    message = "Access denied."
    
    def has_object_permission(self, request, view, obj):
        # Admin always has access
        if request.user.role == 'admin':
            return True
        
        # Check various ownership fields
        owner = None
        if hasattr(obj, 'user'):
            owner = obj.user
        elif hasattr(obj, 'client'):
            owner = obj.client
        elif hasattr(obj, 'owner'):
            owner = obj.owner
        
        # Verify owner matches authenticated user
        return owner is not None and owner.id == request.user.id


class IsShipmentOwner(permissions.BasePermission):
    """Specific permission for Shipment objects"""
    message = "Access denied."
    
    def has_object_permission(self, request, view, obj):
        # Admin/Manager can access all
        if request.user.role in ['admin', 'manager']:
            return True
        
        # Client can access their own shipments
        if request.user.role == 'client':
            return obj.client and obj.client.id == request.user.id
        
        # Driver can access shipments on their routes
        if request.user.role == 'driver':
            return obj.route and obj.route.driver and obj.route.driver.user.id == request.user.id
        
        return False


class IsRouteDriver(permissions.BasePermission):
    """Driver can only modify their assigned routes"""
    message = "Access denied."
    
    def has_object_permission(self, request, view, obj):
        # Admin/Manager can access all
        if request.user.role in ['admin', 'manager']:
            return True
        
        # Driver can only access their own routes
        if request.user.role == 'driver':
            return (
                hasattr(obj, 'driver') and 
                obj.driver and 
                hasattr(obj.driver, 'user') and
                obj.driver.user.id == request.user.id
            )
        
        return False


# ============================================================================
# METHOD-LEVEL PERMISSIONS: Logic-Method Decoupling
# ============================================================================
class ReadOnly(permissions.BasePermission):
    """Allow only safe methods (GET, HEAD, OPTIONS)"""
    message = "Access denied."
    
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class IsManagerOrReadOnly(permissions.BasePermission):
    """
    Read access for authenticated users.
    Write access only for managers/admins.
    """
    message = "Access denied."
    
    def has_permission(self, request, view):
        # Unauthenticated users: no access
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Safe methods: any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write methods: manager or admin only
        return request.user.role in ['admin', 'manager']


class ClientCanCreateOnly(permissions.BasePermission):
    """
    Clients can create (POST) but not modify (PUT/PATCH/DELETE).
    Managers can do everything.
    """
    message = "Access denied."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admin/Manager: full access
        if request.user.role in ['admin', 'manager']:
            return True
        
        # Client: can only POST (create)
        if request.user.role == 'client':
            return request.method == 'POST'
        
        return False


class DriverCanUpdateStatusOnly(permissions.BasePermission):
    """
    Drivers can only PATCH specific fields (status updates).
    Cannot create or delete.
    """
    message = "Access denied."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admin/Manager: full access
        if request.user.role in ['admin', 'manager']:
            return True
        
        # Driver: only PATCH allowed
        if request.user.role == 'driver':
            return request.method == 'PATCH'
        
        return False


# ============================================================================
# COMPOSITE PERMISSIONS: Combining Multiple Rules
# ============================================================================
class IsManagerOrOwner(permissions.BasePermission):
    """Manager can access all, others only their own objects"""
    message = "Access denied."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Manager/Admin: full access
        if request.user.role in ['admin', 'manager']:
            return True
        
        # Check ownership
        owner = None
        if hasattr(obj, 'user'):
            owner = obj.user
        elif hasattr(obj, 'client'):
            owner = obj.client
        elif hasattr(obj, 'owner'):
            owner = obj.owner
        
        return owner is not None and owner.id == request.user.id
