class ScoreBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; // 获取画笔对象
        this.state = null; // 对局结束状态 win/lose
        // 对局结束状态图片
        this.win_img = new Image();
        this.win_img.src = "https://django-project.oss-cn-shanghai.aliyuncs.com/playground/score-board/win.png"
        this.lose_img = new Image();
        this.lose_img.src = "https://django-project.oss-cn-shanghai.aliyuncs.com/playground/score-board/lose.png"
    }

    start() {
    }

    late_update() {
        this.render();
    }

    add_listening_events() {
        if (this.playground.game_map.$canvas) {
            this.$canvas = this.playground.game_map.$canvas;
            this.$canvas.on('click', () => { // 点击任意键返回菜单
                this.playground.hide();
                this.playground.root.menu.show();
            })
        }
    }

    win() {
        this.state = "win";
        setTimeout(() => {
            this.add_listening_events();
        }, 1000);
    }

    lose() {
        this.state = "lose";
        setTimeout(() => {
            this.add_listening_events();
        }, 1000);
    }

    render() {
        let len = this.playground.height / 2; // 定义边长
        if (this.state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}