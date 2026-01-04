from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import UserViewSet
from logistics.views import DestinationViewSet, ServiceTypeViewSet, ShipmentViewSet, RouteViewSet, PricingRuleViewSet
from fleet.views import VehicleViewSet, DriverViewSet, IncidentViewSet
from billing.views import InvoiceViewSet, PaymentRecordViewSet
from support.views import ComplaintViewSet

router = DefaultRouter()
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
