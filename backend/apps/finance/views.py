from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Account, Transaction, Expense
from .serializers import AccountSerializer, TransactionSerializer, ExpenseSerializer


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['code', 'name']
    filterset_fields = ['account_type', 'is_active']


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('account', 'created_by').all().order_by('-transaction_date')
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['reference', 'description']
    filterset_fields = ['transaction_type', 'account']
    ordering_fields = ['transaction_date', 'amount']


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-expense_date')
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['title', 'category']
    filterset_fields = ['status', 'category']
