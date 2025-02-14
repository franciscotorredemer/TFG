from rest_framework import viewsets, generics
from .models import Actividad, CustomUser
from .serializers import ActividadSerializer, CustomUserSerializer
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response



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

        

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def obtener_perfil(request):
    usuario = request.user  

    # Con GET devolvemos la información del usuario
    if request.method == 'GET':
        serializer = CustomUserSerializer(usuario)
        return Response(serializer.data)
    
    # Con PUT actualizamos la información del usuario
    elif request.method == 'PUT':
        serializer = CustomUserSerializer(usuario, data=request.data, partial=True) #Ponemos partial para permitir cambiar solo algunos campos
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)