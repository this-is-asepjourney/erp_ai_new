import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import Customer, SalesOrder, SalesOrderItem, Invoice


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'order_count', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'email', 'phone')
    list_editable = ('is_active',)
    ordering = ('name',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    actions = ['export_csv']

    def order_count(self, obj):
        return obj.orders.count()
    order_count.short_description = 'Jumlah Order'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="customers_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Nama', 'Email', 'Telepon', 'Alamat', 'Aktif'])
        for c in queryset:
            writer.writerow([c.name, c.email, c.phone, c.address, 'Ya' if c.is_active else 'Tidak'])
        return response
    export_csv.short_description = 'Export CSV customer terpilih'


class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 1
    fields = ('product', 'quantity', 'unit_price', 'discount', 'total')
    readonly_fields = ('total',)


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'customer', 'status_badge', 'order_date',
        'total', 'created_by', 'created_at'
    )
    list_filter = ('status', 'order_date', 'created_at')
    search_fields = ('order_number', 'customer__name', 'created_by__email')
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'order_date'
    inlines = [SalesOrderItemInline]
    actions = ['export_csv', 'mark_confirmed', 'mark_processing', 'mark_delivered', 'mark_cancelled']

    fieldsets = (
        ('Informasi Order', {
            'fields': ('order_number', 'customer', 'created_by', 'status')
        }),
        ('Tanggal', {
            'fields': ('order_date', 'delivery_date')
        }),
        ('Nilai', {
            'fields': ('subtotal', 'discount', 'tax', 'total')
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
        'confirmed': '#1a73e8',
        'processing': '#f9a825',
        'shipped': '#7b1fa2',
        'delivered': '#2e7d32',
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
        self.message_user(request, f'{updated} order diubah ke {label}.')

    def mark_confirmed(self, request, queryset):
        self._bulk_status(request, queryset, 'confirmed', 'Confirmed')
    mark_confirmed.short_description = 'Ubah ke Confirmed'

    def mark_processing(self, request, queryset):
        self._bulk_status(request, queryset, 'processing', 'Processing')
    mark_processing.short_description = 'Ubah ke Processing'

    def mark_delivered(self, request, queryset):
        self._bulk_status(request, queryset, 'delivered', 'Delivered')
    mark_delivered.short_description = 'Ubah ke Delivered'

    def mark_cancelled(self, request, queryset):
        self._bulk_status(request, queryset, 'cancelled', 'Cancelled')
    mark_cancelled.short_description = 'Ubah ke Cancelled'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sales_orders_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'No Order', 'Customer', 'Status', 'Tanggal Order',
            'Subtotal', 'Diskon', 'Pajak', 'Total', 'Dibuat Oleh'
        ])
        for o in queryset:
            writer.writerow([
                o.order_number, o.customer.name, o.get_status_display(),
                o.order_date, o.subtotal, o.discount, o.tax, o.total,
                o.created_by.email if o.created_by else ''
            ])
        return response
    export_csv.short_description = 'Export CSV order terpilih'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number', 'customer', 'sales_order', 'status_badge',
        'total_amount', 'paid_amount', 'remaining', 'due_date'
    )
    list_filter = ('status', 'issue_date', 'due_date')
    search_fields = ('invoice_number', 'customer__name', 'sales_order__order_number')
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at',)
    date_hierarchy = 'issue_date'
    actions = ['export_csv', 'mark_paid', 'mark_overdue']

    STATUS_COLORS = {
        'unpaid': '#f57c00',
        'partial': '#1565c0',
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
        val = obj.remaining_amount
        color = 'red' if val > 0 else 'green'
        return format_html('<span style="color:{};">Rp {:,.0f}</span>', color, val)
    remaining.short_description = 'Sisa Tagihan'

    def mark_paid(self, request, queryset):
        updated = queryset.update(status='paid')
        self.message_user(request, f'{updated} invoice ditandai Lunas.')
    mark_paid.short_description = 'Tandai Lunas'

    def mark_overdue(self, request, queryset):
        updated = queryset.update(status='overdue')
        self.message_user(request, f'{updated} invoice ditandai Jatuh Tempo.')
    mark_overdue.short_description = 'Tandai Jatuh Tempo'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="invoices_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'No Invoice', 'Customer', 'No Order', 'Status',
            'Total', 'Dibayar', 'Sisa', 'Jatuh Tempo'
        ])
        for inv in queryset:
            writer.writerow([
                inv.invoice_number, inv.customer.name,
                inv.sales_order.order_number, inv.get_status_display(),
                inv.total_amount, inv.paid_amount, inv.remaining_amount, inv.due_date
            ])
        return response
    export_csv.short_description = 'Export CSV invoice terpilih'
