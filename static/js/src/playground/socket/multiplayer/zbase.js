class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app372.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start() {
        this.receive();
    }

    receive() {
        this.ws.onmessage = ((e) => { // 接收服务器发送的消息
            let data = JSON.parse(e.data);
            console.log(data)
            let event = data.event;
            let uuid = data.uuid;
            if (uuid === this.uuid) { // 是自己就过滤掉
                return false;
            }
            if (event === "create_player") {
                this.receive_create_player(uuid, data.username, data.photo);
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
}