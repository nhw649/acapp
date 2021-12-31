from django.urls import path
from game.views.skin.getSkin import getSkin

urlpatterns = [
    path('getSkin/', getSkin, name='skin_getSkin'),
]
