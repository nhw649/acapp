class GameMap extends AcGameObject {
    constructor(playground) {
        super(); // 相当于将自己注册到了AC_GAME_OBJECTS数组中
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0 class="game-map"></canvas>`); // 创建canvas,tabindex="0"表示元素是可聚焦的
        this.ctx = this.$canvas[0].getContext("2d"); // 创建context对象
        this.ctx.canvas.width = this.playground.width; // 设置canvas的宽度
        this.ctx.canvas.height = this.playground.height; // 设置canvas的高度
        this.playground.$playground.append(this.$canvas); // 将canvas添加到游戏界面上

        let width = this.playground.virtual_map_width; // 3
        let height = this.playground.virtual_map_height; // 3
        this.l = height * 0.05; // 0.15
        this.nx = Math.ceil(width / this.l); // 20
        this.ny = Math.ceil(height / this.l); // 20

        this.generate_grids(); // 生成网格
    }

    start() {
        this.$canvas.focus(); // 聚焦canvas,才能获取canvas键盘事件
        this.add_listening_events();
    }

    generate_grids() { // 生成网格
        this.grids = [];
        for (let i = 0; i < this.ny; i++) {
            for (let j = 0; j < this.nx; j++) {
                this.grids.push(new Grid(this.playground, this.ctx, j, i, this.l, "rgba(222, 237, 225)"));
            }
        }
    }

    add_listening_events() {
        this.$canvas.click(() => { // canvas点击事件
            this.$canvas.focus(); // 聚焦canvas,才能获取canvas键盘事件
        })
    }

    update() {
        this.render(); // 每一帧都画一个地图
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        // this.ctx.fillStyle = "rgba(137,190,178,1)"; // 防止调整窗口时出现闪烁
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render() {
        this.ctx.fillStyle = "rgb(137,190,178)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    on_destroy() {
        for (let i = 0; i < this.grids.length; i++) {
            this.grids[i].destroy();
        }
        this.grids = [];
    }
}