from django.http import JsonResponse
from game.models.message.message import Message
from django.utils import timezone


def getMessage(request):
    messages = Message.objects.all().order_by('create_time')  # 按照创建时间升序获取所有留言
    message = []
    for m in messages:
        create_time = timezone.localtime(m.create_time).strftime("%Y-%m-%d %H:%M:%S")
        message.append({
            "username": m.username,
            "photo": m.photo,
            "text": m.text,
            "create_time": create_time,
        })
    result = {"data": message}
    return JsonResponse(result)
