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
                    this.game.wallPossible.push([`${y+1}${x+1}`, 0]);
                }
                if (x === 4) {
                    boardRow.push(0);
                } else if (x > 4) {
                    boardRow.push(-1);
                } else {
                    boardRow.push(1);
                }
            }
            this.game.casePosition.push(row);
            this.game.gameState.board.push(boardRow);
        }

    }
}