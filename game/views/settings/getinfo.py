from django.http import JsonResponse
from game.models.player.player import Player


def getinfo_acapp(request):
    player = Player.objects.get(user=user)  # 获取用户信息
    return JsonResponse({
        "result": "success",
        "username": player.user.username,
        "photo": player.photo
    })


def getinfo_web(request):
    user = request.user # 获取用户
    if not user.is_authenticated: # 判断是否登录
        return JsonResponse({
            "result": "未登录"
        })
    else:
        player = Player.objects.get(user=user)  # 获取用户信息
        return JsonResponse({
            "result": "success",
            "username": player.user.username,
            "photo": player.photo
        })


def getinfo(request):
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    else:
        return getinfo_web(request)
