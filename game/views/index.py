from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt, csrf_protect


@csrf_exempt #放行csrf认证（即使settings.py中存在全局认证机制，也对此次POST请求的视图函数放行）
def index(request):
    return render(request, "multiends/web.html")
