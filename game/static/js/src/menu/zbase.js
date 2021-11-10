class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="menu-field-item menu-field-item-single">单人模式</div>
        <br>
        <div class="menu-field-item menu-field-item-multi">多人模式</div>
        <br>
        <div class="menu-field-item menu-field-item-settings">设置</div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
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
            this.root.playground.show();
            this.hide();
        });
        this.$multi.click(() => {
            console.log("multi")
        });
        this.$settings.click(() => {
            console.log("settings")
        })
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}