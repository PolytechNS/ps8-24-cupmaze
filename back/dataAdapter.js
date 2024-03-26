
const {Game} = require("./logic/Entities/Game.js");

/*----------------------------------------------------------*/
class dataAdapter {
    constructor(game) {
        this.game = game;
        this.buildDataGame();
    }
    buildDataGame() {
        this.game.casePosition = [];
        this.game.wallPossible = [];
        this.game.gameState = {
            opponentWalls: [],
            ownWalls: [],
            board: []
        }
        const wallRow = [];
        for (let y = 0; y < 9; y++) {
            const row = [];
            const boardRow = [];
            for (let x = 0; x < 9; x++) {
                row.push(`${y+1}${x+1}`);
                if(x > 0 && y < 8) {
                    this.game.wallPossible.push([`${y+1}${x+1}`, -1]);
                }
                if (x === 4) {
                    boardRow.push(0);
                } else if (x > 4) {
                    boardRow.push(-1);
                } else {
                    boardRow.push(0);
                }
            }
            this.game.casePosition.push(row);
            this.game.gameState.board.push(boardRow);
        }

    }
}

function displayBoard(board) {
    for (let j = 8; j >= 0; j--) {
        let line = "";
        for (let i = 0; i < 9; i++) {
            line += board[i][j] + " ";
        }
        console.log(line);
    }
}

function displayBoardWall(board) {
    let line = "";
    for (let i = 0; i < board.length; i++) {
        if (i % 9 === 0) {
            console.log(line);
            line = "";
        }
        line += board[i] + " ";
    }
}



const game = new Game();
const adapter = new dataAdapter(game);
displayBoard(game.casePosition);
colonne = 4;
ligne = 8;
console.log(game.casePosition[colonne-1][ligne-1]);

