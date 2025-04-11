from rest_framework import viewsets, generics
from .models import Actividad, CustomUser, Viaje, Hotel, ActividadEnViaje
from .serializers import ActividadSerializer, CustomUserSerializer, ViajeSerializer, HotelSerializer, ActividadEnViajeSerializer
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
    elif request.method == "PUT":
        data = request.data.copy()
        if "password" in data and data["password"]:
            data["password"] = make_password(data["password"])

        serializer = CustomUserSerializer(usuario, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ViajeViewSet(viewsets.ModelViewSet):
    queryset = Viaje.objects.all()
    serializer_class = ViajeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Asignamos el usuario autenticado al viaje que se está creando.
        """
        serializer.save(usuario=self.request.user)  # Aquí se asigna el usuario autenticado

    def get_queryset(self):
        """
        Filtramos los viajes para que solo el propio usuario autenticado pueda ver sus propios viajes.
        """
        return Viaje.objects.filter(usuario=self.request.user).order_by('-fecha_inicio')

    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_viajes(request):
    """
    Devuelve los dos últimos viajes del usuario autenticado.
    """
    viajes = Viaje.objects.filter(usuario=request.user).order_by('-fecha_inicio')[:2]
    serializer = ViajeSerializer(viajes, many=True)
    return Response(serializer.data)


class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.all() 
    serializer_class = HotelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Hotel.objects.filter(viaje__usuario=self.request.user)
        viaje_id = self.request.query_params.get('viaje')
        if viaje_id:
            queryset = queryset.filter(viaje__id=viaje_id)
        return queryset
    

class ActividadEnViajeViewSet(viewsets.ModelViewSet):
    queryset = ActividadEnViaje.objects.all()
    serializer_class = ActividadEnViajeSerializer
    permission_classes = [IsAuthenticated]



    

    

