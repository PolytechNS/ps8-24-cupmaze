const utils = require("./utils");

let gameStates = {
    // a list containing each of your opponent's walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    opponentWalls: [],
    // a list containing each of your walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    ownWalls: [],
    //a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1) as defined in the rules. The value for each cell can be : -1 if you do not see the cell, 0 if you see the cell but it is empty, 1 if you are in the cell, 2 if your opponent is in the cell
    board: [],
}

let position= ""

let Move = {
    action: "",
    value: ""
}

function setup(AIplay){
    console.log("AIPLAY");
    //return a Promise that is resolved into a position string
    //The position string is composed of 2 digits representing a cell exactly as stated in the rules.
}



/*
    fonction qui qui prend 1 argument qui est un objet gameState (voir ci-dessous) représentant l'état du jeu
    après l'action de votre adversaire. Cette fonction a 200 ms pour renvoyer une promesse qui est résolue en
    un objet move représentant le prochain mouvement de votre IA.
 */
function nextMove(gameState){
    console.log("gameState");
    const simulation = 1000;
    const possibleMoves = getPossibleMoves(gameState);
    const moveResults = [];
}

function correction(rightMove){
    console.log("rightMove");
    //return a Promise that is resolved into the boolean true, indicating it is ready to continue
}

function updateBoard(gameState){
    console.log("updateBoard");
    //return a Promise resolved into the boolean true in 50ms maximum.
}

function getPossibleMoves(position, gameState) {
    const possibleMoves = [];
    // "12" => ["column", "line"]
    const column = parseInt(position[0]);
    const line = parseInt(position[1]);
    console.log("position", position);
    console.log("column", column, "line", line);
    if (position === null) {
        return null;
    }

    function checkMove(newLine, newColumn, /*possibleMoves, direction*/) {
        if (newLine < 1 || newLine > 9 || newColumn < 1 || newColumn > 9) {
            console.log("newLine", newLine, "newColumn", newColumn);
            return;
        }
        const cell = gameState.board[newLine-1][newColumn-1];
        console.log("cell", cell);
    }
    checkMove(column - 1, line);
    checkMove(column + 1, line);
    checkMove(column, line - 1);
    checkMove(column, line + 1);
}

initGame();
getPossibleMoves("48", gameStates);

/*

        const cell = utils.findCase(newLine, newColumn, elements);
        if (!wall || !wall.isLaid) {
            if (cell.isOccupied) {
                const jumpCell = findJumpCell(newLine, newColumn, direction, elements);
                if (jumpCell) {
                    possibleMoves.push(jumpCell);
                }
            } else {
                console.log("cell", cell);
                possibleMoves.push(cell);
            }
        }
    }


    checkMove(line - 1, column, possibleMoves, "A");
    checkMove(line + 1, column, possibleMoves, "B");
    checkMove(line, column - 1, possibleMoves, "L");
    checkMove(line, column + 1, possibleMoves, "R");

    return possibleMoves;
}

function findJumpCell(line, column, direction, elements) {
    let jumpLine = line;
    let jumpColumn = column;
    let isWall = false;

    switch (direction) {
        case "A":
            jumpLine--;
            isWall = utils.findWall(jumpLine, column, "horizontal", elements)?.isLaid || false;
            break;
        case "B":
            jumpLine++;
            isWall = utils.findWall(line, column, "horizontal", elements)?.isLaid || false;
            break;
        case "L":
            jumpColumn--;
            isWall = utils.findWall(line, jumpColumn, "vertical", elements)?.isLaid || false;
            break;
        case "R":
            jumpColumn++;
            isWall = utils.findWall(line, column, "vertical", elements)?.isLaid || false;
            break;
    }

    const inBoard = jumpLine >= 0 && jumpLine <= 8 && jumpColumn >= 0 && jumpColumn <= 8;

    if (inBoard && !isWall) {
        return utils.findCase(jumpLine, jumpColumn, elements);
    }
    return null;
}
 */



/*-----------fonction non utile pour le jeu mais pour l'affichage du plateau-----------*/

function initGame(){
    // fill the board with -1
    for (let i = 0; i < 9; i++) {
        gameStates.board.push([]);
        for (let j = 0; j < 9; j++) {
            gameStates.board[i].push(`${i+1}${j+1}`);
        }
    }
    gameStates.opponentWalls = [];
    gameStates.ownWalls = [];
}
function displayBoard(board) {
    // Parcourir chaque ligne de la grille
    for (let i = 0; i < board.length; i++) {
        let row = ''; // Initialiser une chaîne vide pour stocker la ligne actuelle

        // Parcourir chaque cellule de la ligne
        for (let j = 0; j < board[i].length; j++) {
            row += board[i][j] + ' '; // Ajouter la valeur de la cellule avec un espace à la fin
        }

        console.log(row); // Afficher la ligne complète
    }
}

initGame();
displayBoard(gameStates.board);