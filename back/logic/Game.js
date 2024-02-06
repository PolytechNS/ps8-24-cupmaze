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
        this.lastPlayerPosition = [null, null];
        this.walls = [];
        this.cases = [];
        this.init();
    }

    validateRound(){
        this.lastPlayerPosition[this.currentPlayer - 1] = this.playerPosition[this.currentPlayer - 1];
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
        //console.log(caseWanted);
        if(this.actionsToDo > 0){
            if(this.numberTour===1){
                if(this.currentPlayer === 1 && caseWanted.getPos_x() === 0){
                    console.log("[+] Tour 1, le joueur1 peut se déplacer sur la ligne 0");
                    return true;
                }else if(this.currentPlayer === 2 && caseWanted.getPos_x() === 8){
                    console.log("[+] Tour 1, le joueur2 peut se déplacer sur la ligne 8");
                    return true;
                } else {
                    console.log("[-] Tour 1, le joueur ne peut pas se déplacer sur cette ligne");
                    return false;
                }
            }
            if(!caseWanted.getIsOccupied()){
                if(this.playerPosition[this.currentPlayer - 1].isAdjacent(caseWanted)){
                    if(this.noWallsBetween(this.playerPosition[this.currentPlayer - 1], caseWanted)){
                        console.log("[+] Pas de murs entre les positions et pas de joueur sur la case voulue et cases adjacentes");
                        return true;
                    } else {
                        console.log("[-] Il y a un mur entre les deux cases");
                    }
                }
            }else{
                console.log("[-] La case est occupée par un joueur");
            }
        }else{
            console.log("[-] Plus de mouvements possibles pour ce tour");
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
        this.lastPlayerPosition[this.currentPlayer - 1] = this.playerPosition[this.currentPlayer - 1];
        if(this.playerPosition[this.currentPlayer - 1]!==null) this.playerPosition[this.currentPlayer - 1].setIsOccupied(false);
        this.playerPosition[this.currentPlayer - 1] = caseWanted;
        this.playerPosition[this.currentPlayer - 1].setIsOccupied(true);
        this.actionsToDo--;
        return true;
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
        //console.log("Retrieving case at position (" + x + ", " + y + ")");
        return this.cases[parseInt(x) * 9 + parseInt(y)];
    }

    undoPosition(){
        this.playerPosition[this.currentPlayer - 1].setIsOccupied(false);
        this.playerPosition[this.currentPlayer - 1] = this.lastPlayerPosition[this.currentPlayer - 1];
        this.playerPosition[this.currentPlayer - 1].setIsOccupied(true);
        this.actionsToDo++;
    }

}

module.exports = { Game };