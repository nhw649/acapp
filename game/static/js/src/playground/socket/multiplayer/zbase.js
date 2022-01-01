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
                this.receive_create_player(uuid, data.username, data.photo, data.px, data.py);
            } else if (event === "move_to") {
                this.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                this.receive_shoot_fireball(uuid, data.tx, data.ty, data.fireball_uuid);
            } else if (event === "attack") {
                this.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.fireball_uuid);
            } else if (event === "blink") {
                this.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                this.receive_chat_message(uuid, data.username, data.text);
            }
        })
    }

    send_create_player(username, photo, px, py, total) { // 向服务器发送创建玩家消息
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'create_player',
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
            'px': px,
            'py': py,
            'total': total,
        }))
    }

    receive_create_player(uuid, username, photo, px, py) { // 处理创建玩家消息
        // 创建敌人
        let player = new Player(this.playground, px, py, this.playground.player_radius, this.playground.player_color, this.playground.player_speed, "enemy", username, photo);
        player.uuid = uuid; // 统一不同窗口同一玩家的uid
        this.playground.players.push(player);
        this.playground.player_total = this.playground.players.length; // 玩家总数量
    }

    // send_remove_player(username) { // 向服务器发送删除玩家消息
    // let outer = this;
    // this.ws.send(JSON.stringify({
    //     'event': 'remove_player',
    //     'uuid': outer.uuid,
    //     'username': username,
    // }))
    // }

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

    send_shoot_fireball(tx, ty, fireball_uuid) { // 向服务器发送发射火球消息
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'fireball_uuid': fireball_uuid
        }))
    }

    receive_shoot_fireball(uuid, tx, ty, fireball_uuid) { // 处理发射火球消息
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = fireball_uuid; // 同一个火球需要在不同窗口统一uuid
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, fireball_uuid) { // 向服务器发送攻击消息
        // x,y:被击中玩家的坐标,angle:被击中的朝向,fireball_uuid:广播火球,防止击中玩家后未消失
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'fireball_uuid': fireball_uuid
        }))
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, fireball_uuid) { // 处理攻击消息
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, fireball_uuid, attacker)
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'blink',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }))
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_chat_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'message',
            'uuid': outer.uuid,
            'username': username,
            'text': text
        }))
    }

    receive_chat_message(uuid, username, text) {
        this.playground.chat_field.add_message(username, text); // 添加到聊天历史记录上
    }
}