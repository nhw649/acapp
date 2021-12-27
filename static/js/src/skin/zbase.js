class Skin {
    constructor(root) {
        this.root = root;
        this.$skin = $(`
        <div class="ac-game-skin">
        <button class="btn btn-primary skin-back"><i class="bi bi-box-arrow-left"></i>&nbsp;&nbsp;返回</button>
        <div id="carouselExampleCaptions" class="carousel slide" data-interval="false" data-ride="carousel">
  <ol class="carousel-indicators">
    <li data-target="#carouselExampleCaptions" data-slide-to="0" class="active"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="1"></li>
    <li data-target="#carouselExampleCaptions" data-slide-to="2"></li>
  </ol>
  <div class="carousel-inner">
    <div class="carousel-item active text-center">
      <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic71.nipic.com%2Ffile%2F20150708%2F2531170_112540524000_2.jpg&refer=http%3A%2F%2Fpic71.nipic.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1643209349&t=a16aeb09adb0eb09ad3a978de31f09f8" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h3>随机</h3>
        <p>随机皮肤</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="https://img2.baidu.com/it/u=1400760904,2628939185&fm=253&fmt=auto&app=138&f=JPEG?w=883&h=500" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h3>角色1</h3>
        <p>1</p>
      </div>
    </div>
    <div class="carousel-item">
      <img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01f9115ebaac6ca801207200894f0b.png&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1643204592&t=15ee8d3507f3061b09532dce615efca1" class="d-block">
      <div class="carousel-caption d-none d-md-block">
        <h3>角色2</h3>
        <p>2</p>
      </div>
    </div>
  </div>
  <button class="carousel-control-prev" data-target="#carouselExampleCaptions" data-slide="prev">
    <span class="carousel-control-prev-icon"></span>
  </button>
  <button class="carousel-control-next" data-target="#carouselExampleCaptions" data-slide="next">
    <span class="carousel-control-next-icon"></span>
  </button>
</div>
</div>
        `);
        this.root.$ac_game.append(this.$skin);
        this.$skin_back = $(".skin-back");
        this.$img = $(".carousel-item img");
        // 皮肤列表
        this.img_list = [
            "https://img0.baidu.com/it/u=2488197072,3072656852&fm=26&fmt=auto",
            "https://img2.baidu.com/it/u=1400760904,2628939185&fm=253&fmt=auto&app=138&f=JPEG?w=883&h=500",
            "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01f9115ebaac6ca801207200894f0b.png&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1643204592&t=15ee8d3507f3061b09532dce615efca1",
        ]
        this.hide(); // 隐藏换肤界面
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$skin_back.click(() => { // 返回菜单事件
            this.hide();
            this.root.menu.show();
        });

        let outer = this;
        this.$img.click(function () { // 点击皮肤事件
            if ($(this).index() === 0) {
                outer.img_src = outer.img_list[Math.floor(Math.random() * outer.img_list.length)]; // 获取图片地址
            } else {
                outer.img_src = $(this).attr("src"); // 获取图片地址
            }
            outer.hide();
            outer.root.playground.show(); // 显示游戏场景
        })
    }

    show() {
        $("#carouselExampleCaptions").carousel(0); // 轮播到第一个皮肤
        this.$skin.show();
    }

    hide() {
        this.$skin.hide();
    }
}