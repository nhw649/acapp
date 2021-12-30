class Player extends AcGameObject {
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

        this.fireball_speed = 0.7; // 火球移动速度
        this.fireball_move_length = 1.4; // 火球移动距离

        this.max_hp = 100; // 最大血量
        this.hp = 100;

        // 创建图片渲染头像皮肤
        this.img = new Image();
        this.img.src = this.photo || "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fae01.alicdn.com%2Fkf%2FH544f69316f7941e0aa8e16ddb0957367F.jpg&refer=http%3A%2F%2Fae01.alicdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1643330881&t=6141465282424729b082d7b3f5e29b89";

        if (this.character === "me") { // 是自己才有冷却时间
            this.fireball_coldtime = 1; // 火球冷却时间
            this.blink_coldtime = 3; // 闪现冷却时间
            // 创建技能图片
            this.fireball_img = new Image();
            this.fireball_img.src = "https://django-project.oss-cn-shanghai.aliyuncs.com/playground/skill/fireball.png";

            this.blink_img = new Image();
            this.blink_img.src = "https://django-project.oss-cn-shanghai.aliyuncs.com/playground/skill/blink.png";
        }
    }

    start() {
        // 单人模式的难度调整
        if (this.playground.mode === "single mode") {
            this.difficult_mode = this.playground.root.difficult.difficult_mode;
            if (this.character === "me") {
                if (this.difficult_mode === "easy") {
                    this.fireball_speed = 0.7; // 火球移动速度
                    this.fireball_move_length = 1.3; // 火球移动距离
                    this.attack_frequency = 1 / 100; // 攻击频率
                } else if (this.difficult_mode === "normal") {
                    this.fireball_speed = 0.7; // 火球移动速度
                    this.fireball_move_length = 1.4; // 火球移动距离
                    this.attack_frequency = 1 / 200; // 攻击频率
                } else if (this.difficult_mode === "hard") {
                    this.fireball_speed = 0.7; // 火球移动速度
                    this.fireball_move_length = 1.5; // 火球移动距离
                    this.attack_frequency = 1 / 300; // 攻击频率
                }
            } else if (this.character === "robot") {
                if (this.difficult_mode === "easy") {
                    this.fireball_speed = 0.6; // 火球移动速度
                    this.fireball_move_length = 1.3; // 火球移动距离
                    this.attack_frequency = 1 / 100; // 攻击频率
                } else if (this.difficult_mode === "normal") {
                    this.fireball_speed = 0.7; // 火球移动速度
                    this.fireball_move_length = 1.4; // 火球移动距离
                    this.attack_frequency = 1 / 200; // 攻击频率
                } else if (this.difficult_mode === "hard") {
                    this.fireball_speed = 0.8; // 火球移动速度
                    this.fireball_move_length = 1.5; // 火球移动距离
                    this.attack_frequency = 1 / 300; // 攻击频率
                }
            }
        }

        this.playground.player_count++; // 玩家人数+1
        // this.playground.notice_board.write("已准备：" + this.playground.player_count + "人"); // 修改提示板文字

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("战斗中！");
        }
        if (this.character === "me") { // 是自己才添加鼠标点击移动事件
            this.add_listening_events();
        } else if (this.character === "robot") { // 机器人
            setInterval(() => {
                // 创建随机移动位置
                // let tx = Math.random() * this.playground.width / this.playground.scale;
                // let ty = Math.random() * this.playground.height / this.playground.scale;
                let tx = Math.random() * this.playground.virtual_map_width;
                let ty = Math.random() * this.playground.virtual_map_height;
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
            // 鼠标按下位置相对于浏览器的位置
            let tx = (e.clientX - rect.left) / this.playground.scale + this.playground.cx;
            let ty = (e.clientY - rect.top) / this.playground.scale + this.playground.cy;

            if (e.which === 3) { // 右键移动
                if (tx < 0 || tx > this.playground.virtual_map_width || ty < 0 || ty > this.playground.virtual_map_height)
                    return; // 不能向地图外移动
                for (let i = 0; i < 20; i++) { // 右键点击粒子效果
                    new ClickParticle(this.playground, tx, ty, "rgb(74,149,58)");
                }
                // let tx = (e.clientX - rect.left) / this.playground.scale;
                // let ty = (e.clientY - rect.top) / this.playground.scale;
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
                // let tx = (e.clientX - rect.left) / this.playground.scale;
                // let ty = (e.clientY - rect.top) / this.playground.scale;
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
            // 聊天框按键
            if (e.which === 13) // 监听回车事件
            {
                if (this.playground.mode === "multi mode" && this.playground.state === "fighting") { // 打开聊天框
                    this.playground.chat_field.show_input();
                    return false;
                }
            } else if (e.which === 27) {
                if (this.playground.mode === "multi mode" && this.playground.state === "fighting") { // 关闭聊天框
                    this.playground.chat_field.hide_input();
                    return false;
                }
            }
            if (this.playground.state !== "fighting")
                return true; // 匹配中不能发射火球
            // 技能按键
            if (e.which === 81 && this.hp > 0) {
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
            // 按空格聚焦玩家
            if (e.which === 32) {
                this.playground.focus_player = this;
                this.playground.re_calculate_cx_cy(this.x, this.y);
                return false;
            }
        })
    }

    shoot_fireball(tx, ty) {
        let x = this.x;
        let y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        // let speed = 0.6;
        let color = "orange";
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        // let move_length = 1.3; // 火球移动距离
        // 创建火球
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, this.fireball_speed, this.fireball_move_length, 0.0025);
        this.fireballs.push(fireball);
        this.fireball_coldtime = 1; // 重置火球cd
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
        d = Math.min(d, 0.4); // 闪现最大距离为0.4
        let angle = Math.atan2(ty - this.y, tx - this.x); // 闪现角度
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 3; // 重置闪现cd
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
        for (let i = 0; i < Math.random() * 10 + 10; i++) {
            let x = this.x,
                y = this.y;
            let radius = this.radius * Math.random() * 0.5;
            let color = this.color;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle),
                vy = Math.sin(angle);
            let speed = this.speed * 6;
            let move_length = this.radius * Math.random() * 3.5;
            new Particle(this.playground, x, y, radius, color, vx, vy, speed, move_length);
        }
        this.radius -= damage * 0.5; // 玩家变小
        this.hp -= 10; // 血量减少
        if (this.hp <= 0) {
            this.destroy(); // 玩家死亡
            return false;
        }
        // 击退效果
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 350;
        this.speed *= 0.98; // 血量减少移速变慢
    }

    get_dist(x1, y1, x2, y2) { // 获取两点距离
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        this.spend_time += this.timedelta / 1000;
        this.update_win(); // 触发判断胜利事件
        this.update_move();
        if (this.character === "me" && this.playground.focus_player === this)  // 如果是玩家，并且正在被聚焦，修改background的 (cx, cy)
            this.playground.re_calculate_cx_cy(this.x, this.y);

        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }
        this.render(); // 每一帧都画一个玩家
    }

    update_win() { // 判断胜利事件
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }

    update_coldtime() { // 更新技能冷却时间
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0); // 冷却时间最小为0

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0); // 冷却时间最小为0
    }

    update_move() { // 更新玩家移动
        if (this.character === "robot" && this.spend_time > 4 && Math.random() < this.attack_frequency) { // 机器人自动攻击
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

    on_destroy() {
        if (this.character === "me" && this.playground.state === "fighting") { // 判断失败
            this.playground.state = "over";
            this.playground.score_board.lose();
        }
        for (let i = 0; i < this.playground.players.length; i++) { // 玩家死亡从玩家列表中删除
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                this.playground.player_count--;
                break;
            }
        }
    }

    render_skill_photo(scale, x, y, r, img, text) { // 渲染技能图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        // 渲染技能按键文字
        this.ctx.font = "bold 25px Arial"
        this.ctx.fillStyle = "white"
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(text, x * scale, y * scale * 1.02)
        this.ctx.restore();
        this.ctx.text
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
        let x = 1.25, y = 0.9, r = 0.04;
        // 渲染火球技能图片
        this.render_skill_photo(scale, x, y, r, this.fireball_img, "Q");
        // 渲染火球技能蒙板
        this.render_skill_mask(scale, x, y, r, this.fireball_coldtime, 1);
        x = 1.37;
        // 渲染闪现技能图片
        this.render_skill_photo(scale, x, y, r, this.blink_img, "F");
        // 渲染闪现技能蒙板
        this.render_skill_mask(scale, x, y, r, this.blink_coldtime, 3);
    }

    render_hp(x, y, r, scale, color) {
        let base_top_y = this.radius * 1.5 * scale; // 血条上边框
        let base_bottom_y = this.radius * 1.2 * scale; // 血条下边框
        let base_x = this.radius * 1.2 * scale; // 血条左右边框

        // 边框
        this.ctx.strokeStyle = "white";
        this.ctx.beginPath();
        this.ctx.moveTo(x - base_x, y - base_top_y);
        this.ctx.lineTo(x + base_x, y - base_top_y);
        this.ctx.lineTo(x + base_x, y - base_bottom_y);
        this.ctx.lineTo(x - base_x, y - base_bottom_y);
        this.ctx.lineTo(x - base_x, y - base_top_y);
        this.ctx.stroke();

        // 剩余血量
        let ratio = this.hp / this.max_hp;
        this.ctx.beginPath()
        this.ctx.rect(x - base_x, y - base_top_y, 2 * base_x * ratio, this.radius * 0.3 * scale);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();

        // 已扣血量
        this.ctx.beginPath()
        this.ctx.rect(x + base_x, y - base_top_y, -((x + base_x) * ratio), this.radius * 0.3 * scale);
        this.ctx.fillStyle = 'rgba(0,0,0,0)';
        this.ctx.fill();
        this.ctx.closePath();

        // 血量值
        this.ctx.font = 0.015 * scale + "px bold 微软雅黑";
        this.ctx.fillStyle = "white";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(this.hp + "/100", x, y - base_top_y);
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.x - this.playground.cx, ctx_y = this.y - this.playground.cy; // 把虚拟地图中的坐标换算成canvas中的坐标
        if (ctx_x < -0.2 * this.playground.width / scale ||
            ctx_x > 1.2 * this.playground.width / scale ||
            ctx_y < -0.2 * this.playground.height / scale ||
            ctx_y > 1.2 * this.playground.height / scale) {
            if (this.character != "me") { // 一个隐藏的bug，如果是玩家自己并且return，会导致技能图标渲染不出来
                return;
            }
        }

        // 渲染血条
        if (this.character === "me") {
            this.render_hp(ctx_x * scale, ctx_y * scale, this.radius * scale, scale, "rgb(51, 226, 40)");
        } else {
            this.render_hp(ctx_x * scale, ctx_y * scale, this.radius * scale, scale, "rgb(249, 19, 51)");
        }

        // 渲染玩家或机器人
        this.ctx.save(); // 保存canvas状态
        this.ctx.strokeStyle = this.color; // 填充边框颜色
        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img, (ctx_x - this.radius) * scale, (ctx_y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
        this.ctx.restore(); // 恢复canvas状态

        // 渲染玩家名
        if (this.character !== "robot") {
            this.ctx.beginPath();
            this.ctx.font = 0.02 * scale + "px bold 微软雅黑";
            this.ctx.fillStyle = "white";
            this.ctx.textBaseline = "alphabetic";
            this.ctx.fillText(this.username, ctx_x * scale, ctx_y * scale - this.radius * 1.8 * scale);
        }

        // 渲染技能
        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }
}