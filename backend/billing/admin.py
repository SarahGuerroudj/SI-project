from django.contrib import admin
from .models import Invoice, PaymentRecord

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'amount_ttc', 'status', 'date')
    list_filter = ('status', 'date')
    search_fields = ('client__username', 'client__email')
    date_hierarchy = 'date'

@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'amount', 'date', 'method')
    list_filter = ('method', 'date')
    search_fields = ('invoice__id',)
    date_hierarchy = 'date'
