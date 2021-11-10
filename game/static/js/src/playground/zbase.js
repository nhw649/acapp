class AcGamePlayground {
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
}