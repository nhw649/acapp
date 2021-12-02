from django.urls import path
from game.views.settings.getinfo import getinfo
from game.views.settings.login import userLogin
from game.views.settings.logout import userLogout

urlpatterns = [
    path('getinfo/', getinfo, name='settings_getinfo'),
    path('login/', userLogin, name='settings_login'),
    path('logout/', userLogout, name='settings_logout')
]
