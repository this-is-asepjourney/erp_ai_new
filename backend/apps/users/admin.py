import csv
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 'username', 'full_name', 'role', 'is_active',
        'is_staff', 'created_at'
    )
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone')
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')
    actions = ['export_csv', 'activate_users', 'deactivate_users']

    fieldsets = (
        ('Akun', {
            'fields': ('email', 'username', 'password')
        }),
        ('Informasi Pribadi', {
            'fields': ('first_name', 'last_name', 'phone', 'avatar')
        }),
        ('Hak Akses', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at', 'last_login', 'date_joined'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        ('Buat User Baru', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )

    def full_name(self, obj):
        return obj.get_full_name() or '-'
    full_name.short_description = 'Nama Lengkap'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Email', 'Username', 'Nama Depan', 'Nama Belakang', 'Role', 'Telepon', 'Aktif', 'Terdaftar'])
        for u in queryset:
            writer.writerow([
                u.email, u.username, u.first_name, u.last_name,
                u.role, u.phone, 'Ya' if u.is_active else 'Tidak',
                u.date_joined.strftime('%Y-%m-%d')
            ])
        return response
    export_csv.short_description = 'Export CSV user terpilih'

    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user diaktifkan.')
    activate_users.short_description = 'Aktifkan user terpilih'

    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user dinonaktifkan.')
    deactivate_users.short_description = 'Nonaktifkan user terpilih'
