from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('plate', 'model', 'capacity_kg', 'status')
    list_filter = ('status',)
    search_fields = ('plate', 'model')
