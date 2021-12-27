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
        <div class="menu-field-item menu-field-item-rank">排行榜</div>
        <br>
        <br>
        <div class="menu-field-item menu-field-item-settings">设置</div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu); // 将菜单渲染到界面上
        this.$single = this.$menu.find(".menu-field-item-single");
        this.$multi = this.$menu.find(".menu-field-item-multi");
        this.$rank = this.$menu.find(".menu-field-item-rank");
        this.$settings = this.$menu.find(".menu-field-item-settings");
        this.hide(); // 用户登录后才显示
        this.start();
    }

    start() {
        this.init_audio = "first"; // 播放音乐标记
        this.add_listening_events();
    }

    add_listening_events() {
        this.$single.click(() => {
            this.hide();
            this.mode = "single mode";
            this.root.difficulty.show(); // 显示难度界面
            // this.root.playground.show("single mode"); // 显示单人模式游戏场景
        });

        this.$multi.click(() => {
            this.hide();
            this.mode = "multi mode";
            this.root.skin.show(); // 显示皮肤界面
            // this.root.playground.show("multi mode"); // 显示多人模式游戏场景
        });

        this.$rank.click(() => {
            this.hide();
            this.root.rank.show(); // 显示排行榜
        });

        this.$settings.click(() => {
            this.hide();
            this.root.setting.show(); // 显示设置
        });
    }

    show() {
        this.$menu.show();
        if (this.init_audio === "first") { // 第一次进入菜单则播放音乐
            $("audio")[0].play();
            this.init_audio = null;
        }
    }

    hide() {
        this.$menu.hide();
    }
}