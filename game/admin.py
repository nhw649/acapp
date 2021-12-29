from django.contrib import admin
from game.models.player.player import Player
from game.models.message.message import Message

# Register your models here.
admin.site.register(Player)
admin.site.register(Message)
