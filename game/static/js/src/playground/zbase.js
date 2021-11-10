class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground">
123    
</div>
`);
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    start() {
        this.hide(); // 隐藏游戏界面
    }

    show() {
        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
    }
}