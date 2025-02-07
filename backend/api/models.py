
from django.db import models
from django.contrib.auth.models import AbstractUser


class Actividad(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    url_imagen = models.URLField()
    ciudad = models.CharField(max_length=255)
    ubicacion = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class CustomUser(AbstractUser):
    """
    Utilizamos AbstractUser para extender el modelo de usuario de Django
    """
    email = models.EmailField(unique=True)  # El email del usuario sera unico
    foto_perfil = models.ImageField(upload_to="perfil/", blank=True, null=True)  # Foto de usuario opcionalmente

    def __str__(self):
        return self.username  # Retorna el nombre de usuario
