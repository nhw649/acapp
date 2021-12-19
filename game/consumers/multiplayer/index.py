from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache


class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        print('accept')
        await self.accept()  # 接收连接

    async def disconnect(self, close_code):  # 断开连接(但断开连接不一定执行,如电脑断电)
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)  # 删除组

    async def create_player(self, data):
        self.room_name = None  # 初始化房间名

        # 匹配房间
        for i in range(1000):  # 最多1000个房间
            name = "room-%d" % (i)  # 房间名
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                # 若不存在该房间名(在房间个数限制内)或人数不足,则使用当前房间名
                self.room_name = name
                break

        # 房间名为None(房间超出限制)
        if not self.room_name:
            return

        # 存储创建的房间
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)  # 列表为玩家信息,每局对战有效时间1h

        # 向前端发送已存在的玩家信息
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': 'create_player',
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo']
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)  # 加入组

        # 存储创建的玩家消息
        players = cache.get(self.room_name)  # 获取玩家信息列表
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        cache.set(self.room_name, players, 3600)
        # 组内中发送消息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'group_send_event',  # 接收组内消息的函数名
                'event': 'create_player',
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo']
            }
        )

    async def move_to(self, data):
        # 组内中发送消息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'group_send_event',  # 接收组内消息的函数名
                'event': 'move_to',
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty']
            }
        )

    async def shoot_fireball(self, data):
        # 组内中发送消息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'group_send_event',  # 接收组内消息的函数名
                'event': 'shoot_fireball',
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
                'fireball_uuid': data['fireball_uuid']
            }
        )

    async def attack(self, data):
        # 组内中发送消息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'group_send_event',  # 接收组内消息的函数名
                'event': 'attack',
                'uuid': data['uuid'],
                'attackee_uuid': data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage': data['damage'],
                'fireball_uuid': data['fireball_uuid']
            }
        )

    async def blink(self, data):
        # 组内中发送消息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'group_send_event',  # 接收组内消息的函数名
                'event': 'blink',
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def chat_message(self, data):
        # 组内中发送消息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'group_send_event',  # 接收组内消息的函数名
                'event': 'message',
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )

    # 接收组内中的消息
    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))  # 向前端发送消息

    async def receive(self, text_data):  # 接受前端发的消息
        data = json.loads(text_data)
        event = data['event']
        if event == 'create_player':
            await self.create_player(data)
        elif event == 'move_to':
            await self.move_to(data)
        elif event == 'shoot_fireball':
            await self.shoot_fireball(data)
        elif event == 'attack':
            await self.attack(data)
        elif event == 'blink':
            await self.blink(data)
        elif event == 'message':
            await self.chat_message(data)
