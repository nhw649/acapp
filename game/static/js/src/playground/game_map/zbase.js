class GameMap extends AcGameObject {
    constructor(playground) {
        super(); // 相当于将自己注册到了AC_GAME_OBJECTS数组中
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex="0"></canvas>`); // 创建canvas,tabindex="0"表示元素是可聚焦的
        this.ctx = this.$canvas[0].getContext("2d"); // 创建context对象
        this.playground.$playground.append(this.$canvas); // 将canvas添加到游戏界面上
        this.ctx.canvas.width = this.playground.width; // 设置canvas的宽度
        this.ctx.canvas.height = this.playground.height; // 设置canvas的高度
    }

    start() {
        this.$canvas.focus(); // 聚焦canvas,才能获取canvas键盘事件
        this.add_listening_events();
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
        this.ctx.fillStyle = "rgba(131,175,155,1)"; // 防止调整窗口时出现闪烁
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render() {
        this.ctx.fillStyle = "rgba(131,175,155,0.3)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}