from rest_framework import serializers
from .models import Actividad, CustomUser, Viaje, Hotel, ActividadEnViaje, Relacion, ViajeCompartido, LikeViaje, EstanciaHotel, Gasto

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
        }

class ActividadConFechaSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='actividad.id')
    nombre = serializers.ReadOnlyField(source='actividad.nombre')
    descripcion = serializers.ReadOnlyField(source='actividad.descripcion')
    url_imagen = serializers.ReadOnlyField(source='actividad.url_imagen')
    direccion = serializers.ReadOnlyField(source='actividad.direccion')
    ubicacion = serializers.ReadOnlyField(source='actividad.ubicacion')

    class Meta:
        model = ActividadEnViaje
        fields = ['id', 'nombre', 'descripcion', 'url_imagen', 'direccion', 'ubicacion', 'fecha_realizacion']

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

class EstanciaHotelSerializer(serializers.ModelSerializer):
    hotel = HotelSerializer()

    class Meta:
        model = EstanciaHotel
        fields = ['id', 'hotel', 'fecha_inicio', 'fecha_fin']

class ViajeSerializer(serializers.ModelSerializer):
    actividades = serializers.SerializerMethodField()
    estancias = EstanciaHotelSerializer(many=True, read_only=True)
    gastos = GastoSerializer(many=True, read_only=True)

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
            'notas',
            'actividades',
            'estancias',
            'gastos',
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
    

class GastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gasto
        fields = '__all__'
    



