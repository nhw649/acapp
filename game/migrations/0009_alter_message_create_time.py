# Generated by Django 3.2.8 on 2021-12-30 10:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0008_alter_message_create_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='create_time',
            field=models.DateTimeField(auto_now_add=True, verbose_name='创建时间'),
        ),
    ]