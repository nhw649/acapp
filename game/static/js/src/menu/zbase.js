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
}