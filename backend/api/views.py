from rest_framework import viewsets
from .models import Actividad
from .serializers import ActividadSerializer

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()  # Obtener todas las actividades
    serializer_class = ActividadSerializer  # Usamos el serializador de Actividad