class ScoreBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; // 获取画笔对象
        this.state = null; // 对局结束状态 win/lose
        // 对局结束状态图片
        this.win_img = new Image();
        this.win_img.src = "https://app372.acapp.acwing.com.cn/static/image/playground/score_board/win.png"
        this.lose_img = new Image();
        this.lose_img.src = "https://app372.acapp.acwing.com.cn/static/image/playground/score_board/lose.png"
        this.close_draw_img = false;
    }

    start() {
    }

    late_update() {
        this.render();
    }

    add_listening_events() {
        this.timerId = setTimeout(() => { // 3s后失败图片消失
            this.close_draw_img = true;
        }, 3000);
    }

    win() {
        this.state = "win";
        this.add_listening_events();
    }

    lose() {
        this.state = "lose";
        this.add_listening_events();
    }

    render_back(scale) { // 渲染返回菜单提示文字
        this.ctx.font = "24px 微软雅黑";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Q/E：切换观战角色", this.playground.width / 2, scale * 0.9); // 后两个参数是提示板位置
        this.ctx.fillText("ESC：打开菜单", this.playground.width / 2, scale * 0.95); // 后两个参数是提示板位置
    }

    render() {
        let scale = this.playground.scale;
        let len = this.playground.height / 2; // 定义边长

        if (this.state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len); // 渲染失败图片
            this.render_back(scale);
        } else if (this.state === "lose") {
            if (!this.close_draw_img) { // 渲染3s的失败图片,随即观战画面
                this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len); // 渲染失败图片
            }
            this.render_back(scale);
        }
    }
}