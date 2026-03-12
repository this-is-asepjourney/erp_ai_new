from django.urls import path
from .views import (
    InventoryAnalysisView,
    SalesAnalysisView,
    FinanceAnalysisView,
    ReorderRecommendationView,
    SupplierRecommendationView,
    CompanyHealthView,
    AIAssistantView,
)

urlpatterns = [
    path('analyze/inventory/', InventoryAnalysisView.as_view(), name='ai-inventory-analysis'),
    path('analyze/sales/', SalesAnalysisView.as_view(), name='ai-sales-analysis'),
    path('analyze/finance/', FinanceAnalysisView.as_view(), name='ai-finance-analysis'),
    path('recommend/reorder/<int:product_id>/', ReorderRecommendationView.as_view(), name='ai-reorder-recommendation'),
    path('recommend/supplier/<int:product_id>/', SupplierRecommendationView.as_view(), name='ai-supplier-recommendation'),
    path('health-check/', CompanyHealthView.as_view(), name='ai-health-check'),
    path('assistant/', AIAssistantView.as_view(), name='ai-assistant'),
]
