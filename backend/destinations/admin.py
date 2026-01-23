from django.contrib import admin
from .models import Destination

@admin.register(Destination)
class DestinationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'country', 'type', 'destination_type', 'is_active')
    list_filter = ('type', 'destination_type', 'is_active')
    search_fields = ('name', 'city', 'country')
