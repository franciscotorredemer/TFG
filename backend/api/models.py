
from django.db import models

class Actividad(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    url_imagen = models.URLField()
    ciudad = models.CharField(max_length=255)
    ubicacion = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre
