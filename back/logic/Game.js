const { Wall } = require('./Wall.js');
const { Case } = require('./Case.js');
const { Space } = require('./Space.js');
const { getPossibleMoves } = require('./movePlayerReferee.js');


class Game {
    constructor() {
        this.currentPlayer = 1;
        this.nbWallsPlayer1 = 10;
        this.nbWallsPlayer2 = 10;
        this.actionsToDo = 1;
        this.numberTour = 1;
        this.playerPosition = {
            player1: null,
            player2: null
        };
        this.lastPlayerPosition = [null, null];
        this.elements = [];
        this.init();
    }

    init() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                //ajoute case, mur et à la fin on doit juste finir sur case
                this.elements.push(new Case(i, j, false));
                if(i<8) this.elements.push(new Wall(i, j, false, "vertical"));
            }
            for(let j = 0; j < 9; j++){
                this.elements.push(new Wall(i, j, true, "horizontal"));
                // on rajoute un space entre chaque mur
                if (j < 8) {
                    this.elements.push(new Space(i, j, true));
                }
            }
        }
    }

    getPossibleMoves(playerPosition) {
        return getPossibleMoves(playerPosition, this.elements);
    }

    isGameOver(playersPositions) {
        if (playersPositions.player1[0] === 8) return 1;
        if (playersPositions.player2[0] === 0) return 2;
        return 0;
    }
}

module.exports = { Game };