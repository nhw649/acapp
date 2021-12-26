class ChatField {
    constructor(playground) {
        this.playground = playground;
        this.$history = $("<div class='chat-field-history'></div>")
        this.$input = $("<input type='text' class='chat-field-input' placeholder='请输入聊天内容...'>")
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
            if (e.which === 27) { // ESC键关闭聊天框
                this.hide_input();
                return false;
            } else if (e.which === 13 && this.$input.val() && $('.chat-field-input').is(":focus")) { // 回车发送消息事件
                let username = this.playground.root.settings.username;
                let text = this.$input.val();
                if (text) { // 内容不为空
                    this.add_message(username, text);
                    this.$input.val(""); // 输入框置空
                    this.playground.mps.send_chat_message(username, text); // 向服务器发送聊天信息
                }
                return false;
            } else if (e.which === 13 && this.$input.val() === "" && $('.chat-field-input').is(":focus")) { // 输入框为空回车也可以关闭聊天框
                this.hide_input();
                return false;
            }
        })
        this.$input.blur(() => { // 输入框失去焦点事件
            this.hide_history();
            this.$input.hide(); // 隐藏输入框,不聚焦canvas
        })
    }

    render_message(message) { // 渲染聊天聊天记录信息
        return $(`<div>${message}</div>`);
    }

    dateFormat(fmt, date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
            }
        }
        return fmt;
    }

    add_message(username, text) { // 添加聊天聊天记录信息
        this.show_history();
        // 获取当前时间
        let date = new Date();
        let formatTime = this.dateFormat("HH:MM:SS", date);
        let message = `<text style="color: green;">[${formatTime}]</text> <text style="color: #1565c0;">${username}: </text>${text}`; // 聊天记录上显示的信息
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
        if (this.$input.css("display") === "none") { // 如果输入框隐藏则3s后关闭聊天记录
            this.hide_history();
        }
    }

    show_history() {
        // 如果关闭聊天框则3s后关闭聊天记录，如果未关闭聊天框则聊天记录一直显示
        if (this.timer_id) clearTimeout(this.timer_id);
        this.$history.fadeIn();
    }

    hide_history() { // 3s后关闭聊天记录
        if (this.timer_id) clearTimeout(this.timer_id);
        this.timer_id = setTimeout(() => {
            this.$history.fadeOut();
            this.timer_id = null;
        }, 3000)
    }

    show_input() {
        this.$input.show(); // 显示输入框
        this.$input.focus(); // 聚集到输入框
        this.show_history(); // 打开聊天记录
    }

    hide_input() {
        this.$input.val(""); // 输入框置空
        // 防抖
        this.hide_history();
        this.$input.hide(); // 隐藏输入框
        this.playground.game_map.$canvas.focus(); // 重新聚焦到canvas上
    }
}