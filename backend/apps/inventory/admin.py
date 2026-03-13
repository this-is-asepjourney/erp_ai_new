import csv
import io
from django.contrib import admin
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import HttpResponse
from django.utils.html import format_html
from .models import Category, Supplier, Warehouse, Product, StockMovement


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'product_count', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)
    list_per_page = 25

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Jumlah Produk'


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'contact_person', 'email', 'phone')
    list_editable = ('is_active',)
    ordering = ('name',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Informasi Supplier', {
            'fields': ('name', 'contact_person', 'email', 'phone', 'address', 'is_active')
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'location')
    list_editable = ('is_active',)
    ordering = ('name',)
    list_per_page = 25


class StockMovementInline(admin.TabularInline):
    model = StockMovement
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('movement_type', 'warehouse', 'quantity', 'reference', 'notes', 'created_at')
    ordering = ('-created_at',)
    max_num = 10


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'sku', 'name', 'category', 'supplier', 'stock_quantity',
        'minimum_stock', 'selling_price', 'stock_status', 'is_active'
    )
    list_filter = ('is_active', 'category', 'supplier')
    search_fields = ('sku', 'name', 'description')
    list_editable = ('is_active',)
    ordering = ('sku',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at', 'is_low_stock')
    inlines = [StockMovementInline]
    actions = ['export_csv', 'mark_active', 'mark_inactive']

    fieldsets = (
        ('Informasi Produk', {
            'fields': ('sku', 'name', 'description', 'category', 'supplier', 'unit', 'is_active')
        }),
        ('Harga', {
            'fields': ('cost_price', 'selling_price'),
        }),
        ('Stok', {
            'fields': ('stock_quantity', 'minimum_stock', 'reorder_quantity', 'is_low_stock'),
        }),
        ('Timestamp', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def stock_status(self, obj):
        if obj.is_low_stock:
            return format_html(
                '<span style="color:{};font-weight:bold;">&#9888; {}</span>',
                'red', 'Stok Rendah'
            )
        return format_html(
            '<span style="color:{};">&#10003; {}</span>',
            'green', 'Normal'
        )
    stock_status.short_description = 'Status Stok'

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="produk_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'SKU', 'Nama Produk', 'Kategori', 'Supplier', 'Satuan',
            'Harga Beli', 'Harga Jual', 'Stok', 'Stok Minimum', 'Qty Reorder', 'Aktif'
        ])
        for p in queryset:
            writer.writerow([
                p.sku, p.name,
                p.category.name if p.category else '',
                p.supplier.name if p.supplier else '',
                p.unit, p.cost_price, p.selling_price,
                p.stock_quantity, p.minimum_stock, p.reorder_quantity,
                'Ya' if p.is_active else 'Tidak'
            ])
        return response
    export_csv.short_description = 'Export CSV produk terpilih'

    def mark_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} produk diaktifkan.', messages.SUCCESS)
    mark_active.short_description = 'Aktifkan produk terpilih'

    def mark_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} produk dinonaktifkan.', messages.WARNING)
    mark_inactive.short_description = 'Nonaktifkan produk terpilih'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'import-stok/',
                self.admin_site.admin_view(self.import_stock_view),
                name='inventory_product_import_stok',
            ),
            path(
                'download-template/',
                self.admin_site.admin_view(self.download_template_view),
                name='inventory_product_download_template',
            ),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['import_url'] = 'import-stok/'
        extra_context['template_url'] = 'download-template/'
        return super().changelist_view(request, extra_context=extra_context)

    def download_template_view(self, request):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="template_import_stok.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'sku', 'name', 'description', 'category_name', 'supplier_name',
            'unit', 'cost_price', 'selling_price', 'stock_quantity',
            'minimum_stock', 'reorder_quantity', 'is_active'
        ])
        writer.writerow([
            'PRD-001', 'Contoh Produk', 'Deskripsi produk', 'Elektronik', 'PT Supplier ABC',
            'pcs', '50000', '75000', '100', '10', '50', 'true'
        ])
        writer.writerow([
            'PRD-002', 'Produk Kedua', 'Deskripsi produk kedua', 'Aksesoris', 'CV Supplier XYZ',
            'unit', '25000', '40000', '50', '5', '20', 'true'
        ])
        return response

    def import_stock_view(self, request):
        if request.method == 'POST':
            csv_file = request.FILES.get('csv_file')
            if not csv_file:
                self.message_user(request, 'Tidak ada file yang dipilih.', messages.ERROR)
                return redirect('..')
            if not csv_file.name.endswith('.csv'):
                self.message_user(request, 'File harus berformat CSV.', messages.ERROR)
                return redirect('..')

            try:
                decoded = csv_file.read().decode('utf-8-sig')
                reader = csv.DictReader(io.StringIO(decoded))
                created, updated, errors = 0, 0, []

                for i, row in enumerate(reader, start=2):
                    try:
                        sku = row.get('sku', '').strip()
                        if not sku:
                            errors.append(f'Baris {i}: SKU kosong, dilewati.')
                            continue

                        category = None
                        if row.get('category_name', '').strip():
                            category, _ = Category.objects.get_or_create(
                                name=row['category_name'].strip()
                            )

                        supplier = None
                        if row.get('supplier_name', '').strip():
                            supplier, _ = Supplier.objects.get_or_create(
                                name=row['supplier_name'].strip()
                            )

                        is_active_val = row.get('is_active', 'true').strip().lower()
                        is_active = is_active_val in ('true', '1', 'ya', 'yes', 'aktif')

                        defaults = {
                            'name': row.get('name', '').strip(),
                            'description': row.get('description', '').strip(),
                            'category': category,
                            'supplier': supplier,
                            'unit': row.get('unit', 'pcs').strip() or 'pcs',
                            'cost_price': float(row.get('cost_price', 0) or 0),
                            'selling_price': float(row.get('selling_price', 0) or 0),
                            'stock_quantity': int(row.get('stock_quantity', 0) or 0),
                            'minimum_stock': int(row.get('minimum_stock', 0) or 0),
                            'reorder_quantity': int(row.get('reorder_quantity', 0) or 0),
                            'is_active': is_active,
                        }

                        obj, was_created = Product.objects.update_or_create(
                            sku=sku, defaults=defaults
                        )
                        if was_created:
                            created += 1
                        else:
                            updated += 1

                    except Exception as e:
                        errors.append(f'Baris {i}: {str(e)}')

                msg = f'Import selesai: {created} produk baru, {updated} produk diperbarui.'
                self.message_user(request, msg, messages.SUCCESS)
                if errors:
                    for err in errors[:10]:
                        self.message_user(request, err, messages.WARNING)

            except Exception as e:
                self.message_user(request, f'Gagal membaca file: {str(e)}', messages.ERROR)

            return redirect('../')

        context = {
            **self.admin_site.each_context(request),
            'title': 'Import Stok Produk',
            'opts': self.model._meta,
        }
        return render(request, 'admin/inventory/product/import_stock.html', context)


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        'product', 'warehouse', 'movement_type', 'quantity', 'reference', 'created_at'
    )
    list_filter = ('movement_type', 'warehouse', 'created_at')
    search_fields = ('product__name', 'product__sku', 'reference', 'notes')
    ordering = ('-created_at',)
    list_per_page = 25
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    actions = ['export_csv']

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="pergerakan_stok.csv"'
        writer = csv.writer(response)
        writer.writerow(['Produk', 'SKU', 'Gudang', 'Tipe', 'Qty', 'Referensi', 'Catatan', 'Tanggal'])
        for m in queryset:
            writer.writerow([
                m.product.name, m.product.sku,
                m.warehouse.name if m.warehouse else '',
                m.get_movement_type_display(),
                m.quantity, m.reference, m.notes,
                m.created_at.strftime('%Y-%m-%d %H:%M')
            ])
        return response
    export_csv.short_description = 'Export CSV pergerakan stok'
