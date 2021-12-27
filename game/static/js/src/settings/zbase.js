class Settings {
    constructor(root) {
        this.root = root;
        this.username = ""; // 存储用户
        this.photo = ""; // 存储头像
        this.platform = "web"; // 默认为web端
        if (this.root.AcWingOS) {
            this.platform = "ACAPP";
        }
        this.$settings = $(`
        <div class="acgame-settings">
        <div class="settings-login">
            <div class="login-tittle">
                登录
            </div>
            <div class="login-username">
                <div class="login-item">
                    用户名：<input type="text" class="form-control" placeholder="请输入用户">
                </div>
            </div>
            <div class="login-password">
                <div class="login-item">
                    密码：<input type="password" class="form-control" placeholder="请输入密码">
                </div>
            </div>
            <div class="login-error-message">
                <p class="text-danger"></p>
            </div>
            <div class="login-register">
                <p class="text-muted">注册</p>
            </div>
            <div class="login-submit">
                <div class="login-item">
                    <button class="btn btn-primary">登录</button>
                </div>
            </div>
            <div class="login-third-party">
                <img src="https://app372.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                <p class="text-muted">AcWing一键登录</p>
            </div>
        </div>
        <div class="settings-register">
            <div class="register-tittle">
                注册
            </div>
            <div class="register-username">
                <div class="register-item">
                    用户名：<input type="text" class="form-control" placeholder="请输入用户">
                </div>
            </div>
            <div class="register-password">
                <div class="register-item">
                    密码：<input type="password" class="form-control" placeholder="请输入密码">
                </div>
            </div>
            <div class="register-confirm-password">
                <div class="register-item">
                    确认密码：<input type="password" class="form-control" placeholder="请再次输入密码">
                </div>
            </div>
            <div class="register-error-message">
                <p class="text-danger"></p>
            </div>
            <div class="register-submit">
                <div class="register-item">
                    <button class="btn btn-primary">注册</button>
                </div>
            </div>
            <div class="register-back">
                <div class="register-item">
                    <button class="btn btn-primary">返回</button>
                </div>
            </div>
        </div>
    </div>
        `);

        // 登录相关元素
        this.$login = this.$settings.find(".settings-login");
        this.$login_username = this.$settings.find(".login-username input");
        this.$login_password = this.$settings.find(".login-password input");
        this.$login_error_message = this.$settings.find(".login-error-message p");
        this.$login_register = this.$settings.find(".login-register p");
        this.$login_submit = this.$settings.find(".login-submit button");
        this.$login.hide();

        // 注册相关元素
        this.$register = this.$settings.find(".settings-register");
        this.$register_username = this.$settings.find(".register-username input");
        this.$register_password = this.$settings.find(".register-password input");
        this.$register_confirm_password = this.$settings.find(".register-confirm-password input");
        this.$register_error_message = this.$settings.find(".register-error-message p");
        this.$register_submit = this.$settings.find(".register-submit button");
        this.$register_back = this.$settings.find(".register-back button");
        this.$register.hide();

        this.$login_third_party = this.$settings.find(".login-third-party"); // 一键登录
        this.root.$ac_game.append(this.$settings); // 添加到页面上
        this.start();
    }

    add_listening_events() { // 事件监听
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$login_third_party.click(() => {
            this.user_login_third();
        })
    }

    add_listening_events_login() { // 登录相关事件
        this.$login_register.click(() => {
            this.$login.fadeOut(300);
            setTimeout(() => {
                this.$register.fadeIn(300);
            }, 300)
        });
        this.$login_submit.click(() => {
            this.user_login();
        });
    }

    add_listening_events_register() { // 注册相关事件
        this.$register_back.click(() => {
            this.$register.fadeOut(300);
            setTimeout(() => {
                this.$login.fadeIn(300);
            }, 300)
        });
        this.$register_submit.click(() => {
            this.user_register();
        });
    }

    user_login_third() {
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function (res) {
                if (res.result === "success") {
                    location.replace(res.apply_code_url)
                }
            }
        })
    }

    user_login() {
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        if (this.$login_error_message.text()) {
            this.$login_error_message.empty(); // 清空错误信息
        }
        let outer = this;
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                "username": username,
                "password": password
            },
            success: function (res) {
                if (res.result === "success") { // 已登录
                    location.reload(); // 登录成功后刷新
                } else {
                    outer.$login_error_message.html(res.result);
                }
            }
        })
    }

    user_logout() {
        if (this.platform === "ACAPP") { // 关闭窗口
            this.root.AcWingOS.api.window.close();
        } else {
            $.ajax({
                url: "https://app372.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function (res) {
                    if (res.result === "success") { // 已登录
                        location.reload();
                    }
                }
            })
        }
    }

    user_register() {
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let confirm_password = this.$register_confirm_password.val();
        if (this.$register_error_message.text()) {
            this.$register_error_message.empty(); // 清空错误信息
        }
        let outer = this;
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                "username": username,
                "password": password,
                "confirm_password": confirm_password
            },
            success: function (res) {
                if (res.result === "success") { // 已登录
                    location.reload(); // 登录成功后刷新
                } else {
                    outer.$register_error_message.html(res.result);
                }
            }
        })
    }

    start() {
        $("audio")[0].pause(); // 暂停音乐
        if (this.platform === "web") {
            this.getinfo_web();
            this.add_listening_events();
        } else {
            this.getinfo_acapp();
        }
    }

    register() { // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() { // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo_web() {
        let outer = this;
        // 从服务器获取用户信息
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                "platform": outer.platform
            },
            success: function (res) {
                if (res.result === "success") { // 已登录
                    outer.username = res.username;
                    outer.photo = res.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else { // 未登录
                    outer.login();
                }
            }
        })
    }

    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function (res) {
                if (res.result === "success") {
                    outer.acapp_login(res.appid, res.redirect_uri, res.scope, res.state);
                }
            }
        })
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function (res) {
            // redirect_uri返回后的回调函数
            if (res.result === "success") {
                outer.username = res.username;
                outer.photo = res.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        $("audio")[0].pause(); // 暂停音乐
        this.$settings.show();
    }
}