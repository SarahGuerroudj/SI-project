from django.contrib import admin
from .models import Complaint, ComplaintItem

class ComplaintItemInline(admin.TabularInline):
    model = ComplaintItem
    extra = 1

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'date', 'status', 'priority')
    list_filter = ('status', 'priority', 'date')
    search_fields = ('client__username', 'description')
    inlines = [ComplaintItemInline]
