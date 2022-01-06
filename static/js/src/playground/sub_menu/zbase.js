class SubMenu {
    constructor(playground) {
        this.playground = playground;
        this.$sub_menu = $(`
<div class="sub-menu">
    <div class="list-group">
      <button class="list-group-item list-group-item-action sub-menu-close">关闭</button>
      <button class="list-group-item list-group-item-action sub-menu-voice">声音：开</button>
      <button class="list-group-item list-group-item-action sub-menu-skill-introduction" data-toggle="collapse" data-target="#collapseIntroduction">技能介绍</button>
      <div class="collapse" id="collapseIntroduction">
          <div class="card card-body">
              <p  class="text-danger">火球Q：造成10伤害，冷却1秒。</p>
              <p style="color: mediumpurple">护盾W：为自己提供魔法护盾抵挡所有伤害，持续3秒，冷却10秒。</p>
              <p class="text-info">冰球E：造成5伤害，击中敌人后减速45%，持续2.5秒，冷却2秒。</p>
              <p class="text-warning">闪现F：使英雄朝着你的指针所停的区域瞬间传送一小段距离，冷却4秒。</p>
          </div>
      </div>
      <button class="list-group-item list-group-item-action sub-menu-reopen">重新开始</button>
      <button class="list-group-item list-group-item-action sub-menu-back">返回主菜单</button>
    </div>
</div>`);
        this.playground.$playground.append(this.$sub_menu);
        this.$close = $(".sub-menu-close");
        this.$voice = $(".sub-menu-voice");
        this.$introduction = $(".sub-menu-skill-introduction");
        this.$collapse_introduction = $('#collapseIntroduction');
        this.$reopen = $(".sub-menu-reopen");
        this.$back = $(".sub-menu-back");
        this.setting = this.playground.root.setting;
        this.start();
        this.hide();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        if (this.setting.$audio[0].muted) {
            this.$voice.text("声音：关");
        } else {
            this.$voice.text("声音：开");
        }

        if (this.playground.mode === "multi mode") { // 多人模式删除重新开始选项
            this.$reopen.remove();
        }

        this.playground.game_map.$canvas.keydown((e) => {
            if (e.which === 27) { // ESC键显示或关闭小菜单
                if (this.$sub_menu.css("display") === "none") {
                    this.show();
                } else {
                    this.$collapse_introduction.collapse('hide'); // 收起折叠面板
                    this.hide();
                }
            }
        });

        this.$close.click(() => { // 关闭
            this.hide();
            this.$collapse_introduction.collapse('hide'); // 收起折叠面板
            this.playground.game_map.$canvas.focus(); // 重新聚焦到canvas上
        });

        this.$voice.click(() => { // 控制声音开关
            if (this.setting.$audio[0].muted) {
                this.setting.$audio[0].muted = false;
                this.$voice.text("声音：开");
            } else {
                this.setting.$audio[0].muted = true;
                this.$voice.text("声音：关");
            }
        });

        this.$introduction.click(() => {
            this.playground.game_map.$canvas.focus(); // 重新聚焦到canvas上
        });

        this.$reopen.click(() => { // 重新开始
            this.playground.hide();
            this.playground.show();
        });

        this.$back.click(() => { // 返回菜单
            this.playground.hide(); // 隐藏游戏界面
            this.playground.root.menu.show(); // 显示菜单界面
        });
    }

    show() {
        this.$sub_menu.show();
    }

    hide() {
        this.$sub_menu.hide();
    }
}