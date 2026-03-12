from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Department, Employee, Attendance, Payroll, Performance
from .serializers import (
    DepartmentSerializer, EmployeeSerializer,
    AttendanceSerializer, PayrollSerializer, PerformanceSerializer
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department').all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['employee_id', 'first_name', 'last_name', 'email']
    filterset_fields = ['department', 'status']


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee').all().order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['employee', 'status', 'date']


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.select_related('employee').all().order_by('-period_start')
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['employee', 'status']


class PerformanceViewSet(viewsets.ModelViewSet):
    queryset = Performance.objects.select_related('employee', 'reviewer').all()
    serializer_class = PerformanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['employee']
