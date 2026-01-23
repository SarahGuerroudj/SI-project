from django.contrib import admin
from .models import PricingRule

@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ('service_type', 'destination', 'base_price', 'is_active')
    list_filter = ('is_active', 'service_type', 'destination')
