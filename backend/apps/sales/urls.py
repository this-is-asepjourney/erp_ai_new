from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, SalesOrderViewSet, SalesOrderItemViewSet, InvoiceViewSet

router = DefaultRouter()
router.register('customers', CustomerViewSet)
router.register('orders', SalesOrderViewSet)
router.register('order-items', SalesOrderItemViewSet)
router.register('invoices', InvoiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
