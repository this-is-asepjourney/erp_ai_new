from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, TransactionViewSet, ExpenseViewSet

router = DefaultRouter()
router.register('accounts', AccountViewSet)
router.register('transactions', TransactionViewSet)
router.register('expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
