from django.contrib import admin
from game.models.player.player import Player
from game.models.message.message import Message
from game.models.skin.skin import Skin

admin.site.register(Player)
admin.site.register(Message)
admin.site.register(Skin)
