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
    <div class="ac-game-menu-message-board">
       <div class="message-board-content-box">
           <ul class="list-unstyled message-board-content">
              <li class="media">
                <img src="" class="mr-3">
                <div class="media-body">
                  <h5 class="mt-0 mb-1">List-based media object</h5>
                  <p>Are you brave enough to let me see your peacock? There’s no going back. This is the last time you say, after the last line you break. At the eh-end of it all.</p>
                </div>
              </li>
           </ul>
        </div>
       <div class="input-group mt-3">
          <input type="text" class="form-control message-board-input" placeholder="请输入你想说的内容...">
          <div class="input-group-append">
            <button class="btn btn-outline-primary">发送</button>
          </div>
       </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu); // 将菜单渲染到界面上
        this.$single = this.$menu.find(".menu-field-item-single");
        this.$multi = this.$menu.find(".menu-field-item-multi");
        this.$rank = this.$menu.find(".menu-field-item-rank");
        this.$settings = this.$menu.find(".menu-field-item-settings");
        this.$message_board = this.$menu.find(".ac-game-menu-message-board");
        this.$message_board_content_box = this.$menu.find(".message-board-content-box");
        this.$message_board_content = this.$menu.find(".message-board-content");
        this.$message_board_input = this.$menu.find(".message-board-input");
        this.$message_board_button = this.$menu.find(".ac-game-menu-message-board button");

        this.hide(); // 用户登录后才显示
        this.start();
    }

    start() {
        this.init_audio = "first"; // 播放音乐标记
        this.add_listening_events();
    }

    add_listening_events() {
        this.$single.click(() => {
            this.hide();
            this.$message_board.hide();
            this.mode = "single mode";
            this.root.difficult.show(); // 显示难度界面
            // this.root.playground.show("single mode"); // 显示单人模式游戏场景
        });

        this.$multi.click(() => {
            this.hide();
            this.$message_board.hide();
            this.mode = "multi mode";
            this.root.skin.show(); // 显示皮肤界面
            // this.root.playground.show("multi mode"); // 显示多人模式游戏场景
        });

        this.$rank.click(() => {
            this.hide();
            this.$message_board.hide();
            this.root.rank.show(); // 显示排行榜
        });

        this.$settings.click(() => {
            this.hide();
            this.$message_board.hide();
            this.root.setting.show(); // 显示设置
        });

        this.$message_board_button.click(() => {
            this.getMessage();
        });
    }

    getMessage() {
        let outer = this;
        $.ajax({
            url: "/menu/getMessage",
            type: "GET",
            success: (res) => {
                console.log(res)
                this.$message_board_content.html("");
                // for (let i = 0; i <; i++) {
                //     let message = $(`
                //     <li class="media">
                //         <img src="" class="mr-3">
                //         <div class="media-body">
                //           <h5 class="mt-0 mb-1">List-based media object</h5>
                //           <p>Are you brave enough to let me see your peacock? There’s no going back. This is the last time you say, after the last line you break. At the eh-end of it all.</p>
                //         </div>
                //     </li>
                //     `)
                //     this.$message_board_content.append(message);
                // }
            }
        })
    }

    show() {
        this.$menu.show();
        this.getMessage(); // 获取留言板数据
        this.$message_board.show();
        // 滚动到留言板底部
        this.$message_board_content_box[0].scrollTop = this.$message_board_content_box[0].scrollHeight;
        // 美化滚动条插件
        this.$message_board_content_box.niceScroll({
            cursorcolor: "#abc4ff", // 滚动条颜色，使用16进制颜色值
            cursoropacitymin: 0.3, // 当滚动条是隐藏状态时改变透明度
            cursorborder: "none", // CSS方式定义滚动条边框
            cursorborderradius: "10px", // 滚动条圆角
        });
        if (this.init_audio === "first") { // 第一次进入菜单则播放音乐
            $("audio")[0].play();
            this.init_audio = null;
        }
    }

    hide() {
        this.$menu.hide();
    }
}