class Shield extends AcGameObject {
    constructor(playground, player, color) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.color = color;
        this.shield_pass_time = 0; // 护盾经过时间
        this.shield_duration_time = 5; // 护盾总持续时间
    }

    start() {
    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.player.x - this.playground.cx, ctx_y = this.player.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.1 * this.playground.width / scale ||
            ctx_x > 1.1 * this.playground.width / scale ||
            ctx_y < -0.1 * this.playground.height / scale ||
            ctx_y > 1.1 * this.playground.height / scale) {
            return;
        }

        // 渲染护盾
        if (this.player.is_shield && this.shield_pass_time <= this.shield_duration_time) { // 护盾持续3s
            this.shield_pass_time += this.player.timedelta / 1000;
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.player.radius * 3.9 * scale, 0, Math.PI * 2);
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.player.radius * 4.0 * scale, 0, Math.PI * 2, true);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        } else if (this.player.is_shield && this.shield_pass_time > this.shield_duration_time) {
            this.player.is_shield = false;
            this.destroy(); // 护盾消失
        }
    }
}