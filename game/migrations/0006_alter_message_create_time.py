# Generated by Django 3.2.8 on 2021-12-30 09:41

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0005_auto_20211230_0959'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='create_time',
            field=models.DateTimeField(default=datetime.datetime(2021, 12, 30, 9, 41, 56, 26497, tzinfo=utc), verbose_name='创建时间'),
        ),
    ]
