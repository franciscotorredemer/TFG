from rest_framework import viewsets, generics, status
from .models import Actividad, CustomUser, Viaje, Hotel, ActividadEnViaje, Relacion
from .serializers import ActividadSerializer, CustomUserSerializer, ViajeSerializer, HotelSerializer, ActividadEnViajeSerializer, RelacionSerializer
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import ViajeCompartido, LikeViaje
from .serializers import ViajeCompartidoSerializer
from django.utils.timezone import now, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView


User = get_user_model()

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer
    permission_classes = [IsAuthenticated]

class RegistroViewSet(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = []

    def perform_create(self, serializer):
        serializer.save(password=make_password(serializer.validated_data['password']))

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def obtener_perfil(request):
    usuario = request.user

    if request.method == 'GET':
        serializer = CustomUserSerializer(usuario)
        return Response(serializer.data)
    elif request.method == "PUT":
        data = request.data.copy()
        if "password" in data and data["password"]:
            data["password"] = make_password(data["password"])

        serializer = CustomUserSerializer(usuario, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        usuario.delete()
        return Response({"mensaje": "Cuenta eliminada correctamente"}, status=204)

class ViajeViewSet(viewsets.ModelViewSet):
    queryset = Viaje.objects.all()
    serializer_class = ViajeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def get_queryset(self):
        return Viaje.objects.filter(usuario=self.request.user).order_by('-fecha_inicio')
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_usuarios(request):
    query = request.GET.get('q', '')
    if query:
        usuarios = User.objects.filter(username__icontains=query).exclude(id=request.user.id)[:10]
        serializer = CustomUserSerializer(usuarios, many=True)
        return Response(serializer.data)
    return Response([])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mis_viajes(request):
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

class GoogleLoginView(APIView):
    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'Falta el token de Google'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validar el token
            idinfo = id_token.verify_oauth2_token(access_token, requests.Request())

            email = idinfo.get('email')
            username = idinfo.get('name') or email.split('@')[0]

            if not email:
                return Response({'error': 'Email no encontrado en el token'}, status=400)

            # Crear o buscar el usuario
            user, created = CustomUser.objects.get_or_create(email=email, defaults={'username': username})
            if created:
                user.set_unusable_password()
                user.save()

            # Generar los tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })

        except Exception as e:
            return Response({'error': str(e)}, status=400)

class RelacionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        seguido_id = request.data.get("seguido")
        if seguido_id == request.user.id:
            return Response({"error": "No puedes seguirte a ti mismo."}, status=400)

        if Relacion.objects.filter(seguidor=request.user, seguido_id=seguido_id).exists():
            return Response({"error": "Ya sigues a este usuario."}, status=400)

        relacion = Relacion.objects.create(seguidor=request.user, seguido_id=seguido_id)
        return Response(RelacionSerializer(relacion).data, status=201)

    def destroy(self, request, pk=None):
        try:
            relacion = Relacion.objects.get(seguidor=request.user, seguido_id=pk)
            relacion.delete()
            return Response(status=204)
        except Relacion.DoesNotExist:
            return Response({"error": "No estás siguiendo a este usuario."}, status=404)

    @action(detail=True, methods=['delete'], url_path='eliminar_seguidor')
    def delete_seguidor(self, request, pk=None):
        try:
            relacion = Relacion.objects.get(seguidor_id=pk, seguido=request.user)
            relacion.delete()
            return Response(status=204)
        except Relacion.DoesNotExist:
            return Response({"error": "Ese usuario no te sigue."}, status=404)

    @action(detail=True, methods=['get'], url_path='estado')
    def estado(self, request, pk=None):
        siguiendo = Relacion.objects.filter(seguidor=request.user, seguido_id=pk).exists()
        return Response({"siguiendo": siguiendo})

    @action(detail=False, methods=['get'], url_path='seguimientos')
    def seguidos(self, request):
        relaciones = Relacion.objects.filter(seguidor=request.user)
        data = [{"id": r.seguido.id, "username": r.seguido.username, "foto_perfil" : r.seguido.foto_perfil} for r in relaciones]
        return Response(data)

    @action(detail=False, methods=['get'], url_path='seguidores')
    def seguidores(self, request):
        relaciones = Relacion.objects.filter(seguido=request.user)
        data = [{"id": r.seguidor.id, "username": r.seguidor.username, "foto_perfil": r.seguidor.foto_perfil} for r in relaciones]
        return Response(data)

    @action(detail=True, methods=['get'], url_path='info')
    def info_usuario(self, request, pk=None):
        try:
            user = User.objects.get(id=pk)
            serializer = CustomUserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

    @action(detail=False, methods=['get'], url_path='contador')
    def contador(self, request):
        seguidores = Relacion.objects.filter(seguido=request.user).count()
        siguiendo = Relacion.objects.filter(seguidor=request.user).count()
        return Response({
            "siguiendo": siguiendo,
            "seguidores": seguidores
        })
    

class ViajeCompartidoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ViajeCompartido.objects.all()
    serializer_class = ViajeCompartidoSerializer


    def list(self, request):
        viajes = ViajeCompartido.objects.all()
        serializer = ViajeCompartidoSerializer(viajes, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def siguiendo(self, request):
        seguidos_ids = Relacion.objects.filter(seguidor=request.user).values_list("seguido_id", flat=True)
        viajes = ViajeCompartido.objects.filter(publicado_por__in=seguidos_ids)
        serializer = ViajeCompartidoSerializer(viajes, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def populares(self, request):
        desde = now() - timedelta(days=30)
        viajes = ViajeCompartido.objects.filter(fecha_publicacion__gte=desde)
        viajes = sorted(viajes, key=lambda v: v.likes.count(), reverse=True)
        serializer = ViajeCompartidoSerializer(viajes, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def recientes(self, request):
        viajes = ViajeCompartido.objects.all().order_by("-fecha_publicacion")
        serializer = ViajeCompartidoSerializer(viajes, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def publicar(self, request, pk=None):
        try:
            viaje = Viaje.objects.get(pk=pk, usuario=request.user)
            if hasattr(viaje, 'compartido'):
                return Response({"error": "Ya está publicado"}, status=400)
            comentario = request.data.get("comentario", "")
            compartido = ViajeCompartido.objects.create(viaje=viaje, comentario=comentario, publicado_por=request.user)
            return Response(ViajeCompartidoSerializer(compartido, context={'request': request}).data)
        except Viaje.DoesNotExist:
            return Response({"error": "Viaje no encontrado"}, status=404)

    @action(detail=True, methods=["post"])
    def despublicar(self, request, pk=None):
        try:
            compartido = ViajeCompartido.objects.get(viaje__pk=pk, publicado_por=request.user)
            compartido.delete()
            return Response({"mensaje": "Viaje despublicado"})
        except ViajeCompartido.DoesNotExist:
            return Response({"error": "No tienes este viaje publicado"}, status=404)

    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        try:
            viaje = ViajeCompartido.objects.get(pk=pk)
            LikeViaje.objects.get_or_create(usuario=request.user, viaje_compartido=viaje)
            return Response({"mensaje": "Like registrado"})
        except ViajeCompartido.DoesNotExist:
            return Response({"error": "Viaje no encontrado"}, status=404)

    @action(detail=True, methods=["post"])
    def unlike(self, request, pk=None):
        try:
            viaje = ViajeCompartido.objects.get(pk=pk)
            LikeViaje.objects.filter(usuario=request.user, viaje_compartido=viaje).delete()
            return Response({"mensaje": "Like eliminado"})
        except ViajeCompartido.DoesNotExist:
            return Response({"error": "Viaje no encontrado"}, status=404)
        
    @action(detail=True, methods=["get"])
    def esta_publicado(self, request, pk=None):
     publicado = ViajeCompartido.objects.filter(viaje_id=pk).exists()
     return Response({"publicado": publicado})
    

    


