from django.urls import path
from game.views.menu.getMessage import getMessage

urlpatterns = [
    path('getMessage/', getMessage, name='menu_getMessage'),
]
