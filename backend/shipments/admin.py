from django.contrib import admin
from .models import Shipment

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'destination', 'status', 'price', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('client__username', 'id')
    readonly_fields = ('created_at',)
