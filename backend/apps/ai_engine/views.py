from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .erp_analyzer import ERPAnalyzer
from .recommendation import RecommendationEngine


class InventoryAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analyzer = ERPAnalyzer()
        result = analyzer.analyze_inventory()
        return Response(result)


class SalesAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        analyzer = ERPAnalyzer()
        result = analyzer.analyze_sales(days=days)
        return Response(result)


class FinanceAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        analyzer = ERPAnalyzer()
        result = analyzer.analyze_finance(
            month=int(month) if month else None,
            year=int(year) if year else None,
        )
        return Response(result)


class ReorderRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        engine = RecommendationEngine()
        result = engine.recommend_reorder(product_id)
        return Response(result)


class SupplierRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        engine = RecommendationEngine()
        result = engine.recommend_best_supplier(product_id)
        return Response(result)


class CompanyHealthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        engine = RecommendationEngine()
        result = engine.company_health_check()
        return Response(result)


class AIAssistantView(APIView):
    """Endpoint chat AI umum untuk pertanyaan bebas tentang bisnis."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Pesan tidak boleh kosong.'}, status=status.HTTP_400_BAD_REQUEST)

        from .ai_service import AIService
        ai = AIService()
        system_prompt = (
            "Kamu adalah AI ERP Assistant yang membantu pengguna memahami data bisnis mereka. "
            "Jawab pertanyaan dengan ringkas, profesional, dan dalam Bahasa Indonesia. "
            "Jika pertanyaan butuh data spesifik yang tidak kamu miliki, minta pengguna untuk "
            "menggunakan endpoint analisis spesifik (inventory, sales, finance)."
        )
        try:
            response = ai.ask(system_prompt, message)
            return Response({'response': response})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
