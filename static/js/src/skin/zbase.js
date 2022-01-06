class Skin {
    constructor(root) {
        this.root = root;
        this.$skin = $(`
        <div class="ac-game-skin">
            <button class="btn btn-primary skin-back"><i class="bi bi-box-arrow-left"></i>&nbsp;&nbsp;返回</button>
            <div id="carouselSkin" class="carousel slide" data-interval="false" data-ride="carousel">
              <ol class="carousel-indicators"></ol>
              <div class="carousel-inner"></div>
              <button class="carousel-control-prev" data-target="#carouselSkin" data-slide="prev">
                <span class="carousel-control-prev-icon"></span>
              </button>
              <button class="carousel-control-next" data-target="#carouselSkin" data-slide="next">
                <span class="carousel-control-next-icon"></span>
              </button>
            </div>
        </div>
        `);
        this.root.$ac_game.append(this.$skin);
        this.$skin_back = $(".skin-back"); // 返回按钮
        this.$img_carousel_indicators = $(".carousel-indicators"); // 轮播图指示器
        this.$img_carousel_inner = $(".carousel-inner"); // 轮播图内容
        this.hide(); // 隐藏换肤界面
        this.start();
    }

    start() {
    }

    getSkin() { // 获取皮肤数据
        let outer = this;
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/skin/getSkin/",
            type: "GET",
            async: false, // 使用同步的方式
            success: function (res) {
                outer.$img_carousel_indicators.html("");
                outer.$img_carousel_inner.html("");
                // 默认和随机皮肤
                let img_item_default = $(`
                    <div class="carousel-item active text-center">
                      <img src="${outer.root.settings.photo}" class="d-block">
                      <div class="carousel-caption d-none d-md-block">
                        <h3>默认</h3>
                        <p>头像作为皮肤</p>
                      </div>
                    </div>
                    <div class="carousel-item">
                      <img src="https://app372.acapp.acwing.com.cn/static/image/skin/random_skin.png" class="d-block">
                      <div class="carousel-caption d-none d-md-block">
                        <h3>随机</h3>
                        <p>随机皮肤</p>
                      </div>
                    </div>
                `);
                let img_li_default = $(`
                    <li data-target="#carouselSkin" data-slide-to="0" class="active"></li>
                    <li data-target="#carouselSkin" data-slide-to="1"></li>
                `);
                outer.$img_carousel_indicators.append(img_li_default);
                outer.$img_carousel_inner.append(img_item_default);
                // 其他皮肤
                for (let i = 0; i < res.data.length; i++) {
                    // 创建轮播图指示器
                    let img_li = $(`<li data-target="#carouselSkin" data-slide-to="${i + 2}"></li>`);
                    // 渲染轮播图数据
                    let data = res.data[i];
                    let img_item = $(`
                    <div class="carousel-item">
                      <img src="${data.imgSrc}" class="d-block">
                      <div class="carousel-caption d-none d-md-block">
                        <h3>${data.name}</h3>
                        <p>${data.description}</p>
                      </div>
                    </div>
                    `);
                    outer.$img_carousel_indicators.append(img_li);
                    outer.$img_carousel_inner.append(img_item);
                }
                outer.$img = $(".carousel-item img"); // 皮肤图片
            }
        });
    }

    add_listening_events() {
        this.$skin_back.click(() => { // 返回事件
            this.hide();
            if (this.root.menu.mode === "single mode") {
                this.root.difficult.show();
            } else if (this.root.menu.mode === "multi mode") {
                this.root.melee.show();
            }
        });

        let outer = this;
        this.$img.click(function () { // 点击皮肤事件
            if ($(this).parent().index() === 1) { // 随机皮肤
                outer.img_src = outer.$img[Math.floor(Math.random() * (outer.$img.length - 2) + 2)].currentSrc; // 获取图片地址
            } else {
                outer.img_src = $(this)[0].currentSrc; // 获取图片地址
            }
            outer.hide();
            outer.root.playground.show(); // 显示游戏场景
        });
    }

    show() {
        this.getSkin();
        this.add_listening_events(); // start时不能监听,因为无法获取用户头像
        this.$skin.show();
    }

    hide() {
        this.$skin.hide();
    }
}