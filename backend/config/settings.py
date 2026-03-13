"""
Django settings for ERP AI project.
"""

from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])


# Application definition

DJANGO_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'django_celery_beat',
]

LOCAL_APPS = [
    'apps.users',
    'apps.inventory',
    'apps.finance',
    'apps.sales',
    'apps.procurement',
    'apps.hr',
    'apps.ai_engine',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='erp_ai'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}


# Custom user model
AUTH_USER_MODEL = 'users.User'


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'id-id'
TIME_ZONE = 'Asia/Jakarta'
USE_I18N = True
USE_TZ = True


# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'config.pagination.StandardPagination',
    'PAGE_SIZE': 20,
}


# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# CORS - izinkan Next.js frontend
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_CREDENTIALS = True


# Celery Configuration
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE


# OpenAI / AI Configuration
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
AI_MODEL = config('AI_MODEL', default='gpt-4o-mini')


# ─────────────────────────────────────────────
#  Jazzmin – Modern Admin UI
# ─────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    # ── Branding ─────────────────────────────
    "site_title": "Nexus ERP AI",
    "site_header": "Nexus ERP AI",
    "site_brand": "Nexus ERP AI",
    "site_logo": "nexus/img/nexus_logo.png",
    "login_logo": "nexus/img/nexus_logo.png",
    "login_logo_dark": "nexus/img/nexus_logo.png",
    "site_logo_classes": None,
    "site_icon": "nexus/img/nexus_logo.png",
    "welcome_sign": "Selamat datang di Nexus ERP AI",
    "copyright": "© 2026 Nexus ERP AI — Intelligent Business Operating System",

    # ── Search ───────────────────────────────
    "search_model": ["users.User", "inventory.Product", "sales.Customer"],

    # ── Top Navbar Links ─────────────────────
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Frontend", "url": "http://localhost:3000", "new_window": True, "icon": "fas fa-external-link-alt"},
        {"model": "users.User"},
        {"model": "inventory.Product"},
    ],

    # ── User Menu ────────────────────────────
    "usermenu_links": [
        {"name": "Ubah Password", "url": "admin:password_change", "icon": "fas fa-key"},
    ],

    # ── Sidebar ──────────────────────────────
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],

    "order_with_respect_to": [
        "users",
        "inventory",
        "sales",
        "finance",
        "procurement",
        "hr",
        "django_celery_beat",
        "auth",
    ],

    # ── Custom Sidebar Links ─────────────────
    "custom_links": {
        "inventory": [{
            "name": "Import Stok CSV",
            "url": "/admin/inventory/product/import-stok/",
            "icon": "fas fa-file-upload",
            "permissions": ["inventory.add_product"],
        }],
    },

    # ── Font Awesome Icons ───────────────────
    "icons": {
        "auth":                                 "fas fa-lock",
        "auth.Group":                           "fas fa-users",
        "users":                                "fas fa-user-circle",
        "users.User":                           "fas fa-user",
        "inventory":                            "fas fa-boxes",
        "inventory.Category":                   "fas fa-tags",
        "inventory.Supplier":                   "fas fa-truck",
        "inventory.Warehouse":                  "fas fa-warehouse",
        "inventory.Product":                    "fas fa-box-open",
        "inventory.StockMovement":              "fas fa-exchange-alt",
        "sales":                                "fas fa-shopping-cart",
        "sales.Customer":                       "fas fa-user-tie",
        "sales.SalesOrder":                     "fas fa-file-alt",
        "sales.SalesOrderItem":                 "fas fa-list",
        "sales.Invoice":                        "fas fa-file-invoice-dollar",
        "finance":                              "fas fa-chart-line",
        "finance.Account":                      "fas fa-wallet",
        "finance.Transaction":                  "fas fa-receipt",
        "finance.Expense":                      "fas fa-money-bill-wave",
        "procurement":                          "fas fa-shopping-bag",
        "procurement.PurchaseOrder":            "fas fa-clipboard-list",
        "procurement.PurchaseOrderItem":        "fas fa-list-alt",
        "procurement.PurchaseInvoice":          "fas fa-file-invoice",
        "hr":                                   "fas fa-users-cog",
        "hr.Department":                        "fas fa-building",
        "hr.Employee":                          "fas fa-id-card",
        "hr.Attendance":                        "fas fa-calendar-check",
        "hr.Payroll":                           "fas fa-money-check-alt",
        "hr.Performance":                       "fas fa-star",
        "django_celery_beat":                   "fas fa-clock",
        "django_celery_beat.ClockedSchedule":   "fas fa-stopwatch",
        "django_celery_beat.CrontabSchedule":   "fas fa-cogs",
        "django_celery_beat.IntervalSchedule":  "fas fa-redo",
        "django_celery_beat.PeriodicTask":      "fas fa-tasks",
        "django_celery_beat.SolarSchedule":     "fas fa-sun",
    },
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    # ── UI Options ───────────────────────────
    "related_modal_active": True,
    "custom_css": "nexus/css/nexus_admin.css",
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
    "language_chooser": False,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": True,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-navy",
    "accent": "accent-warning",
    "navbar": "navbar-dark navbar-navy",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-navy",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary":   "btn-primary",
        "secondary": "btn-secondary",
        "info":      "btn-outline-info",
        "warning":   "btn-warning",
        "danger":    "btn-danger",
        "success":   "btn-success",
    },
    "actions_sticky_top": True,
}
