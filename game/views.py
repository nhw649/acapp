from django.http import HttpResponse


def index(request):
    return HttpResponse("<h1>哈哈哈123</h1>")

def play(request):
    return HttpResponse("<h1>游戏界面</h1>")

