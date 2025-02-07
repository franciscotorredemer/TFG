
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActividadViewSet, RegistroViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Configurar el router para gestionar las URLs de la API
router = DefaultRouter()
router.register(r'actividades', ActividadViewSet)

# Incluir las URLs del router
urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegistroViewSet.as_view(), name='register'), # URL para registrar un usuario
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # URL para obtener el token JWT
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # URL para refrescar el token
]