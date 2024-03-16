const { Wall } = require('./Wall.js');
const { Case } = require('./Case.js');
const { Space } = require('./Space.js');
const { getPossibleMoves } = require('./movePlayerReferee.js');

const { Node, Graph, NodeWall, PriorityQueue } = require('./CupMaze.js');

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

        this.graph = new Graph(9, 9);

        this.casePosition = [];
        this.wallPossible = [];
        this.gameState = {};
    }


    assignGameContext(savedGame) {
        this.userEmail = savedGame.userEmail;
        this.currentPlayer = savedGame.currentPlayer;
        this.nbWallsPlayer1 = savedGame.nbWallsPlayer1;
        this.nbWallsPlayer2 = savedGame.nbWallsPlayer2;
        this.actionsToDo = savedGame.actionsToDo;
        this.numberTour = savedGame.numberTour;
        this.playerPosition = savedGame.playerPosition;
        this.lastPlayerPosition = savedGame.lastPlayerPosition;
        this.elements = savedGame.elements;
        this.lastWallsLaid = savedGame.lastWallsLaid;
        this.lastWallLaidsIDHtml = savedGame.lastWallLaidsIDHtml;

        this.graph = savedGame.graph;
    }

    init() {
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 9; j++) {
                this.elements.push(new Case(j, i, false));
                if(j<=8) {
                    this.elements.push(new Wall(j, i, false, "vertical"));
                }
            }
            for(let j = 1; j <= 9; j++){
                this.elements.push(new Wall(j, i, false, "horizontal"));
                if (j <= 8) {
                    this.elements.push(new Space(j, i, true));
                }
            }
        }
    }

    getPossibleMoves(playerPosition) {
        return getPossibleMoves(playerPosition, this.elements);
    }

    isGameOver() {
        if(this.playerPosition.player1 ===null || this.playerPosition.player2===null){
            console.error("ATTENTION UNE DES DEUX POSITIONS EST NULL DANS LE BACK");
            return [false, -1];
        }
        if(this.playerPosition.player1[1] === 9 && this.playerPosition.player2[1] === 1){
            return [true, 0];
        }
        if(this.playerPosition.player1[1] === 9 && this.playerPosition.player2[1] !== 1){
            return [true, 1];
        }
        if(this.playerPosition.player1[1] !== 9 && this.playerPosition.player2[1] === 1){
            return [true, 2];
        }
        return [false, -1];
    }

    getCase(y, x) {
        console.log("On cherche la case : ", x, y);
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
        console.log("caseWanted", caseWanted);
        const coordinates = [caseWanted.getPos_x(), caseWanted.getPos_y()];
        this.lastPlayerPosition[`player${number}`] = this.playerPosition[`player${number}`];
        this.playerPosition[`player${number}`] = coordinates
        caseWanted.setIsOccupied(true);
        if (playerCurrentPosition === null) {
            this.actionsToDo = 0;
            return;
        }
        const lastCase = this.getCase(this.lastPlayerPosition[`player${number}`][1], this.lastPlayerPosition[`player${number}`][0]);
        lastCase.setIsOccupied(false);
        this.actionsToDo=0;
    }

    layWall(firstCase, secondCase, space) {
        // on chercher les mur et le space dans les elements
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i] instanceof Wall) {
                if (this.elements[i].equals(firstCase) || this.elements[i].equals(secondCase)) {
                    this.elements[i].setIsLaid(true);
                }
            }
            if (this.elements[i] instanceof Space) {
                if (this.elements[i].equals(space)) {
                    this.elements[i].setIsLaid(true);
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
            elements: this.elements,
            lastActionType: this.lastActionType,
            lastWallsLaid: this.lastWallsLaid,
            lastWallLaidsIDHtml: this.lastWallLaidsIDHtml
        };
    }
    undoWalls(){
        for(let i=0; i!==this.lastWallsLaid.length; i++){
            this.lastWallsLaid[i].setIsLaid(false);
        }
        const colonne = this.lastWallsLaid[0].getPos_x();
        const ligne = this.lastWallsLaid[0].getPos_y();
        this.graph.removeWall(colonne, ligne);
    }
}


module.exports = { Game };