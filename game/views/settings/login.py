from django.contrib.auth import login, authenticate
from django.http import JsonResponse


def userLogin(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password) # 验证用户的证书
    if not user:
        return JsonResponse({
            "result": "用户名或密码不正确"
        })
    else:
        login(request, user) # session存储用户ID
        return JsonResponse({
            "result": "success"
        })
