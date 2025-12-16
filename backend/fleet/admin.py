from django.contrib import admin
from .models import Vehicle, Driver, Incident

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('plate', 'model', 'capacity_kg', 'status')
    list_filter = ('status',)
    search_fields = ('plate', 'model')

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'status')
    list_filter = ('status',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'license_number')

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('type', 'date', 'resolved', 'driver', 'vehicle')
    list_filter = ('type', 'resolved', 'date')
    search_fields = ('description', 'related_entity_id')
    date_hierarchy = 'date'
