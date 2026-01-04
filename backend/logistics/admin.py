from django.contrib import admin
from .models import Destination, ServiceType, Shipment, Route, PricingRule

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'country', 'type', 'is_active')
    list_filter = ('type', 'is_active', 'country')
    search_fields = ('name', 'city', 'country')

@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'base_price', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'destination', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('client__username', 'destination__name')
    date_hierarchy = 'created_at'

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'vehicle', 'date', 'status')
    list_filter = ('status', 'date')
    search_fields = ('driver__user__username', 'vehicle__plate')
    date_hierarchy = 'date'

@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ('service_type', 'destination', 'base_price', 'is_active')
    list_filter = ('service_type', 'is_active')
    search_fields = ('destination__name', 'destination__city', 'service_type__name')
