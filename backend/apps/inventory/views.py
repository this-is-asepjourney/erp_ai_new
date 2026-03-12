from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category, Supplier, Warehouse, Product, StockMovement
from .serializers import (
    CategorySerializer, SupplierSerializer, WarehouseSerializer,
    ProductSerializer, StockMovementSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name']


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'email']
    filterset_fields = ['is_active']


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'supplier').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['sku', 'name']
    filterset_fields = ['category', 'supplier', 'is_active']
    ordering_fields = ['name', 'stock_quantity', 'created_at']


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('product', 'warehouse').all().order_by('-created_at')
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['product', 'movement_type', 'warehouse']
