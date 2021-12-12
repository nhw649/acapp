class AcGamePlayground {
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
        this.$playground.show();
        this.width = this.$playground.width(); // 存储界面的宽度
        this.height = this.$playground.height(); // 存储界面的高度
        this.game_map = new GameMap(this); // 创建游戏地图
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
}