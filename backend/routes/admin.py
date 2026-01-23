from django.contrib import admin
from .models import Route

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'vehicle', 'date', 'status')
    list_filter = ('status', 'date')
    search_fields = ('driver__user__username', 'vehicle__plate')
