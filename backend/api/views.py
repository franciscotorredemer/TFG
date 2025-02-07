from rest_framework import viewsets, generics
from .models import Actividad, CustomUser
from .serializers import ActividadSerializer, CustomUserSerializer
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()  # Obtener todas las actividades
    serializer_class = ActividadSerializer  # Usamos el serializador de Actividad
    permission_classes = [IsAuthenticated]  # Requerimos login para ver las actividades

class RegistroViewSet(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # Obtener todos los usuarios
    serializer_class = CustomUserSerializer  # Usamos el serializador de CustomUser
    permission_classes = []  # No requerimos login para registrar un usuario

    def perform_create(self, serializer):
        serializer.save(password=make_password(serializer.validated_data['password']))  # Encriptar la contraseña