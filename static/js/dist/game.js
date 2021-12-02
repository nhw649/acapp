class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="menu-field-item menu-field-item-single">单人模式</div>
        <br>
        <br>
        <div class="menu-field-item menu-field-item-multi">多人模式</div>
        <br>
        <br>
        <div class="menu-field-item menu-field-item-settings">退出</div>
    </div>
</div>
`);
        this.$menu.hide(); // 用户登录后才显示
        this.root.$ac_game.append(this.$menu); // 将菜单渲染到界面上
        this.$single = this.$menu.find(".menu-field-item-single");
        this.$multi = this.$menu.find(".menu-field-item-multi");
        this.$settings = this.$menu.find(".menu-field-item-settings");
        this.start();
    }

    start () {
        this.add_listening_events();
    }

    add_listening_events () {
        this.$single.click(() => {
            this.root.playground.show(); // 显示游戏场景
            this.hide();
        });
        this.$multi.click(() => {
            console.log("multi")
        });
        this.$settings.click(() => {
            $.ajax({
                url: "https://app372.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function (res) {
                    if (res.result === "success") { // 已登录
                        location.reload();
                    } 
                }
            })
        })
    }

    show () {
        this.$menu.show();
    }

    hide () {
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
// 按帧对网页进行重绘
requestAnimationFrame(AC_GAME_ANIMATION);class GameMap extends AcGameObject {
    constructor(playground) {
        super(); // 相当于将自己注册到了AC_GAME_OBJECTS数组中
        this.playground = playground;
        this.$canvas = $(`<canvas style="width:100%;height:100%;"></canvas>`); // 创建canvas
        this.ctx = this.$canvas[0].getContext("2d"); // 创建context对象
        this.ctx.canvas.width = this.playground.width; // 设置canvas的宽度
        this.ctx.canvas.height = this.playground.height; // 设置canvas的高度
        this.playground.$playground.append(this.$canvas); // 将canvas添加到游戏界面上
    }

    start() {}

    update() {
        this.render(); // 每一帧都画一个地图
    }

    render() {
        this.ctx.fillStyle = "rgba(131,175,155,0.3)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class Particle extends AcGameObject {
    constructor(playground, x, y, radius, color, vx, vy, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 100; // 用来进行比较
    }

    start() {

    }

    update() {
        if (this.speed < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground
        this.ctx = this.playground.game_map.ctx; // 获取context对象
        this.x = x;
        this.y = y;
        this.vx = 0; // x轴的移动速度方向
        this.vy = 0; // y轴的移动速度方向
        this.damage_x = 0; // x轴击退
        this.damage_y = 0; // y轴击退
        this.damage_speed = 0; // 击退速度
        this.friction = 0.9; // 击退摩擦力
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.move_length = 0; // 保存两点之间的距离
        this.eps = 0.1; // 用来和移动距离进行比较

        this.spend_time = 0; // 倒计时开始
        this.cur_skill = null; // 存储技能

        if (this.is_me) { // 是自己才使用头像
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start () {
        if (this.is_me) { // 是自己才添加鼠标点击移动事件
            this.add_listening_events();
        } else { // AI
            setInterval(() => {
                // 创建随机移动位置
                let tx = Math.random() * this.playground.width;
                let ty = Math.random() * this.playground.height;
                this.move_to(tx, ty);
            }, 5000);
        }
    }

    add_listening_events () {
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false; // 防止右键出现菜单选项
        })
        this.playground.game_map.$canvas.mousedown((e) => {
            const rect = this.ctx.canvas.getBoundingClientRect(); // 返回元素的大小及其相对于视口的位置

            if (e.which === 3) { // 右键移动
                this.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) { // 左键发射技能
                if (this.cur_skill === "fireball") { // 火球技能
                    this.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }
                this.cur_skill = null; // 清空
            }
        })
        $(window).keydown((e) => {
            if (e.keyCode === 81 && this.radius >= 10) {
                this.cur_skill = "fireball";
                return false;
            }
        })
    }


    shoot_fireball (tx, ty) {
        // if (this.playground.players.indexOf(this) === -1) { // 玩家死亡不能发射火球
        //     return;
        // }
        let x = this.x;
        let y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let speed = this.playground.height * 0.5;
        let color = "orange";
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let move_length = this.playground.height * 1.3; // 火球移动距离
        // 创建火球,伤害值比例是玩家半径比例的20%,相当于可打掉玩家20%血量
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
    }

    move_to (tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty); // 两点之间的距离
        let angle = Math.atan2(ty - this.y, tx - this.x); // 角度方向
        this.vx = Math.cos(angle); // 单位x轴速度
        this.vy = Math.sin(angle); // 单位y轴速度
    }

    is_attacked (angle, damage) { // 被攻击触发效果
        // 粒子效果
        for (let i = 0; i < Math.random() * 5 + 10; i++) {
            let x = this.x,
                y = this.y;
            let radius = this.radius * Math.random() * 0.7;
            let color = this.color;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle),
                vy = Math.sin(angle);
            let speed = this.speed * 6;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, x, y, radius, color, vx, vy, speed, move_length);
        }
        this.radius -= damage; // 玩家血量(半径)减少
        if (this.radius < 10) {
            this.destroy(); // 玩家死亡
            return false;
        }
        // 击退效果
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 50;
        this.speed *= 0.8; // 血量减少移速变慢
    }

    get_dist (x1, y1, x2, y2) { // 获取两点距离
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update () {
        this.spend_time += this.timedelta / 1000;
        if (!this.is_me && this.spend_time > 4 && Math.random() < 1 / 100) { // AI自动攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            while (player === this) { // AI不能攻击自己
                player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
                if (this.playground.players.length === 1) { // 防止死循环
                    return false;
                }
            }
            let tx = player.x + this.vx * this.speed * this.timedelta / 1000 * 0.3; // 预估下一时刻玩家位置
            let ty = player.y + this.vy * this.speed * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }
        if (this.damage_speed > 10) {
            // 击退时不受控制
            this.vx = this.vy = 0;
            this.move_length = 0;
            // 击退位移
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction; // 击退速度减少
        } else {
            if (this.move_length < this.eps) { // 已经移动到指定位置,不需要移动了
                this.move_length = 0; // 移动距离置为0
                this.vx = this.vy = 0; // 单位速度置为0
                if (!this.is_me) {
                    // 如果是AI到头,重新创建随机移动位置
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else { // 需要移动
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 真实的需要移动的距离
                this.x += moved * this.vx; // 确定方向＋移动距离
                this.y += moved * this.vy;
                this.move_length -= moved;
            }
        }
        this.render(); // 每一帧都画一个玩家
    }

    on_destroy () { // 玩家死亡从玩家列表中删除
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }

    render () {
        if (this.is_me) { // 是自己才渲染头像
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
}class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius; // 火球半径
        this.vx = vx; // 火球x轴移动速度方向
        this.vy = vy; // 火球y轴移动速度方向
        this.color = color;
        this.speed = speed; // 火球移动速度
        this.move_length = move_length; // 火球移动距离
        this.damage = damage; // 火球伤害
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

        // 判断火球是否撞击
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                // 火球攻击到AI了
                this.attacked(player);
            }
        }
        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) { // 火球是否与玩家相撞
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < (player.radius + this.radius)) { // 两点间距离小于半径之和即被攻击到了
            return true;
        }
        return false;
    }

    attacked(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x); // 确定被攻击后退的方向
        player.is_attacked(angle, this.damage); // 被攻击了
        this.destroy(); // 火球消失
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
        this.start();
    }

    get_random_color() {
        let color = ["blue", "pink", "yellow", "red", "grey", "green"];
        return color[Math.floor(Math.random() * 6)];
    }

    start() {
        this.hide(); // 隐藏游戏界面
    }

    show() {
        this.$playground.show();
        this.width = this.$playground.width(); // 存储界面的宽度
        this.height = this.$playground.height(); // 存储界面的高度
        this.game_map = new GameMap(this); // 创建游戏地图

        this.players = []; // 保存游戏玩家
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.2, true)); // 创建自己
        for (let i = 0; i < 10; i++) {
            // 创建AI
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.2, false))
        }
    }

    hide() {
        this.$playground.hide();
    }
}class Settings {
    constructor(root) {
        this.root = root;
        this.username = ""; // 存储用户
        this.photo = ""; // 存储头像
        this.platform = "web"; // 默认为web端
        if (this.root.AcWingOS) {
            this.platform = "ACAPP";
        }
        this.$settings = $(`
        <div class="acgame-settings">
        <div class="settings-login">
            <div class="login-tittle">
                登录
            </div>
            <div class="login-username">
                <div class="login-item">
                    用户名：<input type="text" class="form-control" placeholder="请输入用户">
                </div>
            </div>
            <div class="login-password">
                <div class="login-item">
                    密码：<input type="password" class="form-control" placeholder="请输入密码">
                </div>
            </div>
            <div class="login-error-message">
                <p class="text-danger"></p>
            </div>
            <div class="login-register">
                <p class="text-muted">注册</p>
            </div>
            <div class="login-submit">
                <div class="login-item">
                    <button class="btn btn-primary">登录</button>
                </div>
            </div>
            <div class="login-third-party">
                <img src="https://app372.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                <p class="text-muted">AcWing一键登录</p>
            </div>
        </div>
        <div class="settings-register">
            <div class="register-tittle">
                注册
            </div>
            <div class="register-username">
                <div class="register-item">
                    用户名：<input type="text" class="form-control" placeholder="请输入用户">
                </div>
            </div>
            <div class="register-password">
                <div class="register-item">
                    密码：<input type="password" class="form-control" placeholder="请输入密码">
                </div>
            </div>
            <div class="register-confirm-password">
                <div class="register-item">
                    确认密码：<input type="password" class="form-control" placeholder="请再次输入密码">
                </div>
            </div>
            <div class="register-error-message">
                <p class="text-danger"></p>
            </div>
            <div class="register-submit">
                <div class="register-item">
                    <button class="btn btn-primary">注册</button>
                </div>
            </div>
            <div class="register-back">
                <div class="register-item">
                    <button class="btn btn-primary">返回</button>
                </div>
            </div>
        </div>
    </div>
        `);

        // 登录相关元素
        this.$login = this.$settings.find(".settings-login");
        this.$login_username = this.$settings.find(".login-username input");
        this.$login_password = this.$settings.find(".login-password input");
        this.$login_error_message = this.$settings.find(".login-error-message p");
        this.$login_register = this.$settings.find(".login-register p");
        this.$login_submit = this.$settings.find(".login-submit button");
        this.$login.hide();

        // 注册相关元素
        this.$register = this.$settings.find(".settings-register");
        this.$register_username = this.$settings.find(".register-username input");
        this.$register_password = this.$settings.find(".register-password input");
        this.$register_confirm_password = this.$settings.find(".register-confirm-password input");
        this.$register_confirm_password = this.$settings.find(".register-error-message p");
        this.$register_submit = this.$settings.find(".register-submit button");
        this.$register_back = this.$settings.find(".register-back button");
        this.$register.hide();

        this.root.$ac_game.append(this.$settings); // 添加到页面上
        this.start();
    }

    add_listening_events () { // 事件监听
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login () {
        this.$login_register.click(() => {
            this.$login.fadeOut(300);
            this.$register.fadeIn(300);
        });
        console.log(this.$login_submit);
        this.$login_submit.click(() => {
            this.user_login();
        })
    }

    user_login () {
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();
        let outer = this;
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                "username": username,
                "password": password
            },
            success: function (res) {
                if (res.result === "success") { // 已登录
                    location.reload(); // 登录成功后刷新
                } else {
                    outer.$login_error_message.html(res.result);
                }
            }
        })
    }

    user_logout () {

    }

    user_register () {

    }

    add_listening_events_register () {
        this.$register_back.click(() => {
            this.$register.fadeOut(300);
            this.$login.fadeIn(300);
        })
    }

    start () {
        this.getinfo();
        this.add_listening_events();
    }

    register () { // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login () { // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo () {
        let outer = this;
        // 从服务器获取用户信息
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                "platform": outer.platform
            },
            success: function (res) {
                if (res.result === "success") { // 已登录
                    outer.username = res.username;
                    outer.photo = res.photo;
                    console.log(outer);
                    outer.hide();
                    outer.root.menu.show();
                } else { // 未登录
                    outer.login();
                }
            }
        })
    }

    hide () { }

    show () { }
}export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.AcWingOS = AcWingOS; // 在acwing打开界面时,会加入该参数,实现多端调用不同的后端函数
        this.$ac_game = $('#' + this.id);

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start () { }
}