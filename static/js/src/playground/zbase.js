class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.focus_player = null; // 镜头聚焦玩家
        this.$playground = $(`
<div class="ac-game-playground"></div>
`);
        this.root.$ac_game.append(this.$playground);
        this.hide(); // 隐藏游戏界面
        this.start();
    }

    get_random_color() {
        let color = ["blue", "pink", "yellow", "red", "grey", "orange"];
        return color[Math.floor(Math.random() * color.length)];
    }

    create_uuid() { // 创建一个8位随机的编号
        let res = '';
        for (let i = 0; i < 8; i++) {
            res += Math.floor(Math.random() * 10);
        }
        return res;
    }

    start() {
        let uuid = this.create_uuid(); // 用唯一标识来判断关闭哪个窗口的监听界面事件
        $(window).on(`resize.${uuid}`, () => {// 监听界面缩放时,调整界面宽高
            this.resize();
        })
        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function () {
                $(window).off(`resize.${uuid}`); // 关闭窗口时移除监听事件
            });
        }
    }

    resize() { // 调整界面宽高(统一单位长度)
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        // 16:9比例分辨率最合适
        let unit = Math.min(this.width / 16, this.height / 9); // 单位长度
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height; // 调整窗口大小的放缩基准
        if (this.game_map) this.game_map.resize(); // 地图存在就调整一次界面
        if (this.mini_map) this.mini_map.resize(); // 小地图存在就调整一次界面
    }

    re_calculate_cx_cy(x, y) { // 调整位置
        // 玩家离地图中心点的距离
        this.cx = x - this.width / 2 / this.scale;
        this.cy = y - this.height / 2 / this.scale;

        let l = this.game_map.l; // 0.15
        if (this.focus_player) {
            this.cx = Math.max(this.cx, -2 * l);
            this.cx = Math.min(this.cx, this.virtual_map_width - (this.width / this.scale - 2 * l));
            this.cy = Math.max(this.cy, -l);
            this.cy = Math.min(this.cy, this.virtual_map_height - (this.height / this.scale - l));
        }
    }

    // add_cancel_waiting() { // 监听准备中返回菜单事件
    //     if (this.game_map.$canvas) {
    //         this.$canvas = this.game_map.$canvas;
    //         this.$canvas.on('click.cancel', () => { // 点击任意键返回菜单
    //             // this.mps.send_remove_player(this.root.settings.username);
    //             this.hide();
    //             this.root.menu.show();
    //         })
    //     }
    // }

    // off_cancel_waiting() { // 删除监听准备中返回菜单事件
    //     if (this.game_map.$canvas) {
    //         this.$canvas = this.game_map.$canvas;
    //         this.$canvas.off('click.cancel');
    //     }
    // }

    show() {
        this.$playground.show(); // 显示游戏界面
        console.log(this.root.menu.mode)
        let mode = this.root.menu.mode; // 存储游戏模式
        this.player_count = 0; // 玩家数量
        this.state = "waiting"; // 游戏状态 waiting - fighting - over
        this.width = this.$playground.width(); // 存储界面的宽度
        this.height = this.$playground.height(); // 存储界面的高度
        // 虚拟地图大小改成相对大小
        this.virtual_map_width = 3;
        this.virtual_map_height = this.virtual_map_width; // 正方形地图，方便画格子

        this.game_map = new GameMap(this); // 创建游戏地图
        this.notice_board = new NoticeBoard(this); // 创建提示板
        this.score_board = new ScoreBoard(this); // 创建对局结束状态

        this.resize();

        this.players = []; // 保存游戏玩家
        // 创建自己
        let px = Math.random() * this.virtual_map_width, py = Math.random() * this.virtual_map_height; // 随机位置
        this.players.push(new Player(this, px, py, 0.05, "white", 0.25, "me", this.root.settings.username, this.root.skin.img_src || this.root.settings.photo));
        // this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.2, "me", this.root.settings.username, this.root.settings.photo));

        this.re_calculate_cx_cy(this.players[0].x, this.players[0].y); // 根据玩家位置确定画布相对于虚拟地图的偏移量
        this.focus_player = this.players[0]; // 聚焦玩家是自己

        if (mode === "single mode") {
            // console.log(this.root.difficulty.difficulty_mode)

            for (let i = 0; i < 10; i++) {
                let px = Math.random() * this.virtual_map_width, py = Math.random() * this.virtual_map_height; // 随机位置
                this.players.push(new Player(this, px, py, 0.05, this.get_random_color(), 0.25, "robot"));  // 创建机器人
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this); // 创建聊天框
            this.mps = new MultiPlayerSocket(this); // 建立ws连接
            this.mps.uuid = this.players[0].uuid; // 自己的唯一编号
            this.mps.ws.onopen = (() => { // 成功建立连接执行该回调
                // 向服务器发送创建玩家消息
                this.mps.send_create_player(this.root.settings.username, this.root.skin.img_src || this.root.settings.photo);
            })
        }
        // if (this.state === "waiting") {
        //     this.add_cancel_waiting(); // 准备中返回菜单事件
        // }
        // 在地图和玩家都创建好后,创建小地图对象
        this.mini_map = new MiniMap(this, this.game_map);
        this.mini_map.resize();
    }

    hide() {
        // 删除玩家,不能使用for循环,会出现删除位置不匹配
        while (this.players && this.players.length > 0) {
            this.players[0].destroy(); // 会调用player的on_destroy,从玩家列表中删除
        }
        // 删除notice_board
        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }
        // 删除score_board
        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }
        // 删除game_map
        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }
        this.$playground.empty(); // 删除dom元素

        this.$playground.hide();
    }
}