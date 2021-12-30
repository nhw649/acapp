from django.urls import path
from game.views.menu.getMessage import getMessage
from game.views.menu.addMessage import addMessage

urlpatterns = [
    path('getMessage/', getMessage, name='menu_getMessage'),
    path('addMessage/', addMessage, name='menu_addMessage'),
]
