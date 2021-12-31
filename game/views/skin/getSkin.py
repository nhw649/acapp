from django.http import JsonResponse
from game.models.skin.skin import Skin


def getSkin(request):
    skins = Skin.objects.all()  # 获取所有皮肤
    skinList = []
    for skin in skins:
        skinList.append({
            "name": skin.name,
            "imgSrc": skin.imgSrc,
            "description": skin.description,
        })
    result = {"data": skinList}
    return JsonResponse(result)
