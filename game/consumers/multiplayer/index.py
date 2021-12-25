from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from match_system.src.match_server.match import Match
from game.models.player.player import Player
from channels.db import database_sync_to_async


class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        print('accept')
        await self.accept()  # 接收连接

    async def disconnect(self, close_code):  # 断开连接(但断开连接不一定执行,如电脑断电)
        print('disconnect')
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)  # 删除组

    async def create_player(self, data):
        self.room_name = None
        self.uuid = data['uuid']
        # Make socket
        transport = TSocket.TSocket('127.0.0.1', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)
        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)
        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)()
        # Connect!
        transport.open()
        # 添加玩家到匹配系统
        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)
        # Close!
        transport.close()

    # async def remove_player(self, data):
    #     self.uuid = data['uuid']
    #     # Make socket
    #     transport = TSocket.TSocket('127.0.0.1', 9090)
    #     # Buffering is critical. Raw sockets are very slow
    #     transport = TTransport.TBufferedTransport(transport)
    #     # Wrap in a protocol
    #     protocol = TBinaryProtocol.TBinaryProtocol(transport)
    #     # Create a client to use the protocol encoder
    #     client = Match.Client(protocol)
    #
    #     def db_get_player():
    #         return Player.objects.get(user__username=data['username'])
    #
    #     player = await database_sync_to_async(db_get_player)()
    #     # Connect!
    #     transport.open()
    #     # 从匹配系统移除玩家
    #     client.remove_player(player.score, data['uuid'], data['username'], self.channel_name)
    #     # Close!
    #     transport.close()

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
        if not self.room_name:
            return

        players = cache.get(self.room_name)  # 获取匹配玩家列表

        if not players:
            return

        for player in players:
            if player['uuid'] == data['attackee_uuid']:  # 匹配被攻击者uuid
                player['hp'] -= 25

        remain_cnt = 0  # 剩余玩家数量
        for player in players:
            if player['hp'] > 0:
                remain_cnt += 1

        if remain_cnt > 1:
            if self.room_name:
                cache.set(self.room_name, players, 3600)  # 更新redis
        else:  # 没有剩余玩家则更新数据库
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username=username)
                player.score += score
                player.save()  # 保存数据

            for player in players:
                if player['hp'] <= 0:  # 失败扣5分
                    await database_sync_to_async(db_update_player_score)(player['username'], -5)
                else:  # 胜利加10分
                    await database_sync_to_async(db_update_player_score)(player['username'], 10)

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
        if not self.room_name:
            return
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
        # 更新房间名
        if not self.room_name:
            keys = cache.keys('*%s*' % self.uuid)  # 找到当前玩家所在的房间
            if keys:
                self.room_name = keys[0]
        # 向前端发送消息
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):  # 接受前端发的消息
        data = json.loads(text_data)
        event = data['event']
        if event == 'create_player':
            await self.create_player(data)
        elif event == 'remove_player':
            await self.remove_player(data)
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
