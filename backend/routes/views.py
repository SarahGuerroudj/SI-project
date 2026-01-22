from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Route
from .serializers import RouteSerializer
from users.permissions import IsManager, IsDriver, IsRouteDriver, DriverCanUpdateStatusOnly
from users.audit import AuditLogMixin

class RouteViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Routes with role-specific access:
    - Admin/Manager: Full CRUD
    - Driver: Read own routes, update status only
    """
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsManager()]
        elif self.action in ['update', 'partial_update']:
            return [DriverCanUpdateStatusOnly()]
        return [IsDriver()]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['admin', 'manager']:
            return Route.objects.all()
        elif user.role == 'driver':
            from drivers.models import Driver as DriverModel
            try:
                driver = DriverModel.objects.get(user=user)
                return Route.objects.filter(driver=driver)
            except DriverModel.DoesNotExist:
                return Route.objects.none()
        
        return Route.objects.none()
    
    def check_object_permissions(self, request, obj):
        if not IsRouteDriver().has_object_permission(request, self, obj):
            self.permission_denied(
                request,
                message="Access denied."
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsDriver])
    def complete_delivery(self, request, pk=None):
        route = self.get_object()
        
        if not IsRouteDriver().has_object_permission(request, self, route):
            return Response(
                {"detail": "Access denied."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        route.status = 'Completed'
        
        if 'actual_distance_km' in request.data:
            route.actual_distance_km = request.data['actual_distance_km']
        if 'actual_duration_hours' in request.data:
            route.actual_duration_hours = request.data['actual_duration_hours']
        if 'fuel_consumed_liters' in request.data:
            route.fuel_consumed_liters = request.data['fuel_consumed_liters']
        
        route.save()
        
        for shipment in route.shipments.all():
            shipment.status = 'Delivered'
            shipment.save()
        
        return Response(
            RouteSerializer(route).data,
            status=status.HTTP_200_OK
        )
