import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import Department, Employee, Attendance, Payroll, Performance


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'employee_count')
    search_fields = ('name', 'description')
    ordering = ('name',)
    list_per_page = 25

    def employee_count(self, obj):
        return obj.employees.count()
    employee_count.short_description = 'Jumlah Karyawan'


class AttendanceInline(admin.TabularInline):
    model = Attendance
    extra = 0
    fields = ('date', 'check_in', 'check_out', 'status', 'notes')
    ordering = ('-date',)
    max_num = 10


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id', 'full_name', 'department', 'position',
        'status_badge', 'hire_date', 'salary'
    )
    list_filter = ('status', 'department', 'hire_date')
    search_fields = ('employee_id', 'first_name', 'last_name', 'email', 'position')
    ordering = ('employee_id',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    inlines = [AttendanceInline]
    actions = ['export_csv', 'mark_active', 'mark_inactive', 'mark_terminated']

    fieldsets = (
        ('Informasi Karyawan', {
            'fields': ('employee_id', 'user', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Pekerjaan', {
            'fields': ('department', 'position', 'hire_date', 'salary', 'status')
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    STATUS_COLORS = {
        'active': '#2e7d32',
        'inactive': '#f57c00',
        'terminated': '#c62828',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def mark_active(self, request, queryset):
        updated = queryset.update(status='active')
        self.message_user(request, f'{updated} karyawan diaktifkan.')
    mark_active.short_description = 'Aktifkan karyawan terpilih'

    def mark_inactive(self, request, queryset):
        updated = queryset.update(status='inactive')
        self.message_user(request, f'{updated} karyawan dinonaktifkan.')
    mark_inactive.short_description = 'Nonaktifkan karyawan terpilih'

    def mark_terminated(self, request, queryset):
        updated = queryset.update(status='terminated')
        self.message_user(request, f'{updated} karyawan diberhentikan.')
    mark_terminated.short_description = 'Berhentikan karyawan terpilih'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="employees_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'ID Karyawan', 'Nama Depan', 'Nama Belakang', 'Email', 'Telepon',
            'Departemen', 'Jabatan', 'Tanggal Bergabung', 'Gaji', 'Status'
        ])
        for e in queryset:
            writer.writerow([
                e.employee_id, e.first_name, e.last_name, e.email, e.phone,
                e.department.name if e.department else '',
                e.position, e.hire_date, e.salary, e.get_status_display()
            ])
        return response
    export_csv.short_description = 'Export CSV karyawan terpilih'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        'employee', 'date', 'check_in', 'check_out', 'status_badge', 'notes'
    )
    list_filter = ('status', 'date', 'employee__department')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__employee_id')
    ordering = ('-date',)
    list_per_page = 25
    date_hierarchy = 'date'
    actions = ['export_csv']

    STATUS_COLORS = {
        'present': '#2e7d32',
        'absent': '#c62828',
        'late': '#f57c00',
        'half_day': '#1565c0',
        'leave': '#6a1b9a',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="attendance_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID Karyawan', 'Nama', 'Tanggal', 'Check In', 'Check Out', 'Status', 'Catatan'])
        for a in queryset:
            writer.writerow([
                a.employee.employee_id, a.employee.full_name,
                a.date, a.check_in or '', a.check_out or '',
                a.get_status_display(), a.notes
            ])
        return response
    export_csv.short_description = 'Export CSV absensi terpilih'


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = (
        'employee', 'period_start', 'period_end',
        'basic_salary', 'allowances', 'deductions', 'net_salary', 'status_badge'
    )
    list_filter = ('status', 'period_start')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__employee_id')
    ordering = ('-period_start',)
    list_per_page = 25
    readonly_fields = ('created_at',)
    date_hierarchy = 'period_start'
    actions = ['export_csv', 'mark_processed', 'mark_paid']

    STATUS_COLORS = {
        'draft': '#888',
        'processed': '#1565c0',
        'paid': '#2e7d32',
    }

    def status_badge(self, obj):
        color = self.STATUS_COLORS.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def mark_processed(self, request, queryset):
        updated = queryset.update(status='processed')
        self.message_user(request, f'{updated} payroll diproses.')
    mark_processed.short_description = 'Proses payroll terpilih'

    def mark_paid(self, request, queryset):
        updated = queryset.update(status='paid')
        self.message_user(request, f'{updated} payroll ditandai Dibayar.')
    mark_paid.short_description = 'Tandai Dibayar'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="payroll_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'Karyawan', 'Periode Awal', 'Periode Akhir',
            'Gaji Pokok', 'Tunjangan', 'Potongan', 'Gaji Bersih', 'Status'
        ])
        for p in queryset:
            writer.writerow([
                p.employee.full_name, p.period_start, p.period_end,
                p.basic_salary, p.allowances, p.deductions, p.net_salary,
                p.get_status_display()
            ])
        return response
    export_csv.short_description = 'Export CSV payroll terpilih'


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = (
        'employee', 'review_period', 'score_badge', 'reviewer', 'created_at'
    )
    list_filter = ('review_period', 'created_at')
    search_fields = ('employee__first_name', 'employee__last_name', 'review_period')
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at',)
    actions = ['export_csv']

    def score_badge(self, obj):
        score = float(obj.score)
        if score >= 85:
            color = '#2e7d32'
            label = 'Sangat Baik'
        elif score >= 70:
            color = '#1565c0'
            label = 'Baik'
        elif score >= 55:
            color = '#f57c00'
            label = 'Cukup'
        else:
            color = '#c62828'
            label = 'Perlu Perbaikan'
        return format_html(
            '<span style="color:{}; font-weight:bold;">{} ({})</span>',
            color, score, label
        )
    score_badge.short_description = 'Skor'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="performance_export.csv"'
        writer = csv.writer(response)
        writer.writerow(['Karyawan', 'Periode Review', 'Skor', 'Reviewer', 'Catatan'])
        for p in queryset:
            writer.writerow([
                p.employee.full_name, p.review_period, p.score,
                p.reviewer.get_full_name() if p.reviewer else '', p.notes
            ])
        return response
    export_csv.short_description = 'Export CSV penilaian terpilih'
