from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ActividadViewSet,
    RegistroViewSet,
    obtener_perfil,
    mis_viajes,
    buscar_usuarios,
    ViajeViewSet,
    HotelViewSet,
    ActividadEnViajeViewSet,
    RelacionViewSet,
    ViajeCompartidoViewSet,
    GoogleLoginView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'actividades', ActividadViewSet)
router.register(r'viajes', ViajeViewSet)
router.register(r'hoteles', HotelViewSet)
router.register(r'actividades_en_viaje', ActividadEnViajeViewSet)
router.register(r'relacion', RelacionViewSet, basename='relacion')
router.register(r'viaje_compartido', ViajeCompartidoViewSet, basename="viaje_compartido")

relacion_list = RelacionViewSet.as_view({
    'post': 'create'
})

relacion_destroy = RelacionViewSet.as_view({
    'delete': 'destroy'
})

relacion_eliminar_seguidor = RelacionViewSet.as_view({
    'delete': 'delete_seguidor'
})

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegistroViewSet.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/perfil/', obtener_perfil, name='perfil'),
    path('api/mis_viajes/', mis_viajes, name='mis_viajes'),
    path('api/seguir/', relacion_list, name='seguir_usuario'),
    path('api/dejar_de_seguir/<int:pk>/', relacion_destroy, name='dejar_de_seguir'),
    path('api/eliminar_seguidor/<int:pk>/', relacion_eliminar_seguidor, name='eliminar_seguidor'),
    path("api/usuarios/buscar/", buscar_usuarios, name="buscar_usuarios"),
    path('api/google-login/', GoogleLoginView.as_view(), name='google-login')
]
