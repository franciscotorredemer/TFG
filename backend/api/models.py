from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from datetime import date

class Actividad(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    url_imagen = models.URLField()
    ciudad = models.CharField(max_length=255)
    ubicacion = models.CharField(max_length=255)
    

    def __str__(self):
        return f"{self.nombre} - {self.fecha_realizacion}"

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    foto_perfil = models.URLField(blank=True, null=True) 
    bio = models.TextField(blank=True, null=True)
    ubicacion = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username  # Retorna el nombre de usuario

class Viaje(models.Model):
    nombre = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=255)
    hotel = models.CharField(max_length=255, blank=True, null=True)
    fecha_inicio = models.DateField(default=date.today)
    fecha_fin = models.DateField(default=date.today)
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="viajes")
    actividades = models.ManyToManyField(Actividad, through='ActividadEnViaje', related_name="viajes")
    imagen_destacada = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.nombre} - {self.ciudad}"

class ActividadEnViaje(models.Model):
    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE)
    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE)
    fecha_realizacion = models.DateField()

    def __str__(self):
        return f"{self.actividad.nombre} en {self.viaje.nombre} el {self.fecha_realizacion}"

    

class Hotel(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    ciudad = models.CharField(max_length=255)
    pais = models.CharField(max_length=255)
    ubicacion = models.CharField(max_length=255)
    imagen = models.URLField()
    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE, related_name="hoteles")

    def __str__(self):
        return f"{self.nombre} ({self.ciudad}, {self.pais})"
    

class Relacion(models.Model):
    seguidor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="siguiendo", on_delete=models.CASCADE)
    seguido = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="seguidores", on_delete=models.CASCADE)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('seguidor', 'seguido')

    def __str__(self):
        return f"{self.seguidor} sigue a {self.seguido}"

