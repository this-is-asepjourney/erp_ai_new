from django.db import models
from django.conf import settings


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SENT = 'sent', 'Sent'
        CONFIRMED = 'confirmed', 'Confirmed'
        RECEIVED = 'received', 'Received'
        CANCELLED = 'cancelled', 'Cancelled'

    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey('inventory.Supplier', on_delete=models.PROTECT, related_name='purchase_orders')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    order_date = models.DateField()
    expected_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.po_number} - {self.supplier.name}"


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total = models.DecimalField(max_digits=15, decimal_places=2)
    received_quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.purchase_order.po_number} - {self.product.name}"


class PurchaseInvoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = 'unpaid', 'Unpaid'
        PAID = 'paid', 'Paid'
        OVERDUE = 'overdue', 'Overdue'

    invoice_number = models.CharField(max_length=50, unique=True)
    purchase_order = models.OneToOneField(PurchaseOrder, on_delete=models.PROTECT, related_name='purchase_invoice')
    supplier = models.ForeignKey('inventory.Supplier', on_delete=models.PROTECT)
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.supplier.name}"
