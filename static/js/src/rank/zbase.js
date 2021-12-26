class Rank {
    constructor(root) {
        this.root = root;
        this.$rank = $(`
        <div class='ac-game-rank'>
        <button class="btn btn-primary rank-back"><i class="bi bi-box-arrow-left"></i>&nbsp;&nbsp;返回</button>
        <h1 class="text-center text-secondary mb-4">排行榜</h1>
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
  <ul class="pagination">
    <li class="page-item"><a class="page-link" href="javascript:;"><</a></li>
    <li class="page-item"><a class="page-link" href="javascript:;">1</a></li>
    <li class="page-item"><a class="page-link" href="javascript:;">2</a></li>
    <li class="page-item"><a class="page-link" href="javascript:;">3</a></li>
    <li class="page-item"><a class="page-link" href="javascript:;">></a></li>
  </ul>
</nav>
</div>
        `);

        this.root.$ac_game.append(this.$rank);
        this.$backButton = $(".rank-back");
        this.hide(); // 隐藏排行榜界面
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$backButton.click(() => {
            this.hide();
            this.root.menu.show();
        })
    }

    show() {
        this.$rank.show(); // 显示排行榜界面
        $.ajax({
            url: "https://app372.acapp.acwing.com.cn/rank/getRank",
            type: "GET",
            data: {
                "page": 2
            },
            success: function (res) {
                console.log(res)
                // $(".ac-game-rank tbody").html("");
                // for (let i = 0; i < res.playerList.length; i++) {
                //     let player = res.playerList[i];
                //     let row = $(`<tr>
                //                   <th scope="row">${i + 1}</th>
                //                   <td scope="row">${player.username}</td>
                //                   <td><img  class="img-thumbnail" src="${player.photo}" width="50"></td>
                //                   <td>${player.score}</td>
                //                 </tr>`);
                //     $(".ac-game-rank tbody").append(row);
                // }
            }
        });
    }

    hide() {
        this.$rank.hide(); // 隐藏排行榜界面
    }
}