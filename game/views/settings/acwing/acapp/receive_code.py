from django.http import JsonResponse
from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint


def receive_code(request):
    # 用户同意授权后会重定向到redirect_uri，返回参数为code和state
    data = request.GET
    if "errcode" in data:
        return JsonResponse({
            "result": "apply failed",
            "errcode": data["errcode"],
            "errmsg": data["errmsg"]
        })

    code = data.get("code")
    state = data.get("state")

    if not cache.has_key(state):  # 若不存在state,则说明是csrf攻击
        return JsonResponse({
            "result": "state not exist"
        })

    cache.delete(state)  # 使用完即可删除

    # 申请授权令牌access_token和用户的openid
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        "appid": "372",
        "secret": "5749c9e42ac94b38849ca3da450843ca",
        "code": code
    }
    access_token_res = requests.get(apply_access_token_url, params=params).json()
    access_token = access_token_res["access_token"]
    openid = access_token_res["openid"]

    players = Player.objects.filter(openid=openid)
    if players.exists():  # 若存在该授权用户则直接登录
        player = players[0]
        return JsonResponse({
            "result": "success",
            "username": player.user.username,
            "photo": player.photo
        })

    # 申请用户信息
    apply_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    userinfo_res = requests.get(apply_userinfo_url, params=params).json()
    username = userinfo_res["username"]
    photo = userinfo_res["photo"]

    while User.objects.filter(username=username).exists():  # 防止和已有用户名重复
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    return JsonResponse({
        "result": "success",
        "username": player.user.username,
        "photo": player.photo
    })
