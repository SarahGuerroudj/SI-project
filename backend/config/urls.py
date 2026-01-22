from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import UserViewSet, AuditLogViewSet
from destinations.views import DestinationViewSet
from service_types.views import ServiceTypeViewSet
from shipments.views import ShipmentViewSet
from routes.views import RouteViewSet
from pricing.views import PricingRuleViewSet
from vehicles.views import VehicleViewSet
from drivers.views import DriverViewSet
from incidents.views import IncidentViewSet
from billing.views import InvoiceViewSet, PaymentRecordViewSet
from complaints.views import ComplaintViewSet
from clients.views import ClientViewSet

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'users', UserViewSet)
router.register(r'destinations', DestinationViewSet)
router.register(r'service-types', ServiceTypeViewSet)
router.register(r'shipments', ShipmentViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'drivers', DriverViewSet)
router.register(r'incidents', IncidentViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'payments', PaymentRecordViewSet)
router.register(r'complaints', ComplaintViewSet)
router.register(r'pricing-rules', PricingRuleViewSet)
router.register(r'clients', ClientViewSet)

from django.http import JsonResponse

def root_view(request):
    return JsonResponse({
        "status": "running", 
        "message": "Logimaster Pro Backend API",
        "endpoints": "/api/v1/"
    })

from users.views import EmailTokenObtainPairView, RegisterView
from users.google_auth import GoogleAuthView

urlpatterns = [
    path('', root_view),
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/register/', RegisterView.as_view(), name='register'),
    path('api/v1/auth/google/', GoogleAuthView.as_view(), name='google_auth'),
]
