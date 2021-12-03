from django.urls import path, include
from game.views.settings.getinfo import getinfo
from game.views.settings.login import userLogin
from game.views.settings.logout import userLogout
from game.views.settings.register import userRegister

urlpatterns = [
    path('getinfo/', getinfo, name='settings_getinfo'),
    path('login/', userLogin, name='settings_login'),
    path('logout/', userLogout, name='settings_logout'),
    path('register/', userRegister, name='settings_register'),
    path('acwing/', include("game.urls.settings.acwing.index"))
]
