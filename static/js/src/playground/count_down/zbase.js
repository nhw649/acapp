class CountDown extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; // 获取画笔对象
        this.text = "5"; // 倒计时文字
    }

    start() {
    }

    write(text) { // 修改倒计时文字
        if (text > 0) {
            this.text = text;
        }
    }

    late_update() {
        this.render();
    }

    render() {
        if (this.playground.mode === "multi mode" && this.playground.players.length !== this.playground.join_player_total) {
            // 多人模式玩家处于准备时不能开始倒计时
            return false;
        }
        // 渲染灰色蒙版
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 渲染文字
        this.ctx.font = "45px 黑体";
        this.ctx.fillStyle = "rgb(113,248,83)";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.fillText("快去找个好位置,距离游戏开始还剩:" + this.text + "s", this.playground.width / 2, this.playground.height / 4); // 后两个参数是提示板位置
    }
}