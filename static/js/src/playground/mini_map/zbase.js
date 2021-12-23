class MiniMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas class="mini-map"></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.bg_color = "rgba(0, 0, 0, 0.3)";
        this.bright_color = "rgba(247, 232, 200, 0.7)";
        this.players = this.playground.players;
        this.pos_x = this.playground.width - this.playground.height * 0.3;
        this.pos_y = this.playground.height * 0.7;
        this.width = this.playground.height * 0.3;
        this.height = this.width;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        this.playground.$playground.append(this.$canvas);
        this.real_map_width = this.playground.virtual_map_width;

        this.lock = false;
        this.drag = false;
    }

    start() {
        this.add_listening_events();
    }

    resize() {
        this.pos_x = this.playground.width - this.playground.height * 0.3;
        this.pos_y = this.playground.height * 0.7;
        this.width = this.playground.height * 0.3;
        this.height = this.width;
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;

        this.margin_right = (this.playground.$playground.width() - this.playground.width) / 2;
        this.margin_bottom = (this.playground.$playground.height() - this.playground.height) / 2;
        this.$canvas.css({
            "position": "absolute",
            "right": this.margin_right,
            "bottom": this.margin_bottom
        });
    }

    add_listening_events() {
        let outer = this;
        this.$canvas.on("contextmenu", function () {
            return false;
        });
        this.$canvas.mousedown(function (e) {
            if (outer.playground.state === "waiting") {
                return true;
            }

            const rect = outer.ctx.canvas.getBoundingClientRect();
            let ctx_x = e.clientX - rect.left, ctx_y = e.clientY - rect.top; // 小地图上的位置
            let tx = ctx_x / outer.width * outer.playground.virtual_map_width,
                ty = ctx_y / outer.height * outer.playground.virtual_map_height; // 大地图上的位置
            if (e.which === 1) { // 左键，定位屏幕中心
                outer.lock = true;
                outer.drag = false;

                outer.playground.focus_player = null;
                outer.playground.re_calculate_cx_cy(tx, ty);
                // (rect_x1, rect_y1)为小地图上框框的左上角的坐标（非相对坐标）
                outer.rect_x1 = ctx_x - (outer.playground.width / 2 / outer.playground.scale / outer.playground.virtual_map_width) * outer.width;
                outer.rect_y1 = ctx_y - (outer.playground.height / 2 / outer.playground.scale / outer.playground.virtual_map_height) * outer.height;
            } else if (e.which === 3) { // 右键，移动过去
                let player = outer.playground.players[0];
                if (player.character === "me") {
                    player.move_to(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_move_to(tx, ty);
                    }
                }
            }
        });

        this.$canvas.mousemove(function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let ctx_x = e.clientX - rect.left, ctx_y = e.clientY - rect.top; // 小地图上的位置
            let tx = ctx_x / outer.width * outer.playground.virtual_map_width,
                ty = ctx_y / outer.height * outer.playground.virtual_map_height; // 大地图上的位置
            if (e.which === 1) {
                if (outer.lock) {
                    outer.drag = true;
                    outer.playground.focus_player = null;
                    outer.playground.re_calculate_cx_cy(tx, ty);
                    outer.rect_x1 = ctx_x - (outer.playground.width / 2 / outer.playground.scale / outer.playground.virtual_map_width) * outer.width;
                    outer.rect_y1 = ctx_y - (outer.playground.height / 2 / outer.playground.scale / outer.playground.virtual_map_height) * outer.height;
                }
            }
        });

        this.$canvas.mouseup(function (e) {
            if (outer.lock) outer.lock = false;
            outer.playground.game_map.$canvas.focus();
        });
    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.clearRect(0, 0, this.width, this.height); // 不加这行的话小地图背景会变黑
        this.ctx.fillStyle = this.bg_color;
        this.ctx.fillRect(0, 0, this.width, this.height);
        if (this.playground.focus_player) {
            this.rect_x1 = (this.playground.focus_player.x - this.playground.width / 2 / scale) / this.real_map_width * this.width;
            this.rect_y1 = (this.playground.focus_player.y - this.playground.height / 2 / scale) / this.real_map_width * this.height;
        }
        let w = this.playground.width / scale / this.real_map_width * this.width;
        let h = this.playground.height / scale / this.real_map_width * this.height;
        this.ctx.save();
        this.ctx.strokeStyle = this.bright_color;
        this.ctx.setLineDash([15, 5]);
        this.ctx.lineWidth = Math.ceil(3 * scale / 1080);
        this.ctx.strokeRect(this.rect_x1, this.rect_y1, w, h);
        this.ctx.restore();
        for (let i = 0; i < this.players.length; i++) {
            let obj = this.players[i];
            // if (obj.character != "me" && !obj.visible) // 玩家不可见
            //     continue;
            // 物体在真实地图上的位置 -> 物体在小地图上的位置
            let x = obj.x / this.real_map_width * this.width, y = obj.y / this.real_map_width * this.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.width * 0.05, 0, Math.PI * 2, false); // false代表顺时针
            if (obj.character === "me") this.ctx.fillStyle = "green";
            else this.ctx.fillStyle = "red";
            this.ctx.fill();
        }
    }
}
