export default {
    connect(game, url) {
        this.game = game;
        this.connection = new WebSocket(url);
        this.connection.onopen = this.onopen.bind(this);
        this.connection.onclose = this.onclose.bind(this);
        this.connection.onerror = this.onerror.bind(this);
        this.connection.onmessage = this.onmessage.bind(this);
    },

    onopen() {
        console.log("Ws connected!");
        this.game.status = "before";
    },

    onclose() {
        console.log("Ws disconnected!");
        this.game.status = "connecting";
    },

    onerror(e) {
        console.error(e);
    },

    onmessage(message) {
        console.log("Got message");
        let data = JSON.parse(message.data);
        console.log(data);
        let f = {
            game_started() {
                this.game.my_figure = data.your_figure;
                if (data.your_turn) {
                    this.game.status = "my_turn";
                } else {
                    this.game.status = "rival_turn";
                }
            },
            move_done() {
                this.game.board = data.board;
                this.game.status = "my_turn";
            },
            loose() {
                this.game.board = data.board;
                this.game.status = "loose";
            },
            win() {
                this.game.board = data.board;
                this.game.status = "win";
            },
            draw() {
                this.game.board = data.board;
                this.game.status = "draw";
            }
        };

        f[data.type].bind(this)();
    },

    send(data) {
        this.connection.send(JSON.stringify(data));
    },

    send_move(x, y) {
        this.send({
            type: "move",
            coords: [x, y]
        });
    }
};