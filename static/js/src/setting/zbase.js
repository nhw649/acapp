class Setting {
    constructor(root) {
        this.root = root;
        this.$setting = $(`
<div class="ac-game-setting">
    <div class="ac-game-setting-field">
        <div class="setting-field-item setting-field-item-back">返回</div>
        <br>
        <br>
        <div class="setting-field-item setting-field-item-voice">声音:开</div>
        <br>
        <br>
        <div class="setting-field-item setting-field-item-description">游戏说明</div>
        <br>
        <br>
        <div class="setting-field-item setting-field-item-logout">注销</div>
    </div>
    <div class="ac-game-setting-description">
    游戏技能说明
</div>
</div>`);
        this.root.$ac_game.append(this.$setting);
        this.$setting_back = this.$setting.find(".setting-field-item-back");
        this.$audio = $("audio");
        this.$voice = this.$setting.find(".setting-field-item-voice");
        this.$setting_description = this.$setting.find(".setting-field-item-description");
        this.$logout = this.$setting.find(".setting-field-item-logout");
        this.hide(); // 隐藏设置界面
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        if (this.$audio[0].muted) {
            this.$voice.text("声音:关");
        } else {
            this.$voice.text("声音:开");
        }

        this.$setting_back.click(() => { // 返回
            this.hide();
            this.root.menu.show();
        });

        this.$voice.click(() => { // 控制声音开关
            if (this.$audio[0].muted) {
                this.$audio[0].muted = false;
                this.$voice.text("声音:开");
            } else {
                this.$audio[0].muted = true;
                this.$voice.text("声音:关");
            }
        });

        this.$setting_description.mouseenter(() => { // 显示游戏说明
            $(".ac-game-setting-description").fadeIn(100);
        });
        this.$setting_description.mouseleave(() => { // 关闭游戏说明
            $(".ac-game-setting-description").fadeOut(100);
        });

        this.$logout.click(() => { // 退出登录
            this.root.settings.user_logout();
        });
    }

    show() {
        this.$setting.show();
        $(".ac-game-setting-description").hide();
    }

    hide() {
        this.$setting.hide();
    }
}