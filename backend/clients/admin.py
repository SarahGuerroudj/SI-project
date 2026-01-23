from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('user', 'client_type', 'company_name')
    list_filter = ('client_type',)
    search_fields = ('user__username', 'company_name')
