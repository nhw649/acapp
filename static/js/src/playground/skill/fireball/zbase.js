class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius; // 火球半径
        this.vx = vx; // 火球x轴移动速度方向
        this.vy = vy; // 火球y轴移动速度方向
        this.color = color;
        this.speed = speed; // 火球移动速度
        this.move_length = move_length; // 火球移动距离
        this.damage = damage; // 火球伤害
        this.eps = 0.1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved; // 确定方向＋移动距离
        this.y += this.vy * moved;
        this.move_length -= moved; // 火球剩余距离

        // 判断火球是否撞击
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                // 火球攻击到AI了
                this.attacked(player);
            }
        }
        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) { // 火球是否与玩家相撞
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < (player.radius + this.radius)) { // 两点间距离小于半径之和即被攻击到了
            return true;
        }
        return false;
    }

    attacked(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x); // 确定被攻击后退的方向
        player.is_attacked(angle, this.damage); // 被攻击了
        this.destroy(); // 火球消失
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}