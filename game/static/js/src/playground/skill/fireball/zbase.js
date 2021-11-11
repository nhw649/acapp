class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius; // 火球半径
        this.vx = vx; // 火球x轴移动速度
        this.vy = vy; // 火球y轴移动速度
        this.color = color;
        this.speed = speed; // 火球移动速度
        this.move_length = move_length; // 火球移动距离
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
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}