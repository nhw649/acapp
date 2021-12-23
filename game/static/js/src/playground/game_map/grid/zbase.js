class Grid extends AcGameObject {
    constructor(playground, ctx, i, j, l, stroke_color) {
        super();
        this.playground = playground;
        this.ctx = ctx;
        // 每个格子
        this.i = i;
        this.j = j;
        this.l = l; // 0.15
        // 格子的位置
        this.x = this.i * this.l;
        this.y = this.j * this.l;
        this.stroke_color = stroke_color;
    }

    start() {
    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy;
        let cx = ctx_x + this.l * 0.5, cy = ctx_y + this.l * 0.5; // grid的中心坐标
        // 处于屏幕范围外，则不渲染
        if (cx * scale < -0.2 * this.playground.width ||
            cx * scale > 1.2 * this.playground.width ||
            cy * scale < -0.2 * this.playground.height ||
            cy * scale > 1.2 * this.playground.height) {
            return;
        }
        this.render_grid(ctx_x, ctx_y, scale);
    }

    render_grid(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = this.l * 0.005 * scale;
        this.ctx.strokeStyle = this.stroke_color;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.l * scale, this.l * scale);
        this.ctx.stroke();
        this.ctx.restore();
    }
}