from rest_framework import serializers
from .models import Actividad, CustomUser, Viaje, Hotel, ActividadEnViaje, Relacion, ViajeCompartido, LikeViaje

class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'foto_perfil', 'bio', 'ubicacion']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'read_only': True},  # opcional si no quieres que se modifique
        }

class ActividadConFechaSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='actividad.id')
    nombre = serializers.ReadOnlyField(source='actividad.nombre')
    descripcion = serializers.ReadOnlyField(source='actividad.descripcion')
    url_imagen = serializers.ReadOnlyField(source='actividad.url_imagen')
    ciudad = serializers.ReadOnlyField(source='actividad.ciudad')
    ubicacion = serializers.ReadOnlyField(source='actividad.ubicacion')

    class Meta:
        model = ActividadEnViaje
        fields = ['id', 'nombre', 'descripcion', 'url_imagen', 'ciudad', 'ubicacion', 'fecha_realizacion']

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

class ViajeSerializer(serializers.ModelSerializer):
    actividades = serializers.SerializerMethodField()
    hoteles = HotelSerializer(many=True, read_only=True)

    class Meta:
        model = Viaje
        fields = [
            'id',
            'nombre',
            'ciudad',
            'hotel',
            'fecha_inicio',
            'fecha_fin',
            'imagen_destacada',
            'actividades',
            'hoteles',
        ]

    def get_actividades(self, obj):
        relaciones = ActividadEnViaje.objects.filter(viaje=obj)
        return ActividadConFechaSerializer(relaciones, many=True).data

class ActividadEnViajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadEnViaje
        fields = ['id', 'viaje', 'actividad', 'fecha_realizacion']

class RelacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relacion
        fields = '__all__'


class ViajeCompartidoSerializer(serializers.ModelSerializer):
    viaje = ViajeSerializer()
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    ya_dado_like = serializers.SerializerMethodField()

    class Meta:
        model = ViajeCompartido
        fields = ['id', 'viaje', 'comentario', 'publicado_por', 'fecha_publicacion', 'likes_count', 'ya_dado_like']

    def get_ya_dado_like(self, obj):
        user = self.context.get("request").user
        return obj.likes.filter(usuario=user).exists()

