class Rank {
    constructor(root) {
        this.root = root;
        this.$rank = $(`
        <div class='ac-game-rank'>
        <button class="btn btn-primary rank-back"><i class="bi bi-box-arrow-left"></i>&nbsp;&nbsp;返回</button>
        <h1 class="text-center text-dark font-weight-bold mb-4">排行榜</h1>
        <div class="rank-table">
        <table class="table table-hover text-center">
  <thead>
    <tr>
      <th scope="col">名次</th>
      <th scope="col">用户名</th>
      <th scope="col">头像</th>
      <th scope="col">累计得分</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>
</div>
<nav class="float-right mt-5">
  <ul class="pagination"></ul>
</nav>
</div>
        `);

        this.root.$ac_game.append(this.$rank);
        this.$back_button = $(".rank-back");
        this.now_page = 1;
        this.hide(); // 隐藏排行榜界面
        this.start();
    }

    start() {
    }

    add_listening_events() {
        // 返回菜单按钮
        this.$back_button.click(() => {
            this.hide();
            this.root.menu.show();
        });

        // 上一页
        $(".pre-page").click(() => {
            this.now_page -= 1;
            if (this.now_page < 1) {
                this.now_page = 1;
                return false;
            }
            this.ajax_getRank();
        });

        // 下一页
        $(".next-page").click(() => {
            this.now_page += 1;
            if (this.now_page > this.num_pages) {
                this.now_page = this.num_pages;
                return false;
            }
            this.ajax_getRank();
        });

        // 每一页
        let outer = this;
        $(".this-page").click(function () {
            outer.now_page = parseInt(this.innerText); // 当前点击的页码
            outer.ajax_getRank();
        })
    }

    init_ajax_getRank() { // 初始化数据
        let outer = this;
        $.ajax({
            url: "/rank/getRank",
            type: "GET",
            data: {
                "page": 1
            },
            success: (res) => {
                outer.num_pages = res.num_pages; // 获取总页数
                // 渲染翻页按钮
                $(".pagination").append($(`<li class="page-item pre-page disabled"><a class="page-link" href="javascript:;">上一页</a></li>`))
                for (let i = 0; i < res.num_pages; i++) {
                    let page_item = $(`<li class="page-item this-page"><a class="page-link" href="javascript:;">${i + 1}</a></li>`)
                    $(".pagination").append(page_item);
                }
                $(".pagination").append($(`<li class="page-item next-page"><a class="page-link" href="javascript:;">下一页</a></li>`))
                // 渲染玩家信息
                for (let i = 0; i < res.playerList.length; i++) {
                    let player = res.playerList[i];
                    let row = $(`<tr>
                                  <th class="align-middle">${player.num}</th>
                                  <td class="align-middle">${player.username}</td>
                                  <td class="align-middle"><img  class="img-thumbnail" src="${player.photo}" width="50"></td>
                                  <td class="align-middle">${player.score}</td>
                                </tr>`);
                    $(".ac-game-rank tbody").append(row);
                }
                // 绑定监听事件
                outer.add_listening_events();
            }
        });
    }

    ajax_getRank() { // 获取数据
        let outer = this;
        $.ajax({
            url: "/rank/getRank",
            type: "GET",
            data: {
                "page": outer.now_page
            },
            success: (res) => {
                // 渲染翻页按钮
                if (res.has_previous) { // 判断是否还有上一页
                    $(".pre-page").removeClass("disabled");
                } else {
                    $(".pre-page").addClass("disabled");
                }
                if (res.has_next) { // 判断是否还有下一页
                    $(".next-page").removeClass("disabled");
                } else {
                    $(".next-page").addClass("disabled");
                }

                // 渲染玩家信息
                $(".ac-game-rank tbody").html("");
                for (let i = 0; i < res.playerList.length; i++) {
                    let player = res.playerList[i];
                    let row = $(`<tr>
                                  <th class="align-middle">${player.num}</th>
                                  <td class="align-middle">${player.username}</td>
                                  <td class="align-middle"><img  class="img-thumbnail" src="${player.photo}" width="50"></td>
                                  <td class="align-middle">${player.score}</td>
                                </tr>`);
                    $(".ac-game-rank tbody").append(row);
                }
            }
        });
    }

    show() {
        this.$rank.show(); // 显示排行榜界面
        this.init_ajax_getRank(); // 初始化排行榜数据
    }

    hide() {
        this.$rank.hide(); // 隐藏排行榜界面
    }
}