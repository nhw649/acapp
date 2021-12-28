class Difficulty {
    constructor(root) {
        this.root = root;
        this.$difficulty = $(`
<div class="ac-game-difficulty">
    <div class="ac-game-difficulty-field">
        <div class="difficulty-field-item difficulty-field-item-easy">简单</div>
        <br>
        <br>
        <div class="difficulty-field-item difficulty-field-item-normal">普通</div>
        <br>
        <br>
        <div class="difficulty-field-item difficulty-field-item-hard">困难</div>
    </div>
    <div class="ac-game-difficulty-description">
    游戏难度说明
</div>
</div>
        `);
        this.root.$ac_game.append(this.$difficulty);
        this.$easy = $(".difficulty-field-item-easy");
        this.$normal = $(".difficulty-field-item-normal");
        this.$hard = $(".difficulty-field-item-hard");
        this.start();
        this.hide();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$easy.mouseenter(() => {

        });
        this.$easy.mouseleave(() => {

        });
        this.$easy.click(() => {
            // 简单难度
            this.difficulty_mode = "easy";
            this.hide();
            this.root.skin.show();
        });

        this.$normal.mouseenter(() => {

        });
        this.$normal.mouseleave(() => {

        });
        this.$normal.click(() => {
            // 普通难度
            this.difficulty_mode = "normal";
            this.hide();
            this.root.skin.show();
        });

        this.$hard.mouseenter(() => {

        });
        this.$hard.mouseleave(() => {

        });
        this.$hard.click(() => {
            // 困难难度
            this.difficulty_mode = "hard";
            this.hide();
            this.root.skin.show();
        });
    }

    show() {
        this.$difficulty.show();
    }

    hide() {
        this.$difficulty.hide();
    }
}