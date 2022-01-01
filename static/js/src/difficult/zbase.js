class Difficult {
    constructor(root) {
        this.root = root;
        this.$difficult = $(`
<div class="ac-game-difficult">
    <div class="ac-game-difficult-field">
        <div class="difficult-field-item difficult-field-item-back">返回</div>
        <br>
        <br>
        <div class="difficult-field-item difficult-field-item-easy">简单</div>
        <br>
        <br>
        <div class="difficult-field-item difficult-field-item-normal">普通</div>
        <br>
        <br>
        <div class="difficult-field-item difficult-field-item-hard">困难</div>
    </div>
    <div class="ac-game-difficult-description"></div>
</div>
        `);
        this.root.$ac_game.append(this.$difficult);
        this.$difficult_back = $(".difficult-field-item-back");
        this.$easy = $(".difficult-field-item-easy");
        this.$normal = $(".difficult-field-item-normal");
        this.$hard = $(".difficult-field-item-hard");
        this.$difficult_description = $(".ac-game-difficult-description");
        this.start();
        this.hide();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$difficult_back.click(() => { // 返回
            this.hide();
            this.root.menu.show();
        });

        this.$easy.mouseenter(() => {
            this.$difficult_description.text("敌人数量减少，玩家移动速度更快，攻击频率变慢，火球移动距离变短，火球移动速度变慢，出生位置随机。")
            this.$difficult_description.stop(true).fadeIn(100);
        });
        this.$easy.mouseleave(() => {
            this.$difficult_description.stop(true).fadeOut(100);
        });
        this.$easy.click(() => {
            // 简单难度
            this.difficult_mode = "easy";
            this.hide();
            this.root.skin.show();
        });

        this.$normal.mouseenter(() => {
            this.$difficult_description.text("和玩家一样，出生位置随机。")
            this.$difficult_description.stop(true).fadeIn(100);
        });
        this.$normal.mouseleave(() => {
            this.$difficult_description.stop(true).fadeOut(100);
        });
        this.$normal.click(() => {
            // 普通难度
            this.difficult_mode = "normal";
            this.hide();
            this.root.skin.show();
        });

        this.$hard.mouseenter(() => {
            this.$difficult_description.text("敌人数量增多，速度变快，攻击频率变快，火球移动距离变长，火球移动速度变快，出生位置一样。")
            this.$difficult_description.stop(true).fadeIn(100);
        });
        this.$hard.mouseleave(() => {
            this.$difficult_description.stop(true).fadeOut(100);
        });
        this.$hard.click(() => {
            // 困难难度
            this.difficult_mode = "hard";
            this.hide();
            this.root.skin.show();
        });
    }

    show() {
        this.$difficult.show();
    }

    hide() {
        this.$difficult.hide();
        this.$difficult_description.hide();
    }
}