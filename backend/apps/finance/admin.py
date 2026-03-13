import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import Account, Transaction, Expense


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'account_type_badge', 'transaction_count', 'is_active')
    list_filter = ('account_type', 'is_active')
    search_fields = ('code', 'name', 'description')
    list_editable = ('is_active',)
    ordering = ('code',)
    list_per_page = 25
    readonly_fields = ('created_at',)
    actions = ['export_csv']

    TYPE_COLORS = {
        'asset': '#1565c0',
        'liability': '#6a1b9a',
        'equity': '#00695c',
        'revenue': '#2e7d32',
        'expense': '#c62828',
    }

    def account_type_badge(self, obj):
        color = self.TYPE_COLORS.get(obj.account_type, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_account_type_display()
        )
    account_type_badge.short_description = 'Tipe Akun'

    def transaction_count(self, obj):
        return obj.transactions.count()
    transaction_count.short_description = 'Transaksi'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="accounts_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Kode', 'Nama', 'Tipe', 'Deskripsi', 'Aktif'])
        for a in queryset:
            writer.writerow([a.code, a.name, a.get_account_type_display(), a.description, 'Ya' if a.is_active else 'Tidak'])
        return response
    export_csv.short_description = 'Export CSV akun terpilih'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'reference', 'transaction_type_badge', 'account',
        'amount_colored', 'transaction_date', 'created_by'
    )
    list_filter = ('transaction_type', 'transaction_date', 'account')
    search_fields = ('reference', 'description', 'account__name', 'created_by__email')
    ordering = ('-transaction_date',)
    list_per_page = 25
    readonly_fields = ('created_at',)
    date_hierarchy = 'transaction_date'
    actions = ['export_csv']

    TYPE_COLORS = {
        'income': '#2e7d32',
        'expense': '#c62828',
        'transfer': '#1565c0',
    }

    def transaction_type_badge(self, obj):
        color = self.TYPE_COLORS.get(obj.transaction_type, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_transaction_type_display()
        )
    transaction_type_badge.short_description = 'Tipe'

    def amount_colored(self, obj):
        if obj.transaction_type == 'income':
            return format_html('<span style="color:green;font-weight:bold;">+Rp {:,.0f}</span>', obj.amount)
        elif obj.transaction_type == 'expense':
            return format_html('<span style="color:red;font-weight:bold;">-Rp {:,.0f}</span>', obj.amount)
        return format_html('<span>Rp {:,.0f}</span>', obj.amount)
    amount_colored.short_description = 'Jumlah'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Referensi', 'Tipe', 'Akun', 'Jumlah', 'Deskripsi', 'Tanggal', 'Dibuat Oleh'])
        for t in queryset:
            writer.writerow([
                t.reference, t.get_transaction_type_display(),
                t.account.name, t.amount, t.description,
                t.transaction_date, t.created_by.email if t.created_by else ''
            ])
        return response
    export_csv.short_description = 'Export CSV transaksi terpilih'


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'category', 'amount', 'status_badge',
        'expense_date', 'submitted_by', 'created_at'
    )
    list_filter = ('status', 'category', 'expense_date')
    search_fields = ('title', 'category', 'description', 'submitted_by__email')
    ordering = ('-expense_date',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'expense_date'
    actions = ['export_csv', 'mark_approved', 'mark_rejected', 'mark_paid']

    fieldsets = (
        ('Informasi Pengeluaran', {
            'fields': ('title', 'category', 'account', 'amount', 'expense_date', 'status')
        }),
        ('Detail', {
            'fields': ('description', 'submitted_by')
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    STATUS_COLORS = {
        'pending': '#f57c00',
        'approved': '#1565c0',
        'rejected': '#c62828',
        'paid': '#2e7d32',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def mark_approved(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f'{updated} pengeluaran disetujui.')
    mark_approved.short_description = 'Setujui pengeluaran terpilih'

    def mark_rejected(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} pengeluaran ditolak.')
    mark_rejected.short_description = 'Tolak pengeluaran terpilih'

    def mark_paid(self, request, queryset):
        updated = queryset.update(status='paid')
        self.message_user(request, f'{updated} pengeluaran ditandai Dibayar.')
    mark_paid.short_description = 'Tandai Dibayar'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expenses_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Judul', 'Kategori', 'Jumlah', 'Status', 'Tanggal', 'Diajukan Oleh'])
        for e in queryset:
            writer.writerow([
                e.title, e.category, e.amount, e.get_status_display(),
                e.expense_date, e.submitted_by.email if e.submitted_by else ''
            ])
        return response
    export_csv.short_description = 'Export CSV pengeluaran terpilih'
