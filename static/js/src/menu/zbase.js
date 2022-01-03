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
    <div class="ac-game-menu-collapse">
        <button class="btn btn-info w-100 collapse-button font-weight-bold" data-toggle="collapse" data-target="#collapseMessage">
            留言板
        </button>
        <div class="collapse" id="collapseMessage">
            <div class="ac-game-menu-message-board">
                <div class="message-board-content-box">
                   <ul class="list-unstyled message-board-content"></ul>
                </div>
                <div class="input-group mt-3">
                  <input type="text" class="form-control message-board-input" placeholder="请输入你想说的内容...">
                  <div class="input-group-append">
                    <button class="btn btn-outline-info" id="liveToastBtn">发送</button>
                  </div>
               </div>
            </div>
        </div>
    </div>
    <div class="toast ac-game-menu-success-toast" style="position: absolute; bottom: 5px; right: 0px;">
        <div class="toast-header">
          <strong class="mr-4 text-success">成功</strong>
          <small>1s前</small>
          <button class="ml-2 mb-1 close" data-dismiss="toast">
            <span>&times;</span>
          </button>
        </div>
        <div class="toast-body">
          发送成功!
        </div>
    </div>
    <div class="toast ac-game-menu-error-toast" style="position: absolute; bottom: 5px; right: 0px;">
        <div class="toast-header">
          <strong class="mr-auto text-danger">错误</strong>
          <small>1s前</small>
          <button class="ml-2 mb-1 close" data-dismiss="toast">
            <span>&times;</span>
          </button>
        </div>
        <div class="toast-body">
          输入的内容不能为空!
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
        this.$error_toast = this.$menu.find(".ac-game-menu-error-toast");
        this.$success_toast = this.$menu.find(".ac-game-menu-success-toast");
        this.$collapse_message = this.$menu.find("#collapseMessage");

        this.hide(); // 用户登录后才显示菜单
        this.start();
    }

    start() {
        this.init_audio = "first"; // 播放音乐标记
        this.add_listening_events();
    }

    add_listening_events() {
        this.$collapse_message.on('shown.bs.collapse', () => { // 折叠元素对用户可见时触发
            this.$message_board_content_box[0].scrollTop = this.$message_board_content_box[0].scrollHeight; // 滚动条移动到底部
        })

        this.$single.click(() => {
            this.hide();
            this.$message_board.hide();
            this.mode = "single mode";
            this.root.difficult.show(); // 显示难度界面
        });

        this.$multi.click(() => {
            this.hide();
            this.$message_board.hide();
            this.mode = "multi mode";
            this.root.melee.show(); // 显示选择多人乱斗模式界面
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

        this.$menu.keydown((e) => {
            if (this.$message_board_input.is(":focus") && e.which === 13) { // 回车事件
                this.addMessage();
                this.$message_board_input.val("");
                this.getMessage();
            }
        })

        this.$message_board_button.click(() => {
            this.addMessage();
            this.$message_board_input.val("");
            this.getMessage();
        });
    }

    addMessage() {
        let value = this.$message_board_input.val();
        if (!value) {
            // 显示错误弹框
            this.$error_toast.toast({
                delay: 2000,
            });
            this.$error_toast.toast("show");
            return false;
        }
        let outer = this;
        $.ajax({
            url: "/menu/addMessage/",
            type: "POST",
            async: false, // 使用同步的方式
            data: {
                "username": outer.root.settings.username,
                "photo": outer.root.settings.photo,
                "text": value,
                "csrfmiddlewaretoken": $('input[name="csrfmiddlewaretoken"]').val(), // csrf认证(post需要)
            },
            success: (res) => {
                // 显示成功弹框
                if (res.result === "success") {
                    this.$success_toast.toast({
                        delay: 2000,
                    });
                    this.$success_toast.toast("show");
                } else {
                    this.$success_toast.toast({
                        delay: 2000,
                    });
                    this.$success_toast.toast("show");
                }
            }
        });
    }

    getMessage() {
        let outer = this;
        $.ajax({
            url: "/menu/getMessage/",
            type: "GET",
            async: false, // 使用同步的方式
            success: (res) => {
                this.$message_board_content.html("");
                let data = res.data;
                for (let i = 0; i < data.length; i++) {
                    let message = $(`
                    <hr>
                    <li class="media mt-2 pl-3 pr-3">
                        <img src="${data[i].photo}" width="40" class="rounded mr-3">
                        <div class="media-body">
                          <h5 class="mt-0 mb-0">${data[i].username}</h5>
                          <p class="create-time mb-2 text-secondary">${data[i].create_time}</p>
                          <p class="mb-0">${data[i].text}</p>
                        </div>
                    </li>
                    `)
                    this.$message_board_content.append(message);
                }
                this.$message_board_content_box[0].scrollTop = this.$message_board_content_box[0].scrollHeight; // 滚动条移动到底部
            }
        })
    }

    show() {
        this.$menu.show(); // 显示菜单
        this.getMessage(); // 获取留言板数据
        // 显示留言板(注意顺序)
        this.$message_board.show();
        this.$collapse_message.collapse('show');

        if (this.init_audio === "first") { // 第一次进入菜单则播放音乐
            $("audio")[0].play();
            this.init_audio = null;
        }
    }

    hide() {
        this.$menu.hide();
    }
}