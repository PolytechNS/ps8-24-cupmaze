const { Wall } = require('./Wall.js');
const { Case } = require('./Case.js');

class Game {
    constructor() {
        this.currentPlayer = 1;
        this.nbWallsPlayer1 = 10;
        this.nbWallsPlayer2 = 10;
        this.actionsToDo = 1;
        this.numberTour = 1;
        this.playerPosition = [null, null];
        this.walls = [];
        this.cases = [];
        this.init();
    }

    init() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.cases.push(new Case(i, j, false));
                if (j !== 8) {
                    this.walls.push(new Wall(i, j, false));
                }
            }
            if (i === 8) {
                break;
            }
            for (let j = 0; j < 9; j++) {
                this.walls.push(new Wall(i, j, false));
            }
        }
    }
}

module.exports = { Game };