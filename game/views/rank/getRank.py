from django.http import JsonResponse
from django.core import serializers
from django.core.paginator import Paginator, PageNotAnInteger, InvalidPage
from game.models.player.player import Player


def getRank(request):
    players = Player.objects.all().order_by('-score')  # 降序获取所有玩家信息
    playerList = []
    # 分页功能,一页5条数据
    paginator = Paginator(players, 5)
    # 获取指定页码
    page = request.GET.get('page')
    # 获取指定页码数据
    try:
        pagePlayers = paginator.page(page)
    except PageNotAnInteger:
        # 如果页数不是整数，返回第一页
        pagePlayers = paginator.page(1)
    except InvalidPage:
        # 如果页数不存在/不合法，返回最后一页
        pagePlayers = paginator.page(paginator.num_pages)

    num = (int(page) - 1) * 5 + 1  # 计算名次
    for player in pagePlayers:
        playerList.append({
            "num": num,
            "username": player.user.username,
            "photo": player.photo,
            "score": player.score,
        })
        num += 1
    # 分别为是否有上一页false/true,是否有下一页false/true,总共多少页,当前页面的数据
    result = {
        'has_previous': pagePlayers.has_previous(),
        'has_next': pagePlayers.has_next(),
        'num_pages': pagePlayers.paginator.num_pages,
        'playerList': playerList
    }
    return JsonResponse(result)
