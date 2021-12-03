from django.contrib.auth import logout
from django.http import JsonResponse


def userLogout(request):
    user = request.user  # 获取用户
    if not user.is_authenticated:  # 判断用户是否登录
        return JsonResponse({
            "result": "success"
        })
    logout(request)
    return JsonResponse({
        "result": "success"
    })
