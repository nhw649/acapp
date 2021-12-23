#! /usr/bin/env python3

import glob
import sys

sys.path.insert(0, glob.glob('../../')[0])  # 这样才能引入django的包

from match_server.match import Match  # 导入Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from queue import Queue  # 消息队列
from time import sleep  # 推迟调用线程的运行
from threading import Thread  # 导入开启线程

from acapp.asgi import channel_layer  # 使用channels中的函数
from asgiref.sync import async_to_sync  # 异步转同步
from django.core.cache import cache  # redis

queue = Queue()  # 初始化消息队列


# 玩家
class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0  # 初始化等待时间


# 匹配池
class Pool:
    def __init__(self):
        self.players = []

    def add_player(self, player):
        self.players.append(player)

    def check_match(self, a, b):  # 检查是否能够匹配
        # if a.username == b.username:  # 不能匹配自己
        #     return False
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    def match_success(self, ps):
        print("Match Success: %s %s %s" % (ps[0].username, ps[1].username, ps[2].username))
        # 房间名(方便使用keys查找)
        room_name = "room-%s-%s-%s" % (ps[0].uuid, ps[1].uuid, ps[2].uuid)
        players = [] # 匹配玩家列表
        # 加入同一组
        for p in ps:  # 枚举匹配成功的玩家
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                'hp': 100  # 血量
            })
        cache.set(room_name, players, 3600)  # 加入redis
        # 广播
        for p in ps:  # 枚举匹配成功的玩家
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type': 'group_send_event',  # 接收组内消息的函数名
                    'event': 'create_player',
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                }
            )

    def increase_waiting_time(self):  # 增加等待时间
        for player in self.players:
            player.waiting_time += 1

    def match(self):
        while (len(self.players) >= 3):
            self.players = sorted(self.players, key=lambda p: p.score)  # 分数从小到大排序
            flag = False  # 标记是否匹配
            for i in range(len(self.players) - 2):  # 检查三个玩家是否匹配
                a, b, c = self.players[0], self.players[1], self.players[2]
                if self.check_match(a, b) and self.check_match(b, c) and self.check_match(a, c):
                    self.match_success([a, b, c])
                    self.players = self.players[:i] + self.players[i + 3:]  # 删除已匹配玩家
                    flag = True
                    break
            if not flag:  # 没发生匹配直接退出
                break
        self.increase_waiting_time()


class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        print("Add Player: %s %d" % (username, score))
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0


# 取出消息队列中的玩家
def get_player_from_queue():
    try:
        return queue.get_nowait()  # get_nowait若无元素会抛出异常
    except:
        return None


# 生产者与消费者模型
def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()  # 取出消息队列中的玩家
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)  # 多线程

    Thread(target=worker, daemon=True).start()  # 开启线程
    print('Starting the server...')
    server.serve()
    print('done.')
