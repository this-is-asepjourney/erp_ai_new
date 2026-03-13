from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view
from rest_framework.response import Response

admin.site.site_header = "Nexus ERP AI"
admin.site.site_title = "Nexus ERP AI Admin"
admin.site.index_title = "Selamat Datang di Panel Admin Nexus ERP AI"


@api_view(["GET"])
def api_root(request):
    return Response(
        {
            "name": "Nexus ERP AI API",
            "version": "v1",
            "auth": {
                "login": "/api/auth/login/",
                "refresh": "/api/auth/refresh/",
            },
            "modules": {
                "users": "/api/users/",
                "inventory": "/api/inventory/",
                "sales": "/api/sales/",
                "finance": "/api/finance/",
                "procurement": "/api/procurement/",
                "hr": "/api/hr/",
                "ai": "/api/ai/",
            },
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),

    # API root
    path("api/", api_root, name="api-root"),

    # JWT Auth
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ERP Modules
    path("api/users/", include("apps.users.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/sales/", include("apps.sales.urls")),
    path("api/finance/", include("apps.finance.urls")),
    path("api/procurement/", include("apps.procurement.urls")),
    path("api/hr/", include("apps.hr.urls")),

    # AI Engine
    path("api/ai/", include("apps.ai_engine.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
