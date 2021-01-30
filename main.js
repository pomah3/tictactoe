const express = require('express');
const WebSocket = require('ws');
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer(app);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/index.html'));
})

const ws = new WebSocket.Server({ server });

waiting_player = null;

games = new Set();

class Game {
    constructor(player1, player2) {
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
        ];

        this.player1 = player1;
        this.player2 = player2;
        this.player_now = player1;

        this.player1.figure = "x";
        this.player2.figure = "o";

        this.player1.game = this;
        this.player2.game = this;

        this.send_game_started();
    }

    send_game_started() {
        this.player1.send(JSON.stringify({
            "type": "game_started",
            "your_turn": true,
            "your_figure": this.player1.figure
        }));

        this.player2.send(JSON.stringify({
            "type": "game_started",
            "your_turn": false,
            "your_figure": this.player2.figure
        }));
    }

    move(player, x, y) {
        if (player != this.player_now)
            return;

        this.board[x][y] = player.figure;

        let win = this.check_state();

        if (win) {
            let loose = win == this.player1 ? this.player2 : this.player1;

            loose.send(JSON.stringify({
                type: "loose",
                board: this.board
            }));

            win.send(JSON.stringify({
                type: "win",
                board: this.board
            }));

            console.log("Game ended!");
            games.delete(this);
            console.log(`Game count: ${games.size}`);

            return;
        }

        if (this.check_draw()) {
            this.player1.send(JSON.stringify({
                "type": "draw",
                board: this.board
            }));
            this.player2.send(JSON.stringify({
                "type": "draw",
                board: this.board
            }));

            console.log("Game ended!");
            games.delete(this);
            console.log(`Game count: ${games.size}`);

            return;
        }


        let that_player = player == this.player1 ? this.player2 : this.player1;
        that_player.send(JSON.stringify({
            type: "move_done",
            board: this.board
        }));
        this.player_now = that_player;
    }

    check_draw() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j] == '')
                    return false;
            }
        }
        return true;
    }

    check_state() {
        if (this.check_state_fig(this.player1.figure))
            return this.player1;
        if (this.check_state_fig(this.player2.figure))
            return this.player2;
    }

    check_state_fig(fig) {
        // check rows
        for (let i = 0; i < 3; i++) {
            if (this.board[i][0] == fig && this.board[i][1] == fig && this.board[i][2] == fig)
                return true;
        }

        // check cols
        for (let i = 0; i < 3; i++) {
            if (this.board[0][i] == fig && this.board[1][i] == fig && this.board[2][i] == fig)
                return true;
        }

        //check diagonals
        if (this.board[0][0] == fig && this.board[1][1] == fig && this.board[2][2] == fig)
            return true;

        if (this.board[2][0] == fig && this.board[1][1] == fig && this.board[0][2] == fig)
            return true;
    }
}

ws.on('connection', client => {
    console.log("Cliend connected!");
    if (!waiting_player) {
        waiting_player = client;
        console.log("One player is waiting!");
    } else {
        games.add(new Game(waiting_player, client));
        waiting_player = null;
        console.log("Game started!");
    }

    client.on("message", message => {
        let data = JSON.parse(message);
        let [x, y] = data.coords;
        console.log("Move done!")
        client.game.move(client, x, y);
    })
});

server.listen(8000, () => {
    console.log(`Server started`)
})