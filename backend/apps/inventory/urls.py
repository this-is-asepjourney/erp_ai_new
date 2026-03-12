from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, SupplierViewSet, WarehouseViewSet, ProductViewSet, StockMovementViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('suppliers', SupplierViewSet)
router.register('warehouses', WarehouseViewSet)
router.register('products', ProductViewSet)
router.register('stock-movements', StockMovementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
