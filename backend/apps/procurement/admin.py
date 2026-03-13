import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import PurchaseOrder, PurchaseOrderItem, PurchaseInvoice


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1
    fields = ('product', 'quantity', 'unit_price', 'total', 'received_quantity')
    readonly_fields = ('total',)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = (
        'po_number', 'supplier', 'status_badge', 'order_date',
        'expected_date', 'total', 'created_by', 'created_at'
    )
    list_filter = ('status', 'order_date', 'supplier')
    search_fields = ('po_number', 'supplier__name', 'created_by__email')
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'order_date'
    inlines = [PurchaseOrderItemInline]
    actions = ['export_csv', 'mark_sent', 'mark_confirmed', 'mark_received', 'mark_cancelled']

    fieldsets = (
        ('Informasi PO', {
            'fields': ('po_number', 'supplier', 'created_by', 'status')
        }),
        ('Tanggal', {
            'fields': ('order_date', 'expected_date')
        }),
        ('Nilai', {
            'fields': ('subtotal', 'tax', 'total')
        }),
        ('Catatan', {
            'fields': ('notes',)
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    STATUS_COLORS = {
        'draft': '#888',
        'sent': '#1565c0',
        'confirmed': '#f57c00',
        'received': '#2e7d32',
        'cancelled': '#c62828',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def _bulk_status(self, request, queryset, status, label):
        updated = queryset.update(status=status)
        self.message_user(request, f'{updated} PO diubah ke {label}.')

    def mark_sent(self, request, queryset):
        self._bulk_status(request, queryset, 'sent', 'Sent')
    mark_sent.short_description = 'Ubah ke Sent'

    def mark_confirmed(self, request, queryset):
        self._bulk_status(request, queryset, 'confirmed', 'Confirmed')
    mark_confirmed.short_description = 'Ubah ke Confirmed'

    def mark_received(self, request, queryset):
        self._bulk_status(request, queryset, 'received', 'Received')
    mark_received.short_description = 'Ubah ke Received'

    def mark_cancelled(self, request, queryset):
        self._bulk_status(request, queryset, 'cancelled', 'Cancelled')
    mark_cancelled.short_description = 'Ubah ke Cancelled'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="purchase_orders_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'No PO', 'Supplier', 'Status', 'Tanggal Order',
            'Tanggal Estimasi', 'Subtotal', 'Pajak', 'Total', 'Dibuat Oleh'
        ])
        for po in queryset:
            writer.writerow([
                po.po_number, po.supplier.name, po.get_status_display(),
                po.order_date, po.expected_date or '',
                po.subtotal, po.tax, po.total,
                po.created_by.email if po.created_by else ''
            ])
        return response
    export_csv.short_description = 'Export CSV PO terpilih'


@admin.register(PurchaseInvoice)
class PurchaseInvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number', 'supplier', 'purchase_order', 'status_badge',
        'total_amount', 'paid_amount', 'remaining', 'due_date'
    )
    list_filter = ('status', 'issue_date', 'due_date')
    search_fields = ('invoice_number', 'supplier__name', 'purchase_order__po_number')
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at',)
    date_hierarchy = 'issue_date'
    actions = ['export_csv', 'mark_paid', 'mark_overdue']

    STATUS_COLORS = {
        'unpaid': '#f57c00',
        'paid': '#2e7d32',
        'overdue': '#c62828',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def remaining(self, obj):
        val = obj.total_amount - obj.paid_amount
        color = 'red' if val > 0 else 'green'
        return format_html('<span style="color:{};">Rp {:,.0f}</span>', color, val)
    remaining.short_description = 'Sisa Tagihan'

    def mark_paid(self, request, queryset):
        updated = queryset.update(status='paid')
        self.message_user(request, f'{updated} invoice pembelian ditandai Lunas.')
    mark_paid.short_description = 'Tandai Lunas'

    def mark_overdue(self, request, queryset):
        updated = queryset.update(status='overdue')
        self.message_user(request, f'{updated} invoice pembelian ditandai Jatuh Tempo.')
    mark_overdue.short_description = 'Tandai Jatuh Tempo'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="purchase_invoices_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'No Invoice', 'Supplier', 'No PO', 'Status',
            'Total', 'Dibayar', 'Sisa', 'Jatuh Tempo'
        ])
        for inv in queryset:
            writer.writerow([
                inv.invoice_number, inv.supplier.name,
                inv.purchase_order.po_number, inv.get_status_display(),
                inv.total_amount, inv.paid_amount,
                inv.total_amount - inv.paid_amount, inv.due_date
            ])
        return response
    export_csv.short_description = 'Export CSV invoice pembelian terpilih'
