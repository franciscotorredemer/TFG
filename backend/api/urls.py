
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActividadViewSet, RegistroViewSet, obtener_perfil, mis_viajes, obtener_perfil, ViajeViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import HotelViewSet

# Configurar el router para gestionar las URLs de la API
router = DefaultRouter()
router.register(r'actividades', ActividadViewSet)
router.register(r'viajes', ViajeViewSet)
router.register(r'hoteles', HotelViewSet) 


# Incluir las URLs del router
urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegistroViewSet.as_view(), name='register'), # URL para registrar un usuario
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # URL para obtener el token JWT
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # URL para refrescar el token
     path('api/perfil/', obtener_perfil, name='perfil'), # URL para obtener o actualizar el perfil del usuario
     path('api/mis_viajes/', mis_viajes, name='mis_viajes'),
]