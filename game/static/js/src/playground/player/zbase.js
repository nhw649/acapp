class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground
        this.ctx = this.playground.game_map.ctx; // 获取context对象
        this.x = x;
        this.y = y;
        this.vx = 1; // x轴的移动速度
        this.vy = 1; // y轴的移动速度
        this.radiux = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.move_length = 0; // 保存需要移动的距离
        this.eps = 0.1; // 用来和移动距离进行比较
    }

    start() {
        if (this.is_me) { // 是自己才添加鼠标点击移动事件
            this.add_listening_events();
        }
    }

    add_listening_events() {
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false; // 防止右键出现菜单选项
        })
        this.playground.game_map.$canvas.mousedown((e) => {
            if (e.which === 3) {
                this.move_to(e.clientX, e.clientY);
            }
        })
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty); // 两点之间的距离
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    get_dist(x1, y1, x2, y2) { // 获取两点距离
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        if (this.move_length < this.eps) { // 不需要移动了
            this.move_length = 0; // 移动距离置为0
            this.vx = this.vy = 0; // 速度置为0
        } else { // 需要移动
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 真实的需要移动的距离
            console.log(this.move_length, this.speed * this.timedelta / 1000)
            this.x += moved * this.vx;
            this.y += moved * this.vy;
        }
        this.render(); // 每一帧都画一个玩家
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radiux, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}