from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, PurchaseOrderItemViewSet, PurchaseInvoiceViewSet

router = DefaultRouter()
router.register('purchase-orders', PurchaseOrderViewSet)
router.register('purchase-order-items', PurchaseOrderItemViewSet)
router.register('purchase-invoices', PurchaseInvoiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
