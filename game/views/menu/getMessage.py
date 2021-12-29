from django.http import JsonResponse
from game.models.message.message import Message


def getMessage(request):
    messages = Message.objects.all().order_by('create_time')  # 按照创建时间升序获取所有留言
    message = []
    for m in messages:
        message.append({
            "username": m.user.username,
            "photo": m.photo,
            "text": m.text,
            "create_time": m.create_time,
        })
    result = {"message":message}
    return JsonResponse(result)
