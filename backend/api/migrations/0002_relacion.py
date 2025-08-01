# Generated by Django 5.0.3 on 2025-04-15 08:29

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Relacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('creado', models.DateTimeField(auto_now_add=True)),
                ('seguido', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seguidores', to=settings.AUTH_USER_MODEL)),
                ('seguidor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='siguiendo', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('seguidor', 'seguido')},
            },
        ),
    ]
