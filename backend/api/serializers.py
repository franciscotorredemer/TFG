
from rest_framework import serializers
from .models import Actividad, CustomUser

class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'foto_perfil'] 
        extra_kwargs = {'password': {'write_only': True}}  # La contraseña no se muestra en la respuesta


