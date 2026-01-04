from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Destination, ServiceType, Shipment, Route, PricingRule
from .serializers import DestinationSerializer, ServiceTypeSerializer, ShipmentSerializer, RouteSerializer, PricingRuleSerializer

class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer

class ServiceTypeViewSet(viewsets.ModelViewSet):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

class PricingRuleViewSet(viewsets.ModelViewSet):
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['service_type', 'destination', 'is_active']
    search_fields = ['destination__name', 'destination__city']
    ordering_fields = ['base_price', 'destination']
