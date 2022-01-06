class Ball extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage, cur_skill) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius; // 球类半径
        this.vx = vx; // 球类x轴移动速度方向
        this.vy = vy; // 球类y轴移动速度方向
        this.color = color;
        this.speed = speed; // 球类移动速度
        this.move_length = move_length; // 球类移动距离
        this.damage = damage; // 球类伤害
        this.eps = 0.1;
        this.cur_skill = cur_skill; // 技能名
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        this.update_move();
        if (this.player.character !== "enemy") { // 其他窗口(敌人)不做碰撞判断
            this.update_attack(); // 碰撞判断
        }

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved; // 确定方向＋移动距离
        this.y += this.vy * moved;
        this.move_length -= moved; // 球类剩余距离
    }

    update_attack() {
        // 判断球类是否撞击
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                // 球类攻击到玩家了
                this.attacked(player);
                break; // 只会攻击一个玩家
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) { // 球类是否与玩家相撞
        this.distance = this.get_dist(this.x, this.y, player.x, player.y);
        // 护盾保护,不受攻击
        if (player.is_shield) {
            if (this.distance < 4 * player.radius) { // 护盾范围内
                this.destroy(); // 删除该火球
                if (this.playground.mode === "multi mode") {
                    // 向服务器发送删除火球消息(this.player是攻击者,player是被攻击者,this是火球)
                    this.playground.mps.send_destroy_ball(this.player.uuid, player.uuid, this.uuid);
                }
                return false;
            }
        }

        if (this.distance < (player.radius + this.radius)) { // 两点间距离小于半径之和即被攻击到了
            return true;
        }
        return false;
    }

    attacked(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x); // 确定被攻击后退的方向
        player.is_attacked(angle, this.damage, this.cur_skill); // 被攻击了

        if (this.playground.mode === "multi mode") {
            // 向服务器发送攻击消息
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid, this.cur_skill);
        }

        this.destroy(); // 球类消失
    }

    render() { // 渲染球类
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.1 * this.playground.width / scale ||
            ctx_x > 1.1 * this.playground.width / scale ||
            ctx_y < -0.1 * this.playground.height / scale ||
            ctx_y > 1.1 * this.playground.height / scale) {
            return;
        }
        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() { // 删除球类前需要从技能列表中删除
        let skills = this.player.skills;
        for (let i = 0; i < skills.length; i++) {
            if (skills[i] === this) {
                skills.splice(i, 1);
                break;
            }
        }
    }
}