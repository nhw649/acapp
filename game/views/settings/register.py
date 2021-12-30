from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player


def userRegister(request):
    data = request.GET
    username = data.get('username').strip()
    password = data.get('password').strip()
    confirm_password = data.get('confirm_password').strip()

    if not username or not password:
        return JsonResponse({
            "result": "用户名和密码不能为空"
        })
    if password != confirm_password:
        return JsonResponse({
            "result": "两次输入的密码不一致"
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            "result": "用户名已存在"
        })

    # user = User(username=username)
    # user.set_password(password)  # 加密,生成哈希串
    # user.save()
    user = User.objects.create_user(username=username, password=password)
    user.save()
    Player.objects.create(
        user=user,
        photo="https://img2.baidu.com/it/u=304846655,1860504905&fm=26&fmt=auto"
    )
    login(request, user)
    return JsonResponse({
        "result": "success"
    })
