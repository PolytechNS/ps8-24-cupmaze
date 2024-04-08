const { Wall } = require('./Wall.js');
const { Case } = require('./Case.js');
const { Space } = require('./Space.js');
const { getPossibleMoves } = require('../movePlayerReferee.js');
const {findWall} = require("../utils");

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
        this.elements = this.elementJsonToElement(savedGame.elements);
        this.lastWallsLaid = savedGame.lastWallsLaid;
        this.lastWallLaidsIDHtml = savedGame.lastWallLaidsIDHtml;

        //this.graph = savedGame.graph;
    }

    elementJsonToElement(elementJson) {
        let res = [];
        elementJson.forEach(element => {
            if (element.hasOwnProperty("isOccupied")) {
                res.push(new Case(element.pos_x, element.pos_y, element.isOccupied));
            } else if (element.hasOwnProperty("inclinaison")) {
                const wall = new Wall(element.pos_x, element.pos_y, element.isLaid, element.inclinaison);
                wall.setPlayer(element.player);
                res.push(wall);
            } else {
                const space = new Space(element.pos_x, element.pos_y);
                space.setIsLaid(element.isLaid);
                space.setPlayer(element.player);
                res.push(space);
            }
        });
        return res;
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
        if(this.playerPosition.player1 === null || this.playerPosition.player2===null){
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

    getCase(x, y) {
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

    movePlayer(number, caseWanted, playerCurrentPosition) {
        const coordinates = [caseWanted.getPos_x(), caseWanted.getPos_y()];

        this.lastPlayerPosition[`player${number}`] = this.playerPosition[`player${number}`];
        this.playerPosition[`player${number}`] = coordinates
        caseWanted.setIsOccupied(true);
        if (playerCurrentPosition === null) {
            this.actionsToDo = 0;
            return;
        }
        const lastCase = this.getCase(this.lastPlayerPosition[`player${number}`][0], this.lastPlayerPosition[`player${number}`][1]);
        lastCase.setIsOccupied(false);
        this.actionsToDo=0;
    }

    layWall(firstCase, secondCase, space) {
        // on chercher les mur et le space dans les elements
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i] instanceof Wall) {
                if (this.elements[i].equals(firstCase) || this.elements[i].equals(secondCase)) {
                    this.elements[i].setIsLaid(true);
                    this.elements[i].setPlayer(this.currentPlayer);
                }
            }
            if (this.elements[i] instanceof Space) {
                if (this.elements[i].equals(space)) {
                    this.elements[i].setIsLaid(true);
                    this.elements[i].setPlayer(this.currentPlayer);
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
    }

    buildGraphFromElements(){
        let graph = {};
        for(let i= 0; i < 9;i++){
            graph[i] = [];
            for (let j = 0; j < 9; j++){
                /// on creer les edges
                graph[i][j] = [];
                if (i > 0) { graph[i][j].push([i,j+1]); }
                if (i < 8) { graph[i][j].push([i+2, j+1]); }
                if (j > 0) { graph[i][j].push([i+1, j]);  }
                if (j < 8) { graph[i][j].push([i+1, j+2]); }
            }
        }
        // on ajoute les murs
        this.elements.forEach(element => {
            if(element instanceof Wall) {
                if (element.isLaid) {
                    const x = element.getPos_x();
                    const y = element.getPos_y();
                    if (element.inclinaison === "horizontal") {
                        graph[x - 1][y - 2] = graph[x - 1][y - 2].filter(edge => !(edge[0] === x && edge[1] === y));
                        graph[x - 1][y - 1] = graph[x - 1][y - 1].filter(edge => !(edge[0] === x && edge[1] === y - 1));
                    }
                    if (element.inclinaison === "vertical") {
                        graph[x][y - 1] = graph[x][y - 1].filter(edge => !(edge[0] === x && edge[1] === y));
                        graph[x - 1][y - 1] = graph[x - 1][y - 1].filter(edge => !(edge[0] === x+1 && edge[1] === y));
                    }
                }
            }
        });
        return graph;
    }

    isWallBlockingPath(colonne1, ligne1, colonne2, ligne2, inclinaison){
        // on ajoute les 2 mur
        let wall1 = findWall(colonne1, ligne1, inclinaison, this.elements);
        let wall2 = findWall(colonne2, ligne2, inclinaison, this.elements);
        // on les cherche dans le element et on les mmet occupé
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i] instanceof Wall) {
                if (this.elements[i].equals(wall1) || this.elements[i].equals(wall2)) {
                    this.elements[i].setIsLaid(true);
                    //this.elements[i].setPlayer(this.currentPlayer);
                }
            }
        }
        let graph = this.buildGraphFromElements();

        // on verifie si il y a un
        let res = this.dfs(graph, this.playerPosition.player1, 9);
        let res2 = this.dfs(graph, this.playerPosition.player2,1);

        // on retire les mur
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i] instanceof Wall) {
                if (this.elements[i].equals(wall1) || this.elements[i].equals(wall2)) {
                    this.elements[i].setIsLaid(false);
                }
            }
        }

        // si il y a un chemin pour les 2 joueurs on renvoit true
        if (res === true && res2 === true) {
            return true;
        }
    }

    dfs(graph, playerPosition, number) {
        // on recupere la position du joueur
        const colonne = playerPosition[0];
        const ligne = playerPosition[1];

        // on creer un tableau pour savoir si on a deja visite une case
        let visited = Array(9).fill(false).map(() => Array(9).fill(false));
        // on creer un tableau pour savoir si on a deja visite une case
        let stack = [];
        stack.push([colonne, ligne]);
        visited[colonne-1][ligne-1] = true;
        while (stack.length !== 0) {
            let current = stack.pop();
            let x = current[0];
            let y = current[1];
            if (y === number) {
                return true;
            }
            for (let i = 0; i < graph[x-1][y-1].length; i++) {
                let next = graph[x-1][y-1][i];
                if (!visited[next[0]-1][next[1]-1]) {
                    visited[next[0]-1][next[1]-1] = true;
                    stack.push(next);
                }
            }
        }
        return false;
    }

}


module.exports = { Game };