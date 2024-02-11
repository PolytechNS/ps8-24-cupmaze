const { Wall } = require('./Wall.js');
const { Case } = require('./Case.js');
const { Space } = require('./Space.js');
const { getPossibleMoves } = require('./movePlayerReferee.js');


class Game {
    constructor() {
        this.userEmail = "";
        this.currentPlayer = 1;
        this.nbWallsPlayer1 = 10;
        this.nbWallsPlayer2 = 10;
        this.actionsToDo = 1;
        this.numberTour = 1;
        this.playerPosition = {
            player1: null,
            player2: null
        };
        this.lastPlayerPosition = {
            player1: null,
            player2: null
        };
        this.elements = [];
        this.lastActionType = "";
        this.init();

        this.lastWallsLaid = [];
        this.lastWallLaidsIDHtml = [];
    }

    assignGameContext({userEmail,currentPlayer,nbWallsPlayer1, nbWallsPlayer2, actionsToDo, numberTour, playerPosition, lastPlayerPosition, elements}) {
        this.userEmail = userEmail;
        this.currentPlayer = currentPlayer;
        this.nbWallsPlayer1 = nbWallsPlayer1;
        this.nbWallsPlayer2 = nbWallsPlayer2;
        this.actionsToDo = actionsToDo;
        this.numberTour = numberTour;
        this.playerPosition = playerPosition;
        this.lastPlayerPosition = lastPlayerPosition;
        this.elements = elements;
    }

    init() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                //ajoute case, mur et à la fin on doit juste finir sur case
                this.elements.push(new Case(i, j, false));
                if(j<8) {
                    console.log("wall vertical", i, j);
                    this.elements.push(new Wall(i, j, false, "vertical"));
                }
            }
            for(let j = 0; j < 9; j++){
                this.elements.push(new Wall(i, j, false, "horizontal"));
                // on rajoute un space entre chaque mur
                if (j < 8) {
                    this.elements.push(new Space(i, j, true));
                }
            }
        }
    }

    getPossibleMoves(playerPosition) {
        if(this.actionsToDo===0) return [];
        return getPossibleMoves(playerPosition, this.elements);
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

    getCase(y, x) {
        console.log("On cherche la case : ", y, x);
        for (let i = 0; i < this.elements.length; i++) {
            if(this.elements[i] instanceof Case){
                if(this.elements[i].getPos_x()===parseInt(x) && this.elements[i].getPos_y()===parseInt(y)){
                    return this.elements[i];
                }
            }
        }
    }

    getPlayerCurrentPosition(index) {
        return this.playerPosition[`player${index}`];
    }


    getPlayerLastPosition(index) {
        return this.lastPlayerPosition[index - 1];
    }

    movePlayer(number, caseWanted, playerCurrentPosition) {

        console.log("ancientV1", this.lastPlayerPosition[`player${number}`])
        console.log("movePlayerV1", this.playerPosition[`player${number}`])

        const coordinates = [caseWanted.getPos_x(), caseWanted.getPos_y()];
        this.lastPlayerPosition[`player${number}`] = this.playerPosition[`player${number}`];
        this.playerPosition[`player${number}`] = coordinates

        console.log("ancientV2", this.lastPlayerPosition[`player${number}`])
        console.log("movePlayerV2", this.playerPosition[`player${number}`])

        //return getPossibleMoves(playerPosition, this.elements);
    }

    isGameOver(playersPositions) {
        if (playersPositions.player1[0] === 8) return 1;
        if (playersPositions.player2[0] === 0) return 2;
        return 0;
    }

    layWall(firstCase, secondCase, space) {
        // on chercher les mur et le space dans les elements
        console.log("firstCase", firstCase);
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i] instanceof Wall) {
                if (this.elements[i].equals(firstCase) || this.elements[i].equals(secondCase)) {
                    this.elements[i].setIsLaid(true);
                    console.log("MUR TROUVE");
                }
            }
            if (this.elements[i] instanceof Space) {
                if (this.elements[i].equals(space)) {
                    this.elements[i].setIsLaid(true);
                    console.log("SPACE TROUVE");
                }
            }
        }
        this.lastWallsLaid = [firstCase, secondCase, space];
    }

    clearWallsAfterRoundEnd(){
        this.lastWallsLaid = [];
        this.lastWallLaidsIDHtml = [];
    }

    setUserEmail(userEmail){
        this.userEmail=userEmail;
    }

    toJSON() {
        return {
            userEmail: this.userEmail,
            currentPlayer: this.currentPlayer,
            nbWallsPlayer1: this.nbWallsPlayer1,
            nbWallsPlayer2: this.nbWallsPlayer2,
            actionsToDo: this.actionsToDo,
            numberTour: this.numberTour,
            playerPosition: this.playerPosition,
            lastPlayerPosition: this.lastPlayerPosition,
            elements: this.elements
        };
    }
    undoWalls(){
        for(let i=0; i!==this.lastWallsLaid.length; i++){
            this.lastWallsLaid[i].setIsLaid(false);
        }
    }


}

module.exports = { Game };