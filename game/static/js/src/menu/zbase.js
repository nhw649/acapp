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
        this.$menu.hide(); // 用户登录后才显示
        this.root.$ac_game.append(this.$menu); // 将菜单渲染到界面上
        this.$single = this.$menu.find(".menu-field-item-single");
        this.$multi = this.$menu.find(".menu-field-item-multi");
        this.$rank = this.$menu.find(".menu-field-item-rank");
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
        this.$rank.click(()=>{
            this.hide();
            this.root.rank.show(); // 显示排行榜
        })
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
}