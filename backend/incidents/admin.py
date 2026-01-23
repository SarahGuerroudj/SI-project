from django.contrib import admin
from .models import Incident

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('type', 'date', 'resolved', 'driver', 'vehicle')
    list_filter = ('type', 'resolved', 'date')
    search_fields = ('description',)
