from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Customer, SalesOrder, SalesOrderItem, Invoice
from .serializers import CustomerSerializer, SalesOrderSerializer, SalesOrderItemSerializer, InvoiceSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'email', 'phone']
    filterset_fields = ['is_active']


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.select_related('customer', 'created_by').prefetch_related('items').all().order_by('-created_at')
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['order_number', 'customer__name']
    filterset_fields = ['status', 'customer']
    ordering_fields = ['order_date', 'total', 'created_at']


class SalesOrderItemViewSet(viewsets.ModelViewSet):
    queryset = SalesOrderItem.objects.select_related('order', 'product').all()
    serializer_class = SalesOrderItemSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['order', 'product']


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('customer', 'sales_order').all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['invoice_number', 'customer__name']
    filterset_fields = ['status', 'customer']
