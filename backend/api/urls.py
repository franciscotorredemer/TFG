
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActividadViewSet

# Configurar el router para gestionar las URLs de la API
router = DefaultRouter()
router.register(r'actividades', ActividadViewSet)

# Incluir las URLs del router
urlpatterns = [
    path('api/', include(router.urls)),
]