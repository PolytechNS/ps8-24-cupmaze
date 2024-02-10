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
        this.playerPosition = [null, null];
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
        const possibleMoves = getPossibleMoves(playerPosition, this.elements);
    }

    isGameOver() {
        if(this.playerPosition[0]===null || this.playerPosition[1]===null){
            console.error("ATTENTION UNE DES DEUX POSITIONS EST NULL DANS LE BACK");
            return [false, -1];
        }
        if(this.playerPosition[0].getPos_x()===8 && this.playerPosition[1].getPos_x() === 0){
            return [true, 0];
        }
        if(this.playerPosition[0].getPos_x()===8 && this.playerPosition[1].getPos_x() !==0){
            return [true, 1];
        }
        if(this.playerPosition[0].getPos_x()!==8 && this.playerPosition[1].getPos_x() ===0){
            return [true, 2];
        }
        return [false, -1];
    }
}

module.exports = { Game };