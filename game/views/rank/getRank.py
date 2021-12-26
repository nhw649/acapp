import json

from django.http import JsonResponse
from django.core import serializers
from django.core.paginator import Paginator, PageNotAnInteger, InvalidPage
from game.models.player.player import Player


def getRank(request):
    players = Player.objects.all().order_by('-score')  # 降序获取所有玩家信息
    playerList = []
    # 分页功能,一页5条数据
    paginator = Paginator(players, 5)
    if request.method == 'GET':
        # 默认显示第一页的数据
        pagePlayers = paginator.page(1)
        for player in pagePlayers:
            playerList.append({
                "username": player.user.username,
                "photo": player.photo,
                "score": player.score
            })
        return JsonResponse({"playerList": playerList})

    if request.is_ajax():  # Ajax数据交互
        page = request.GET.get('page')
        try:
            pagePlayers = paginator.page(page)
        except PageNotAnInteger:
            # 如果页数不是整数，返回第一页
            pagePlayers = paginator.page(1)
        except InvalidPage:
            # 如果页数不存在/不合法，返回最后一页
            pagePlayers = paginator.page(paginator.num_pages)
        for player in pagePlayers:
            playerList.append({
                "username": player.user.username,
                "photo": player.photo,
                "score": player.score
            })
        # 分别为是否有上一页false/true，是否有下一页false/true，总共多少页，当前页面的数据
        result = {
            'has_previous': users.has_previous(),
            'has_next': users.has_next(),
            'num_pages': users.paginator.num_pages,
            'playerList': playerList
        }
        return JsonResponse(result)

    # queryPlayerList = []
    # for player in pagePlayers:
    #     queryPlayerList.append({
    #         "username": player.user.username,
    #         "photo": player.photo,
    #         "score": player.score
    #     })
    # # list转换为json
    # formatPlayerList = json.dumps(queryPlayerList, ensure_ascii=False)
    # playerList = json.loads(formatPlayerList)
    # return JsonResponse({
    #     "result": "success",
    #     "playerList": playerList
    # })
