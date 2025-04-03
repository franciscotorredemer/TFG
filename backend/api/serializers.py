
from rest_framework import serializers
from .models import Actividad, CustomUser, Viaje, Hotel

class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'foto_perfil'] 
        extra_kwargs = {'password': {'write_only': True}}  # La contraseña no se muestra en la respuesta  

class ViajeSerializer(serializers.ModelSerializer):
    actividades = ActividadSerializer(many=True, read_only=False)  # Habilitar escritura

    class Meta:
        model = Viaje
        fields = ['id', 'nombre', 'ciudad', 'hotel', 'fecha_inicio', 'fecha_fin', 'imagen_destacada', 'actividades']

    def create(self, validated_data):
        actividades_data = validated_data.pop('actividades', [])  # Extraer actividades del JSON
        viaje = Viaje.objects.create(**validated_data)  # Crear el viaje

        # Agregamos actividades existentes o las creamos si no existen
        for actividad_data in actividades_data:
            actividad, created = Actividad.objects.get_or_create(**actividad_data)
            viaje.actividades.add(actividad)  # Relacionar la actividad con el viaje

        return viaje
    
class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

    






