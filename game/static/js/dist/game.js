class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="menu-field-item menu-field-item-single">单人模式</div>
        <br>
        <div class="menu-field-item menu-field-item-multi">多人模式</div>
        <br>
        <div class="menu-field-item menu-field-item-settings">设置</div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find(".menu-field-item-single");
        this.$multi = this.$menu.find(".menu-field-item-multi");
        this.$settings = this.$menu.find(".menu-field-item-settings");
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$single.click(() => {
            this.root.playground.show();
            this.hide();
        });
        this.$multi.click(() => {
            console.log("multi")
        });
        this.$settings.click(() => {
            console.log("settings")
        })
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false; // 是否执行过start()
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
    }

    start() { // 只会在第一帧执行

    }

    update() { // 每一帧均会执行一次

    }

    on_destroy() { // 删除前执行

    }

    destroy() { // 删除该物体
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp; // 记录上一次的时间戳
let AC_GAME_ANIMATION = (timestamp) => {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i++) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) { // 未执行过start()
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp; // 时间间隔
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION); // 递归调用
}
requestAnimationFrame(AC_GAME_ANIMATION);class GameMap extends AcGameObject {
    constructor(playground) {
        super(); // 相当于将自己注册到了AC_GAME_OBJECTS数组中
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); // 创建canvas
        this.ctx = this.$canvas[0].getContext("2d"); // 创建context对象
        this.ctx.canvas.width = this.playground.width; // 设置canvas的宽度
        this.ctx.canvas.height = this.playground.height; // 设置canvas的高度
        this.playground.$playground.append(this.$canvas); // 将canvas添加到游戏界面上
    }

    start() {
    }

    update() {
        this.render(); // 每一帧都画一个地图
    }

    render() {
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground
        this.ctx = this.playground.game_map.ctx; // 获取context对象
        this.x = x;
        this.y = y;
        this.vx = 1; // x轴的移动速度
        this.vy = 1; // y轴的移动速度
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.move_length = 0; // 保存两点之间的距离
        this.eps = 0.1; // 用来和移动距离进行比较

        this.cur_skill = null; // 存储技能
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
            if (e.which === 3) { // 右键移动
                this.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) { // 左键发射技能
                if (this.cur_skill === "fireball") { // 火球技能
                    this.shoot_fireball(e.clientX, e.clientY);
                }
                this.cur_skill = null; // 清空
            }
        })
        $(window).keydown((e) => {
            if (e.keyCode === 81) {
                this.cur_skill = "fireball";
                return false;
            }
        })
    }


    shoot_fireball(tx, ty) {
        let x = this.x;
        let y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let speed = this.playground.height * 0.5;
        let color = "orange";
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let move_length = this.playground.height * 1.3; // 火球移动距离
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length); // 创建火球
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty); // 两点之间的距离
        let angle = Math.atan2(ty - this.y, tx - this.x); // 角度方向
        this.vx = Math.cos(angle); // 单位x轴速度
        this.vy = Math.sin(angle); // 单位y轴速度
    }

    get_dist(x1, y1, x2, y2) { // 获取两点距离
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        if (this.move_length < this.eps) { // 不需要移动了
            this.move_length = 0; // 移动距离置为0
            this.vx = this.vy = 0; // 单位速度置为0
        } else { // 需要移动
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 真实的需要移动的距离
            this.x += moved * this.vx; // 确定方向＋移动距离
            this.y += moved * this.vy;
        }
        this.render(); // 每一帧都画一个玩家
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class FireBall extends AcGameObject {
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
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground"></div>
`);
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width(); // 存储界面的宽度
        this.height = this.$playground.height(); // 存储界面的高度

        this.game_map = new GameMap(this); // 创建游戏地图

        this.players = []; // 保存游戏玩家
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        this.start();
    }

    start() {
        // this.hide(); // 隐藏游戏界面
    }

    show() {
        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
    }
}export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + this.id);
        // this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {

    }
}