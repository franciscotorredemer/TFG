# Generated by Django 5.0.3 on 2025-05-07 20:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_actividad_url_imagen_alter_hotel_imagen'),
    ]

    operations = [
        migrations.RenameField(
            model_name='actividad',
            old_name='ciudad',
            new_name='direccion',
        ),
    ]
