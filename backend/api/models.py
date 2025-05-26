from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from datetime import date

class Actividad(models.Model):
    nombre = models.CharField(max_length=2000)
    descripcion = models.TextField()
    url_imagen = models.URLField(max_length=2000)
    direccion = models.CharField(max_length=2000)
    latitud = models.FloatField(null=True, blank=True)
    longitud = models.FloatField(null=True, blank=True)
    google_place_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    def __str__(self):
        return self.nombre

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    foto_perfil = models.URLField(blank=True, null=True) 
    bio = models.TextField(blank=True, null=True)
    ubicacion = models.CharField(max_length=255, blank=True, null=True)
    es_google = models.BooleanField(default=False) 

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
    notas = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nombre} - {self.ciudad}"

class ActividadEnViaje(models.Model):
    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE)
    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE)
    fecha_realizacion = models.DateField()

    def __str__(self):
        return f"{self.actividad.nombre} en {self.viaje.nombre} el {self.fecha_realizacion}"

    

class Hotel(models.Model):
    nombre = models.CharField(max_length=2000)
    descripcion = models.TextField()
    direccion = models.CharField(max_length=2000)
    pais = models.CharField(max_length=255)
    latitud = models.FloatField(null=True, blank=True)
    longitud = models.FloatField(null=True, blank=True)
    imagen = models.URLField(max_length=2000)
    google_place_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} ({self.ciudad}, {self.pais})"
    

class Relacion(models.Model):
    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("aceptada", "Aceptada"),
    ]

    seguidor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="siguiendo", on_delete=models.CASCADE)
    seguido = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="seguidores", on_delete=models.CASCADE)
    estado = models.CharField(max_length=10, choices=ESTADOS, default="pendiente")
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('seguidor', 'seguido')

    def __str__(self):
        return f"{self.seguidor.username} → {self.seguido.username} ({self.estado})"

    

class ViajeCompartido(models.Model):
    viaje = models.OneToOneField(Viaje, on_delete=models.CASCADE, related_name="compartido")
    comentario = models.TextField(blank=True, null=True)
    publicado_por = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.viaje.nombre} publicado por {self.publicado_por.username}"

    class Meta:
        ordering = ['-fecha_publicacion']


class LikeViaje(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    viaje_compartido = models.ForeignKey(ViajeCompartido, on_delete=models.CASCADE, related_name="likes")
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'viaje_compartido')

class EstanciaHotel(models.Model):
    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE, related_name="estancias")
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    def __str__(self):
        return f"{self.hotel.nombre} en {self.viaje.nombre} ({self.fecha_inicio} - {self.fecha_fin})"
    

class Gasto(models.Model):
    CATEGORIAS = [
        ("Comida", "Comida"),
        ("Transporte", "Transporte"),
        ("Alojamiento", "Alojamiento"),
        ("Ocio", "Ocio"),
        ("Compras", "Compras"),
        ("Otros", "Otros"),
    ]

    viaje = models.ForeignKey(Viaje, on_delete=models.CASCADE, related_name="gastos")
    concepto = models.CharField(max_length=255)
    cantidad = models.FloatField()
    categoria = models.CharField(max_length=50, choices=CATEGORIAS)
    fecha = models.DateField()
    notas = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.concepto} - {self.cantidad}€"






