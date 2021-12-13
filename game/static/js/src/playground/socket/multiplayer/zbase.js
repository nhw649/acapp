class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app372.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start() {
        this.receive();
    }

    get_player(uuid) { // 获取玩家
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }
        return null;
    }

    receive() {
        this.ws.onmessage = ((e) => { // 接收服务器发送的消息
            let data = JSON.parse(e.data);
            let event = data.event;
            let uuid = data.uuid;
            if (uuid === this.uuid) { // 是自己就过滤掉
                return false;
            }
            // 路由
            if (event === "create_player") {
                this.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                this.receive_move_to(uuid, data.tx, data.ty);
            }
        })
    }

    send_create_player(username, photo) { // 向服务器发送创建玩家消息
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'create_player',
            'uuid': outer.uuid,
            'username': username,
            'photo': photo
        }))
    }

    receive_create_player(uuid, username, photo) { // 处理创建玩家消息
        // 创建敌人
        let player = new Player(this.playground, this.playground.width / 2 / this.playground.scale, 0.5, 0.05, "white", 0.2, "enemy", username, photo);
        player.uuid = uuid; // 统一不同窗口同一玩家的uid
        this.playground.players.push(player);
    }

    send_move_to(tx, ty) { // 向服务器发送玩家移动消息
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }))
    }

    receive_move_to(uuid, tx, ty) { // 处理玩家移动消息
        let player = this.get_player(uuid);
        if (player) { // 玩家存在
            player.move_to(tx, ty);
        }
    }
}