from .ai_service import AIService


class RecommendationEngine:
    """Mesin rekomendasi berbasis AI untuk pengambilan keputusan bisnis."""

    def __init__(self):
        self.ai = AIService()

    def recommend_reorder(self, product_id: int) -> dict:
        """Rekomendasi reorder untuk produk tertentu."""
        from apps.inventory.models import Product, StockMovement
        from django.db.models import Sum
        from django.utils import timezone
        import datetime

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return {"error": "Produk tidak ditemukan."}

        date_30_days_ago = timezone.now() - datetime.timedelta(days=30)
        outflow = StockMovement.objects.filter(
            product=product,
            movement_type='out',
            created_at__gte=date_30_days_ago,
        ).aggregate(total=Sum('quantity'))['total'] or 0

        avg_daily_usage = outflow / 30 if outflow else 0
        days_until_empty = (product.stock_quantity / avg_daily_usage) if avg_daily_usage > 0 else None

        context = (
            f"Produk: {product.name} (SKU: {product.sku})\n"
            f"Stok saat ini: {product.stock_quantity} unit\n"
            f"Stok minimum: {product.minimum_stock} unit\n"
            f"Reorder quantity: {product.reorder_quantity} unit\n"
            f"Pemakaian 30 hari: {outflow} unit\n"
            f"Rata-rata harian: {avg_daily_usage:.1f} unit/hari\n"
            f"Estimasi habis: {f'{days_until_empty:.0f} hari lagi' if days_until_empty else 'Tidak ada data pemakaian'}\n"
        )

        recommendation = self.ai.analyze_data(
            context,
            "Berikan rekomendasi kapan dan berapa banyak harus reorder produk ini."
        )

        return {
            "product": {"id": product.id, "sku": product.sku, "name": product.name},
            "current_stock": product.stock_quantity,
            "avg_daily_usage": round(avg_daily_usage, 2),
            "days_until_empty": round(days_until_empty, 1) if days_until_empty else None,
            "recommendation": recommendation,
        }

    def recommend_best_supplier(self, product_id: int) -> dict:
        """Rekomendasi supplier terbaik untuk produk."""
        from apps.inventory.models import Product
        from apps.procurement.models import PurchaseOrder, PurchaseOrderItem
        from django.db.models import Avg, Count

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return {"error": "Produk tidak ditemukan."}

        supplier_stats = (
            PurchaseOrderItem.objects
            .filter(product=product)
            .values('purchase_order__supplier__name')
            .annotate(
                total_orders=Count('id'),
                avg_price=Avg('unit_price'),
            )
            .order_by('avg_price')
        )

        if not supplier_stats:
            return {"message": "Belum ada data pembelian untuk produk ini.", "product": product.name}

        context = f"Data supplier untuk produk {product.name}:\n"
        for s in supplier_stats:
            context += (
                f"- {s['purchase_order__supplier__name']}: "
                f"{s['total_orders']} order, harga rata-rata Rp {s['avg_price']:,.0f}\n"
            )

        recommendation = self.ai.analyze_data(
            context,
            "Rekomendasikan supplier terbaik berdasarkan harga dan frekuensi pembelian."
        )

        return {
            "product": product.name,
            "supplier_stats": list(supplier_stats),
            "recommendation": recommendation,
        }

    def company_health_check(self) -> dict:
        """Cek kesehatan perusahaan secara menyeluruh."""
        from apps.ai_engine.erp_analyzer import ERPAnalyzer
        analyzer = ERPAnalyzer()

        inventory_analysis = analyzer.analyze_inventory()
        finance_analysis = analyzer.analyze_finance()
        sales_analysis = analyzer.analyze_sales(days=30)

        summary_context = (
            f"=== RINGKASAN KONDISI PERUSAHAAN ===\n\n"
            f"INVENTORY:\n"
            f"- Produk stok rendah: {inventory_analysis.get('low_stock_count', 0)}\n\n"
            f"KEUANGAN (Bulan ini):\n"
            f"- Pemasukan: Rp {finance_analysis.get('income', 0):,.0f}\n"
            f"- Pengeluaran: Rp {finance_analysis.get('expense', 0):,.0f}\n"
            f"- Profit: Rp {finance_analysis.get('profit', 0):,.0f}\n\n"
            f"SALES (30 hari):\n"
            f"- Total order: {sales_analysis.get('total_orders', 0)}\n"
            f"- Total revenue: Rp {sales_analysis.get('total_revenue', 0):,.0f}\n"
        )

        overall_insight = self.ai.analyze_data(
            summary_context,
            "Berikan penilaian menyeluruh kondisi perusahaan dan rekomendasi strategis."
        )

        return {
            "inventory": inventory_analysis,
            "finance": finance_analysis,
            "sales": sales_analysis,
            "overall_insight": overall_insight,
        }
