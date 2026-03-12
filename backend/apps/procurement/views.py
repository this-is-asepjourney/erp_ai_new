from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PurchaseOrder, PurchaseOrderItem, PurchaseInvoice
from .serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer, PurchaseInvoiceSerializer


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related('supplier', 'created_by').prefetch_related('items').all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['po_number', 'supplier__name']
    filterset_fields = ['status', 'supplier']


class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.select_related('purchase_order', 'product').all()
    serializer_class = PurchaseOrderItemSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['purchase_order', 'product']


class PurchaseInvoiceViewSet(viewsets.ModelViewSet):
    queryset = PurchaseInvoice.objects.select_related('supplier', 'purchase_order').all().order_by('-created_at')
    serializer_class = PurchaseInvoiceSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['invoice_number', 'supplier__name']
    filterset_fields = ['status', 'supplier']
