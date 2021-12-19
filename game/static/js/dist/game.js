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

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$single.click(() => {
            this.hide();
            this.root.playground.show("single mode"); // 显示单人模式游戏场景
        });
        this.$multi.click(() => {
            this.hide();
            this.root.playground.show("multi mode"); // 显示多人模式游戏场景
        });
        this.$settings.click(() => {
            this.root.settings.user_logout();
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
        this.uuid = this.create_uuid(); // 给每个对象创建唯一编号
    }

    create_uuid() { // 创建一个8位随机的编号
        let res = '';
        for (let i = 0; i < 8; i++) {
            res += Math.floor(Math.random() * 10);
        }
        return res;
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
requestAnimationFrame(AC_GAME_ANIMATION);class ChatField {
    constructor(playground) {
        this.playground = playground;
        this.$history = $("<div class='chat-field-history'>历史记录</div>")
        this.$input = $("<input type='text' class='chat-field-input'>")
        this.$history.hide();
        this.$input.hide();
        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);
        this.timer_id = null;
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$input.keydown((e) => {
            if (e.which === 27) { // esc事件
                this.hide_input();
                return false;
            } else if (e.which === 13) { // 回车事件
                let username = this.playground.root.settings.username;
                let text = this.$input.val();
                if (text) { // 内容不为空
                    this.add_message(username, text);
                    this.$input.val(""); // 输入框置空
                    this.playground.mps.send_chat_message(username, text); // 向服务器发送聊天信息
                }
                return false;
            }
        })
        this.$input.blur(() => { // 输入框失去焦点事件
            this.$input.hide(); // 隐藏输入框,不聚焦canvas
        })
    }

    render_message(message) { // 渲染聊天历史记录信息
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) { // 添加聊天历史记录信息
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        this.$history.fadeIn();
        if (this.timer_id) clearTimeout(this.timer_id);
        this.timer_id = setTimeout(() => { // 3s后关闭历史记录
            this.$history.fadeOut();
            this.timer_id = null;
        }, 3000)
    }

    show_input() {
        this.$input.show();
        this.$input.focus(); // 聚集到输入框
        this.show_history(); // 打开历史记录
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus(); // 重新聚焦到canvas上
    }
}class GameMap extends AcGameObject {
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
}class NoticeBoard extends AcGameObject {
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
        this.eps = 0.01; // 用来进行比较
    }

    start() {
    }

    update() {
        if (this.speed * 0.1 < this.eps) {
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.move_length = 0; // 保存两点之间的距离
        this.eps = 0.01; // 用来和移动距离进行比较
        this.spend_time = 0; // 倒计时开始
        this.fireballs = []; // 存储每个玩家发的火球

        this.cur_skill = null; // 存储技能
        if (this.character !== "robot") { // 不是机器人才拥有头像
            // 创建头像图片
            this.img = new Image();
            this.img.src = this.photo;
        }
        if (this.character === "me") { // 是自己才有冷却时间
            this.fireball_coldtime = 3; // 火球冷却时间
            this.blink_coldtime = 5; // 火球冷却时间
            // 创建技能图片
            this.fireball_img = new Image();
            this.fireball_img.src = "https://django-project.oss-cn-shanghai.aliyuncs.com/playground/skill/fireball.png";

            this.blink_img = new Image();
            this.blink_img.src = "https://django-project.oss-cn-shanghai.aliyuncs.com/playground/skill/blink.png";
        }
    }

    start() {
        this.playground.player_count++; // 玩家人数+1
        this.playground.notice_board.write("已准备：" + this.playground.player_count + "人"); // 修改提示板文字

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("战斗中！");
        }
        if (this.character === "me") { // 是自己才添加鼠标点击移动事件
            this.add_listening_events();
        } else if (this.character === "robot") { // 机器人
            setInterval(() => {
                // 创建随机移动位置
                let tx = Math.random() * this.playground.width / this.playground.scale;
                let ty = Math.random() * this.playground.height / this.playground.scale;
                this.move_to(tx, ty);
            }, 5000);
        }
    }

    add_listening_events() {
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false; // 防止右键出现菜单选项
        })
        this.playground.game_map.$canvas.mousedown((e) => {
            if (this.playground.state !== "fighting")
                return false; // 匹配中不能移动
            const rect = this.ctx.canvas.getBoundingClientRect(); // 返回元素的大小及其相对于视口的位置
            if (e.which === 3) { // 右键移动
                // 鼠标按下位置相对于浏览器的位置
                let tx = (e.clientX - rect.left) / this.playground.scale;
                let ty = (e.clientY - rect.top) / this.playground.scale;
                this.move_to(tx, ty);
                if (this.playground.mode === "multi mode") {
                    this.playground.mps.send_move_to(tx, ty) // 向服务器发送玩家移动消息
                }
                if (this.cur_skill === "blink") { // 闪现技能
                    if (this.blink_coldtime > 0) // 判断闪现cd
                        return false;
                    this.blink(tx, ty);
                    if (this.playground.mode === "multi mode") {
                        this.playground.mps.send_blink(tx, ty);
                    }
                }
                this.cur_skill = null; // 清空技能
            } else if (e.which === 1) { // 左键发射技能
                let tx = (e.clientX - rect.left) / this.playground.scale;
                let ty = (e.clientY - rect.top) / this.playground.scale;
                if (this.cur_skill === "fireball") { // 火球技能
                    if (this.fireball_coldtime > 0) // 判断火球cd
                        return false;
                    let fireball = this.shoot_fireball(tx, ty); // 函数会返回火球的uuid
                    if (this.playground.mode === "multi mode") {
                        this.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid); // 向服务器发送发射火球消息
                    }
                }
                this.cur_skill = null; // 清空技能
            }
        })
        this.playground.game_map.$canvas.keydown((e) => { // 绑定到canvas上,不会触发其他窗口的键盘事件
            if (e.which === 13) // 监听回车事件
            {
                if (this.playground.mode === "multi mode") { // 打开聊天框
                    this.playground.chat_field.show_input();
                    return false;
                }
            } else if (e.which === 27) {
                if (this.playground.mode === "multi mode") { // 关闭聊天框
                    this.playground.chat_field.hide_input();
                    return false;
                }
            }
            if (this.playground.state !== "fighting")
                return true; // 匹配中不能发射火球
            if (e.which === 81 && this.radius >= this.eps) {
                if (this.fireball_coldtime > 0)
                    return true; // 火球技能冷却中
                this.cur_skill = "fireball";
                return false;
            } else if (e.which === 70) {
                if (this.blink_coldtime > 0)
                    return true; // 闪现技能冷却中
                this.cur_skill = "blink";
                return false;
            }
        })
    }

    shoot_fireball(tx, ty) {
        // if (this.playground.players.indexOf(this) === -1) { // 玩家死亡不能发射火球
        //     return;
        // }
        let x = this.x;
        let y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let speed = 0.5;
        let color = "orange";
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let move_length = 1.3; // 火球移动距离
        // 创建火球,伤害值比例是玩家半径比例的20%,相当于可打掉玩家20%血量
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3; // 重置火球cd
        return fireball; // 便于获取火球的uuid
    }

    destroy_fireball(uuid) { // 删除火球
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty) { // 闪现技能
        let d = this.get_dist(this.x, this.y, tx, ty); // 获取需要的闪现距离
        d = Math.min(d, 0.4); // 闪现最大距离为0.8
        let angle = Math.atan2(ty - this.y, tx - this.x); // 闪现角度
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5; // 重置闪现cd
        this.move_length = 0; // 闪现完停止移动
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty); // 两点之间的距离
        let angle = Math.atan2(ty - this.y, tx - this.x); // 角度方向
        this.vx = Math.cos(angle); // 单位x轴速度
        this.vy = Math.sin(angle); // 单位y轴速度
    }

    receive_attack(x, y, angle, damage, fireball_uuid, attacker) { // 收到攻击
        attacker.destroy_fireball(fireball_uuid); // 删除攻击者发出的火球
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    is_attacked(angle, damage) { // 被攻击触发效果
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
        if (this.radius < this.eps) {
            this.destroy(); // 玩家死亡
            return false;
        }
        // 击退效果
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 50;
        this.speed *= 0.8; // 血量减少移速变慢
    }

    get_dist(x1, y1, x2, y2) { // 获取两点距离
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        this.spend_time += this.timedelta / 1000;
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }
        this.update_move();
        this.render(); // 每一帧都画一个玩家
    }

    update_coldtime() { // 更新技能冷却时间
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0); // 冷却时间最小为0

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0); // 冷却时间最小为0
    }

    update_move() { // 更新玩家移动
        if (this.character === "robot" && this.spend_time > 4 && Math.random() < 1 / 100) { // 机器人自动攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            while (player === this) { // 机器人不能攻击自己
                player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
                if (this.playground.players.length === 1) { // 防止死循环
                    return false;
                }
            }
            let tx = player.x + this.vx * this.speed * this.timedelta / 1000 * 0.3; // 预估下一时刻玩家位置
            let ty = player.y + this.vy * this.speed * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }
        if (this.damage_speed > this.eps) {
            // 击退时不受控制
            this.vx = this.vy = 0;
            this.move_length = 0; // 无法移动
            this.cur_skill = null; // 击退时不能发射火球
            // 击退位移
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction; // 击退速度减少
        } else {
            if (this.move_length < this.eps) { // 已经移动到指定位置,不需要移动了
                this.move_length = 0; // 移动距离置为0
                this.vx = this.vy = 0; // 单位速度置为0
                if (this.character === "robot") {
                    // 如果是机器人到头,重新创建随机移动位置
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else { // 需要移动
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); // 真实的需要移动的距离
                this.x += moved * this.vx; // 确定方向＋移动距离
                this.y += moved * this.vy;
                this.move_length -= moved;
            }
        }
    }

    on_destroy() { // 玩家死亡从玩家列表中删除
        if (this.character === "me")
            this.playground.state = "over";
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }

    render_skill_photo(scale, x, y, r, img) { // 渲染技能图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
    }

    render_skill_mask(scale, x, y, r, coldtime, init_coldtime) { // 渲染技能蒙板
        if (coldtime > 0) { // 冷却时间不为0才画蒙板
            this.ctx.beginPath();
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, (1 - coldtime / init_coldtime) * Math.PI * 2 - Math.PI / 2, true); // 顺时针
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0,0,0,0.5)";
            this.ctx.fill();
        }
    }

    render_skill_coldtime() { // 渲染技能
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;
        // 渲染火球技能图片
        this.render_skill_photo(scale, x, y, r, this.fireball_img);
        // 渲染火球技能蒙板
        this.render_skill_mask(scale, x, y, r, this.fireball_coldtime, 3);
        x = 1.62;
        // 渲染闪现技能图片
        this.render_skill_photo(scale, x, y, r, this.blink_img);
        // 渲染闪现技能蒙板
        this.render_skill_mask(scale, x, y, r, this.blink_coldtime, 5);
    }

    render() {
        // 渲染头像
        let scale = this.playground.scale;
        if (this.character !== "robot") { // 不是机器人才渲染头像
            this.ctx.save();
            this.ctx.beginPath();
            // 边框颜色
            this.ctx.strokeStyle = "purple"; // 填充边框颜色
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        // 渲染技能
        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
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
        this.update_move();
        if (this.player.character !== "enemy") { // 其他窗口(敌人)不做碰撞判断
            this.update_attack(); // 碰撞判断
        }

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved; // 确定方向＋移动距离
        this.y += this.vy * moved;
        this.move_length -= moved; // 火球剩余距离
    }

    update_attack() {
        // 判断火球是否撞击
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                // 火球攻击到AI了
                this.attacked(player);
                break; // 只会攻击一个玩家
            }
        }
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

        if (this.playground.mode === "multi mode") {
            // 向服务器发送攻击消息
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

        this.destroy(); // 火球消失
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() { // 删除火球前需要从火球列表中删除
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i++) {
            if (fireballs[i] === this) {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app372.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start() {
        this.receive();
    }

    get_player(uuid) { // 获取玩家
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }
        return null;
    }

    receive() {
        this.ws.onmessage = ((e) => { // 接收服务器发送的消息
            let data = JSON.parse(e.data);
            let event = data.event;
            let uuid = data.uuid;
            if (uuid === this.uuid) { // 是自己就过滤掉
                return false;
            }
            // 路由
            if (event === "create_player") {
                this.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                this.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                this.receive_shoot_fireball(uuid, data.tx, data.ty, data.fireball_uuid);
            } else if (event === "attack") {
                this.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.fireball_uuid);
            } else if (event === "blink") {
                this.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                this.receive_chat_message(uuid, data.username, data.text);
            }
        })
    }

    send_create_player(username, photo) { // 向服务器发送创建玩家消息
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'create_player',
            'uuid': outer.uuid,
            'username': username,
            'photo': photo
        }))
    }

    receive_create_player(uuid, username, photo) { // 处理创建玩家消息
        // 创建敌人
        let player = new Player(this.playground, this.playground.width / 2 / this.playground.scale, 0.5, 0.05, "white", 0.2, "enemy", username, photo);
        player.uuid = uuid; // 统一不同窗口同一玩家的uid
        this.playground.players.push(player);
    }

    send_move_to(tx, ty) { // 向服务器发送玩家移动消息
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }))
    }

    receive_move_to(uuid, tx, ty) { // 处理玩家移动消息
        let player = this.get_player(uuid);
        if (player) { // 玩家存在
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, fireball_uuid) { // 向服务器发送发射火球消息
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'fireball_uuid': fireball_uuid
        }))
    }

    receive_shoot_fireball(uuid, tx, ty, fireball_uuid) { // 处理发射火球消息
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = fireball_uuid; // 同一个火球需要在不同窗口统一uuid
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, fireball_uuid) { // 向服务器发送攻击消息
        // x,y:被击中玩家的坐标,angle:被击中的朝向,fireball_uuid:广播火球,防止击中玩家后未消失
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'fireball_uuid': fireball_uuid
        }))
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, fireball_uuid) { // 处理攻击消息
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, fireball_uuid, attacker)
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'blink',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }))
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_chat_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': 'message',
            'uuid': outer.uuid,
            'username': username,
            'text': text
        }))
    }

    receive_chat_message(uuid, username, text) {
        this.playground.chat_field.add_message(username, text); // 添加到聊天历史记录上
    }
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground"></div>
`);
        this.root.$ac_game.append(this.$playground);
        this.hide(); // 隐藏游戏界面
        this.start();
    }

    get_random_color() {
        let color = ["blue", "pink", "yellow", "red", "grey", "green"];
        return color[Math.floor(Math.random() * 6)];
    }

    start() {
        $(window).resize(() => { // 监听界面缩放时,调整界面宽高
            this.resize();
        })
    }

    resize() { // 调整界面宽高(统一单位长度)
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        // 16:9比例分辨率最合适
        let unit = Math.min(this.width / 16, this.height / 9); // 单位长度
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height; // 调整窗口大小的放缩基准
        if (this.game_map) {
            // 地图存在就调整一次界面
            this.game_map.resize();
        }
    }

    show(mode) {
        this.mode = mode; // 存储游戏模式
        this.player_count = 0; // 玩家数量
        this.$playground.show(); // 显示游戏界面
        this.width = this.$playground.width(); // 存储界面的宽度
        this.height = this.$playground.height(); // 存储界面的高度
        this.game_map = new GameMap(this); // 创建游戏地图
        this.state = "waiting"; // 游戏状态 waiting - fighting - over
        this.notice_board = new NoticeBoard(this); // 创建提示板
        this.resize();

        this.players = []; // 保存游戏玩家
        // 创建自己
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.2, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            for (let i = 0; i < 10; i++) {
                // 创建机器人
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.2, "robot"))
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this); // 创建聊天框
            this.mps = new MultiPlayerSocket(this); // 建立ws连接
            this.mps.uuid = this.players[0].uuid; // 自己的唯一编号

            this.mps.ws.onopen = (() => { // 成功建立连接执行该回调
                // 向服务器发送创建玩家消息
                this.mps.send_create_player(this.root.settings.username, this.root.settings.photo);
            })
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
        this.$register_error_message = this.$settings.find(".register-error-message p");
        this.$register_submit = this.$settings.find(".register-submit button");
        this.$register_back = this.$settings.find(".register-back button");
        this.$register.hide();

        this.$login_third_party = this.$settings.find(".login-third-party"); // 一键登录
        this.root.$ac_game.append(this.$settings); // 添加到页面上
        this.start();
    }

    add_listening_events() { // 事件监听
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$login_third_party.click(() => {
            this.user_login_third();
        })
    }

    add_listening_events_login() { // 登录相关事件
        this.$login_register.click(() => {
            this.$login.fadeOut(300);
            this.$register.fadeIn(300);
        });
        this.$login_submit.click(() => {
            this.user_login();
        });
    }

    add_listening_events_register() { // 注册相关事件
        this.$register_back.click(() => {
            this.$register.fadeOut(300);
            this.$login.fadeIn(300);
        });
        this.$register_submit.click(() => {
            this.user_register();
        });
    }

    user_login_third() {
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (res) {
                if (res.result === "success") {
                    location.replace(res.apply_code_url)
                }
            }
        })
    }

    user_login() {
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        if (this.$login_error_message.text()) {
            this.$login_error_message.empty(); // 清空错误信息
        }
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

    user_logout() {
        if (this.platform === "ACAPP") { // 关闭窗口
            this.root.AcWingOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app372.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function (res) {
                    if (res.result === "success") { // 已登录
                        location.reload();
                    }
                }
            })
        }
    }

    user_register() {
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let confirm_password = this.$register_confirm_password.val();
        if (this.$register_error_message.text()) {
            this.$register_error_message.empty(); // 清空错误信息
        }
        let outer = this;
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                "username": username,
                "password": password,
                "confirm_password": confirm_password
            },
            success: function (res) {
                if (res.result === "success") { // 已登录
                    location.reload(); // 登录成功后刷新
                } else {
                    outer.$register_error_message.html(res.result);
                }
            }
        })
    }

    start() {
        if (this.platform === "web") {
            this.getinfo_web();
            this.add_listening_events();
        } else {
            this.getinfo_acapp();
        }
    }

    register() { // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() { // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo_web() {
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
                    outer.hide();
                    outer.root.menu.show();
                } else { // 未登录
                    outer.login();
                }
            }
        })
    }

    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function (res) {
                if (res.result === "success") {
                    outer.acapp_login(res.appid, res.redirect_uri, res.scope, res.state);
                }
            }
        })
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function (res) {
            // redirect_uri返回后的回调函数
            if (res.result === "success") {
                outer.username = res.username;
                outer.photo = res.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    hide() {
    }

    show() {
    }
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