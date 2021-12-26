from django.urls import path
from game.views.rank.getRank import getRank

urlpatterns = [
    path('getRank/', getRank, name='rank_getRank'),
]