from django.http import JsonResponse
from game.models.message.message import Message
from datetime import datetime


def addMessage(request):
    if request.method == "POST":
        data = request.POST
        username = data.get('username')
        photo = data.get('photo')
        text = data.get('text')
        if not text:
            return JsonResponse({"error": "text is null"});
        time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        Message.objects.create(username=username, photo=photo, text=text, create_time=time)
        return JsonResponse({"result": "success"})
