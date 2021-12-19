class ChatField {
    constructor(playground) {
        this.playground = playground;
        this.$history = $("<div class='chat-field-history'>历史记录</div>")
        this.$input = $("<input type='text' class='chat-field-input'>")
        this.$history.hide();
        this.$input.hide();
        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);
        this.timer_id = null;
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$input.keydown((e) => {
            if (e.which === 27) { // esc事件
                this.hide_input();
                return false;
            } else if (e.which === 13) { // 回车事件
                let username = this.playground.root.settings.username;
                let text = this.$input.val();
                if (text) { // 内容不为空
                    this.add_message(username, text);
                    this.$input.val(""); // 输入框置空
                    this.playground.mps.send_chat_message(username, text); // 向服务器发送聊天信息
                }
                return false;
            }
        })
        this.$input.blur(() => { // 输入框失去焦点事件
            this.$input.hide(); // 隐藏输入框,不聚焦canvas
        })
    }

    render_message(message) { // 渲染聊天历史记录信息
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) { // 添加聊天历史记录信息
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        this.$history.fadeIn();
        if (this.timer_id) clearTimeout(this.timer_id);
        this.timer_id = setTimeout(() => { // 3s后关闭历史记录
            this.$history.fadeOut();
            this.timer_id = null;
        }, 3000)
    }

    show_input() {
        this.$input.show();
        this.$input.focus(); // 聚集到输入框
        this.show_history(); // 打开历史记录
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus(); // 重新聚焦到canvas上
    }
}