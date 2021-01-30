import { createApp } from 'vue';
import ws from '/frontend/js/ws.js';
import '/frontend/css/loader.css';
import '/frontend/css/tictactoe.css';

const Game = {
    data() {
        return {
            status: "connecting", // "connecting" | "before" | "my_turn" | "rival_turn" | "loose" | "win" | "draw"
            board: [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ],
            my_figure: '',
        }
    },

    methods: {
        move(x, y) {
            if (this.board[x][y] != '')
                return;

            if (this.status != "my_turn")
                return;

            this.board[x][y] = this.my_figure;
            this.status = "rival_turn";

            ws.send_move(x, y);
        }
    }
}

function main() {
    let game = createApp(Game).mount("#app");
    ws.connect(game, `ws://${location.host}`);
}

document.addEventListener("DOMContentLoaded", main);