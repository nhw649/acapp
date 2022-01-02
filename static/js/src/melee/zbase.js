class Melee {
    constructor(root) {
        this.root = root;
        this.$melee = $(`
        <div class="ac-game-melee">
            <div class="ac-game-melee-field">
                <div class="melee-field-item melee-field-item-back">返回</div>
                <br>
                <br>
                <div class="melee-field-item melee-field-item-single">单挑模式</div>
                <br>
                <br>
                <div class="melee-field-item melee-field-item-three">三人乱斗</div>
                <br>
                <br>
                <div class="melee-field-item melee-field-item-five">五人乱斗</div>
            </div>
        </div>
        `);
        this.root.$ac_game.append(this.$melee);
        this.$melee_back = $(".melee-field-item-back");
        this.$single = $(".melee-field-item-single");
        this.$three = $(".melee-field-item-three");
        this.$five = $(".melee-field-item-five");
        this.start();
        this.hide();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$melee_back.click(() => { // 返回
            this.hide();
            this.root.menu.show();
        });

        this.$single.click(() => {
            // 单挑模式
            this.root.playground.join_player_total = 2;
            this.hide();
            this.root.skin.show();
        });

        this.$three.click(() => {
            // 三人模式
            this.root.playground.join_player_total = 3;
            this.hide();
            this.root.skin.show();
        });

        this.$five.click(() => {
            // 五人模式
            this.root.playground.join_player_total = 5;
            this.hide();
            this.root.skin.show();
        });
    }

    show() {
        this.$melee.show();
    }

    hide() {
        this.$melee.hide();
    }
}