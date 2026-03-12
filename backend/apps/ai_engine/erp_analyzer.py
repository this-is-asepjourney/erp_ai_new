from .ai_service import AIService


class ERPAnalyzer:
    """Menganalisis data ERP dari berbagai modul."""

    def __init__(self):
        self.ai = AIService()

    def analyze_inventory(self) -> dict:
        """Analisis kondisi stok dan prediksi kehabisan."""
        from apps.inventory.models import Product

        low_stock_products = Product.objects.filter(
            is_active=True,
            stock_quantity__lte=models_min_stock()
        ).values('sku', 'name', 'stock_quantity', 'minimum_stock', 'reorder_quantity')

        if not low_stock_products.exists():
            return {"status": "ok", "message": "Semua stok dalam kondisi aman.", "products": []}

        context = "Produk dengan stok rendah:\n"
        for p in low_stock_products:
            context += (
                f"- {p['name']} (SKU: {p['sku']}): "
                f"Stok {p['stock_quantity']} unit, minimum {p['minimum_stock']} unit\n"
            )

        insight = self.ai.analyze_data(context, "Analisis kondisi stok dan berikan rekomendasi reorder.")
        return {
            "status": "warning",
            "low_stock_count": low_stock_products.count(),
            "products": list(low_stock_products),
            "ai_insight": insight,
        }

    def analyze_sales(self, days: int = 30) -> dict:
        """Analisis performa penjualan dalam periode tertentu."""
        from apps.sales.models import SalesOrder, Invoice
        from django.utils import timezone
        from django.db.models import Sum, Count
        import datetime

        date_from = timezone.now().date() - datetime.timedelta(days=days)
        orders = SalesOrder.objects.filter(order_date__gte=date_from)
        total_revenue = Invoice.objects.filter(
            issue_date__gte=date_from
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        context = (
            f"Periode: {days} hari terakhir\n"
            f"Total order: {orders.count()}\n"
            f"Total revenue: Rp {total_revenue:,.0f}\n"
            f"Order confirmed: {orders.filter(status='confirmed').count()}\n"
            f"Order cancelled: {orders.filter(status='cancelled').count()}\n"
        )

        insight = self.ai.analyze_data(context, "Analisis performa sales dan prediksi tren penjualan.")
        return {
            "period_days": days,
            "total_orders": orders.count(),
            "total_revenue": float(total_revenue),
            "ai_insight": insight,
        }

    def analyze_finance(self, month: int = None, year: int = None) -> dict:
        """Analisis kesehatan keuangan."""
        from apps.finance.models import Transaction
        from django.db.models import Sum
        from django.utils import timezone

        now = timezone.now()
        month = month or now.month
        year = year or now.year

        transactions = Transaction.objects.filter(
            transaction_date__month=month,
            transaction_date__year=year,
        )

        income = transactions.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0
        expense = transactions.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0
        profit = income - expense

        context = (
            f"Bulan: {month}/{year}\n"
            f"Total Pemasukan: Rp {income:,.0f}\n"
            f"Total Pengeluaran: Rp {expense:,.0f}\n"
            f"Profit/Loss: Rp {profit:,.0f}\n"
        )

        insight = self.ai.analyze_data(context, "Analisis kondisi keuangan dan beri warning jika ada risiko finansial.")
        return {
            "month": month,
            "year": year,
            "income": float(income),
            "expense": float(expense),
            "profit": float(profit),
            "ai_insight": insight,
        }


def models_min_stock():
    """Helper untuk filter produk low stock."""
    from django.db.models import F
    return F('minimum_stock')
