from rest_framework import viewsets, generics, status
from .models import Actividad, CustomUser, Viaje, Hotel, ActividadEnViaje, Relacion
from .serializers import ActividadSerializer, CustomUserSerializer, ViajeSerializer, HotelSerializer, ActividadEnViajeSerializer, RelacionSerializer, ViajeCompartidoSerializer, EstanciaHotelSerializer
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import ViajeCompartido, LikeViaje, EstanciaHotel, Gasto
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .serializers import ViajeCompartidoSerializer, GastoSerializer
from django.utils.timezone import now, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
import random, requests
from django.core.mail import EmailMultiAlternatives
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from datetime import date

reset_codes = {}  


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

        # Proteger campos opcionales (bio, ubicacion, foto_perfil)
        for campo in ['bio', 'ubicacion', 'foto_perfil']:
            if campo not in data:
                data[campo] = getattr(usuario, campo, "") or ""

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
        access_token = request.data.get("access_token")

        if not access_token:
            return Response({"error": "Falta el token de Google"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(access_token, requests.Request())

            email = idinfo.get("email")
            username = idinfo.get("name") or email.split("@")[0]
            picture = idinfo.get("picture")

            if not email:
                return Response({"error": "Email no encontrado en el token"}, status=400)

            user, created = CustomUser.objects.get_or_create(email=email, defaults={
                "username": username,
                "foto_perfil": picture,  # guarda la imagen si viene
            })

            if created:
                user.set_unusable_password()
                user.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": CustomUserSerializer(user).data
            })

        except ValueError as e:
            return Response({"error": f"Token no válido: {str(e)}"}, status=400)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


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

    def get_queryset(self):
        queryset = ViajeCompartido.objects.all()
        publicado_por = self.request.query_params.get("publicado_por")
        if publicado_por:
            queryset = queryset.filter(publicado_por_id=publicado_por)
        return queryset

    def list(self, request):
        viajes = self.get_queryset()  
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
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estado_relacion_mutua(request, pk):
     yo_sigo = Relacion.objects.filter(seguidor=request.user, seguido_id=pk).exists()
     me_sigue = Relacion.objects.filter(seguidor_id=pk, seguido=request.user).exists()
     return Response({
        "yo_sigo": yo_sigo,
        "me_sigue": me_sigue
     })
    



class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email requerido.'}, status=400)

        from .models import CustomUser
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # CAMBIADO: antes respondía igual, ahora devuelve error
            return Response({'error': 'Correo no encontrado.'}, status=404)

        code = str(random.randint(100000, 999999))
        reset_codes[email] = {
            "code": code,
            "user_id": user.id,
        }

        subject = "Tu código para recuperar contraseña"
        from_email = 'no-reply@tuapp.com'
        to_email = [user.email]

        html_content = f"""
        <html>
        <body>
            <h2>Recuperación de contraseña</h2>
            <p>Tu código es:</p>
            <h1>{code}</h1>
            <p>Introduce este código en la app para restablecer tu contraseña.</p>
        </body>
        </html>
        """

        msg = EmailMultiAlternatives(subject, '', from_email, to_email)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        return Response({'mensaje': 'Se ha enviado el código de recuperación.'})

    

class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('password')

        if not all([email, code, new_password]):
            return Response({'error': 'Todos los campos son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        data = reset_codes.get(email)
        if not data:
            return Response({'error': 'Código inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        if data['code'] != code:
            return Response({'error': 'Código incorrecto.'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import CustomUser
        try:
            user = CustomUser.objects.get(id=data['user_id'])
            user.set_password(new_password)
            user.save()
            del reset_codes[email]
            return Response({'mensaje': 'Contraseña actualizada correctamente.'})
        except CustomUser.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        

class EstanciaHotelViewSet(viewsets.ModelViewSet):
    queryset = EstanciaHotel.objects.all()
    serializer_class = EstanciaHotelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return EstanciaHotel.objects.filter(viaje__usuario=self.request.user)
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def buscar_actividades(request):
    query = request.GET.get("q", "")
    if not query:
        return Response({"error": "Falta el término de búsqueda"}, status=400)

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "language": "es",
        "key": settings.GOOGLE_API_KEY,
    }

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, params=params, headers=headers)
        data = r.json()

        resultados = []
        for lugar in data.get("results", []):
            resultados.append({
                "nombre": lugar.get("name"),
                "direccion": lugar.get("formatted_address"),
                "latitud": lugar["geometry"]["location"]["lat"],
                "longitud": lugar["geometry"]["location"]["lng"],
                "foto": f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={lugar['photos'][0]['photo_reference']}&key={settings.GOOGLE_API_KEY}" if "photos" in lugar else None,
                "place_id": lugar.get("place_id"),
            })

        return Response(resultados)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def añadir_actividad_a_viaje(request, viaje_id):
    data = request.data
    place_id = data.get("place_id")
    nombre = data.get("nombre")
    direccion = data.get("direccion")
    descripcion = data.get("descripcion", "")
    url_imagen = data.get("url_imagen")
    latitud = data.get("latitud")
    longitud = data.get("longitud")
    fecha_realizacion = data.get("fecha_realizacion", str(date.today()))

    if not nombre :
        return Response({"error": "Faltan campos obligatorios"}, status=400)

    actividad = None
    if place_id:
        actividad = Actividad.objects.filter(google_place_id=place_id).first()

    if not actividad:
        actividad = Actividad.objects.create(
            nombre=nombre,
            direccion=direccion,
            descripcion=descripcion,
            url_imagen=url_imagen,
            latitud=latitud,
            longitud=longitud,
            google_place_id=place_id
        )

    try:
        viaje = Viaje.objects.get(id=viaje_id, usuario=request.user)
        ActividadEnViaje.objects.create(
            viaje=viaje,
            actividad=actividad,
            fecha_realizacion=fecha_realizacion
        )
        return Response({"mensaje": "Actividad añadida correctamente"})
    except Viaje.DoesNotExist:
        return Response({"error": "Viaje no encontrado"}, status=404)

    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def buscar_hoteles(request):
    query = request.GET.get("q", "")
    if not query:
        return Response({"error": "Falta el término de búsqueda"}, status=400)

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "language": "es",
        "key": settings.GOOGLE_API_KEY,
    }

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, params=params, headers=headers)
        data = r.json()

        resultados = []
        for lugar in data.get("results", []):
            resultados.append({
                "nombre": lugar.get("name"),
                "direccion": lugar.get("formatted_address"),
                "latitud": lugar["geometry"]["location"]["lat"],
                "longitud": lugar["geometry"]["location"]["lng"],
                "foto": f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={lugar['photos'][0]['photo_reference']}&key={settings.GOOGLE_API_KEY}" if "photos" in lugar else None,
                "place_id": lugar.get("place_id"),
            })

        return Response(resultados)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


    


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def añadir_hotel_a_viaje(request, viaje_id):
    data = request.data
    place_id = data.get("place_id")
    nombre = data.get("nombre")
    direccion = data.get("direccion")
    pais = data.get("pais", "España")
    descripcion = data.get("descripcion", "")
    imagen = data.get("imagen")
    latitud = data.get("latitud")
    longitud = data.get("longitud")
    fecha_inicio = data.get("fecha_inicio")
    fecha_fin = data.get("fecha_fin")

    if not all([nombre, direccion, fecha_inicio, fecha_fin]):
        return Response({"error": "Faltan campos requeridos"}, status=400)

    hotel = None
    if place_id:
        hotel = Hotel.objects.filter(google_place_id=place_id).first()

    if not hotel:
        hotel = Hotel.objects.create(
            nombre=nombre,
            direccion=direccion,
            pais=pais,
            descripcion=descripcion or direccion,
            imagen=imagen,
            latitud=latitud,
            longitud=longitud,
            google_place_id=place_id
        )

    try:
        viaje = Viaje.objects.get(id=viaje_id, usuario=request.user)
        EstanciaHotel.objects.create(
            viaje=viaje,
            hotel=hotel,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )
        return Response({"mensaje": "Hotel añadido correctamente"})
    except Viaje.DoesNotExist:
        return Response({"error": "Viaje no encontrado"}, status=404)
    




@api_view(["POST"])
@permission_classes([IsAuthenticated])
def asociar_actividad_existente(request, viaje_id):
    actividad_id = request.data.get("actividad_id")
    fecha_realizacion = request.data.get("fecha_realizacion")

    if not actividad_id:
        return Response({"error": "Falta el ID de la actividad"}, status=400)

    try:
        actividad = Actividad.objects.get(id=actividad_id)
        viaje = Viaje.objects.get(id=viaje_id, usuario=request.user)

        ActividadEnViaje.objects.create(
            actividad=actividad,
            viaje=viaje,
            fecha_realizacion=fecha_realizacion or date.today()
        )
        return Response({"mensaje": "Actividad asociada correctamente"})
    except (Actividad.DoesNotExist, Viaje.DoesNotExist):
        return Response({"error": "No encontrado"}, status=404)

    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def asociar_hotel_existente(request, viaje_id):
    hotel_id = request.data.get("hotel_id")
    fecha_inicio = request.data.get("fecha_inicio")
    fecha_fin = request.data.get("fecha_fin")

    if not hotel_id or not fecha_inicio or not fecha_fin:
        return Response({"error": "Faltan datos"}, status=400)

    try:
        hotel = Hotel.objects.get(id=hotel_id)
        viaje = Viaje.objects.get(id=viaje_id, usuario=request.user)

        EstanciaHotel.objects.create(
            hotel=hotel,
            viaje=viaje,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )
        return Response({"mensaje": "Hotel asociado correctamente"})
    except (Hotel.DoesNotExist, Viaje.DoesNotExist):
        return Response({"error": "No encontrado"}, status=404)
    

class GastoViewSet(viewsets.ModelViewSet):
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["viaje"]
    ordering_fields = ["fecha", "cantidad"]
    ordering = ["fecha"]

    def get_queryset(self):
        return Gasto.objects.filter(viaje__usuario=self.request.user)




    


