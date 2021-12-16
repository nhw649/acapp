class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; // 获取画笔对象
        this.text = "已准备：0人"; // 提示板文字
    }

    start() {

    }

    write(text) { // 修改提示板文字
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20); // 后两个参数是提示板位置
    }
}