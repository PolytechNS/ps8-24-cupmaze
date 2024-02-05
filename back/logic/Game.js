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

    validateRound(){
        this.currentPlayer === 1 ? this.currentPlayer = 2 : this.currentPlayer = 1;
        this.actionsToDo = 1;
        this.numberTour++;
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

    moveIsPossible(caseWanted){
        if(this.playerPosition[this.currentPlayer - 1] === null){
            console.log("[+] La position était nulle donc mouvement forcément autorisé");
            return true;
        }
        if(!caseWanted.getIsOccupied()){
            if(this.playerPosition[this.currentPlayer - 1].isAdjacent(caseWanted)){
                if(this.noWallsBetween(this.playerPosition[this.currentPlayer - 1], caseWanted)){
                    console.log("[+] Pas de murs entre les positions et pas de joueur sur la case voulue et cases adjacentes");
                    return true;
                }
            }
        }
        return false;
    }

    noWallsBetween(casePlayer, caseWanted) {
        if (casePlayer.getPos_x() === caseWanted.getPos_x()) {
            if (casePlayer.getPos_y() < caseWanted.getPos_y()) {
                if (this.walls[casePlayer.getPos_x() * 8 + casePlayer.getPos_y()].getIsLaid()) {
                    return false;
                }
            } else {
                if (this.walls[casePlayer.getPos_x() * 8 + caseWanted.getPos_y()].getIsLaid()) {
                    return false;
                }
            }
        } else {
            if (casePlayer.getPos_x() < caseWanted.getPos_x()) {
                if (this.walls[casePlayer.getPos_x() * 8 + casePlayer.getPos_y() + 64].getIsLaid()) {
                    return false;
                }
            } else {
                if (this.walls[caseWanted.getPos_x() * 8 + casePlayer.getPos_y() + 64].getIsLaid()) {
                    return false;
                }
            }
        }
        return true;
    }

    movePlayer(caseWanted){
        if(this.moveIsPossible(this.currentPlayer, caseWanted) && this.actionsToDo > 0){
            this.playerPosition[this.currentPlayer - 1].setIsOccupied(false);
            this.playerPosition[this.currentPlayer - 1] = caseWanted;
            this.playerPosition[this.currentPlayer - 1].setIsOccupied(true);
            this.actionsToDo--;
            return true;
        }
        return false;
    }

    layWall(numberPlayer, wallWanted){
        if(this.actionsToDo > 0){
            if(!wallWanted.getIsLaid()){
                if(numberPlayer === 1 && this.nbWallsPlayer1 > 0){
                    this.nbWallsPlayer1--;
                    wallWanted.setIsLaid(true);
                    this.actionsToDo--;
                    return true;
                }
                if(numberPlayer === 2 && this.nbWallsPlayer2 > 0){
                    this.nbWallsPlayer2--;
                    wallWanted.setIsLaid(true);
                    this.actionsToDo--;
                    return true;
                }
            }
        }
        return false;
    }

    retrievePlayerPosition(numberPlayer){
        return this.playerPosition[numberPlayer - 1];
    }

    retrieveWalls(x,y){
        return this.walls[x * 8 + y];
    }

    retrieveCase(x,y){
        return this.cases[x * 9 + y];
    }

}

module.exports = { Game };