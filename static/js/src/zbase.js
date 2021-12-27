export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.AcWingOS = AcWingOS; // 在acwing打开界面时,会加入该参数,实现多端调用不同的后端函数
        this.$ac_game = $('#' + this.id);

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.rank = new Rank(this);
        this.setting = new Setting(this);
        this.difficulty = new Difficulty(this);
        this.skin = new Skin(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {
    }
}