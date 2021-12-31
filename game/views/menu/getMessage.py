from django.http import JsonResponse
from game.models.message.message import Message
from django.utils import timezone
import datetime


def getMessage(request):
    # 当前日期格式
    cur_date = timezone.now()
    # 前五天日期格式
    before_day = cur_date - datetime.timedelta(days=5)
    messages = Message.objects.filter(create_time__gte=before_day, create_time__lte=cur_date).all().order_by(
        'create_time')  # 按照创建时间升序获取前五天所有留言
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
