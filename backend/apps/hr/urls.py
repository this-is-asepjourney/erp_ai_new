from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, EmployeeViewSet, AttendanceViewSet, PayrollViewSet, PerformanceViewSet

router = DefaultRouter()
router.register('departments', DepartmentViewSet)
router.register('employees', EmployeeViewSet)
router.register('attendances', AttendanceViewSet)
router.register('payrolls', PayrollViewSet)
router.register('performances', PerformanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
