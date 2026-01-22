from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import PricingRule
from .serializers import PricingRuleSerializer
from users.permissions import IsManager
from users.audit import AuditLogMixin

class PricingRuleViewSet(AuditLogMixin, viewsets.ModelViewSet):
    """
    Pricing Rules: Manager-only access for modifications
    """
    queryset = PricingRule.objects.all()
    serializer_class = PricingRuleSerializer
    permission_classes = [IsManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['service_type', 'destination', 'is_active']
    search_fields = ['destination__name', 'destination__city']
    ordering_fields = ['base_price', 'destination']
