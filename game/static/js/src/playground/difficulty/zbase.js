class Difficulty {
    constructor(root) {
        this.root = root;
        this.$difficulty = $(`
<div class="ac-game-difficulty">
    <div class="ac-game-difficulty-field">
        <div class="difficulty-field-item difficulty-field-item-easy">简单</div>
        <br>
        <br>
        <div class="difficulty-field-item difficulty-field-item-middle">中等</div>
        <br>
        <br>
        <div class="difficulty-field-item difficulty-field-item-hard">困难</div>
    </div>
</div>
        `);
        this.root.$ac_game.append(this.$difficulty);
        this.$easy = $(".difficulty-field-item-easy");
        this.$middle = $(".difficulty-field-item-middle");
        this.$hard = $(".difficulty-field-item-hard");
        this.start();
        this.hide();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$easy.click(() => {
            // 简单难度
            this.difficulty_mode = "easy";
            this.hide();
            this.root.skin.show();
        });

        this.$middle.click(() => {
            // 中等难度
            this.difficulty_mode = "middle";
            this.hide();
            this.root.skin.show();
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