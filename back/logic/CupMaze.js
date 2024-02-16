const utils = require("./utils");

let gameStates = {
    // a list containing each of your opponent's walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    opponentWalls: [],
    // a list containing each of your walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    ownWalls: [],
    //a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1) as defined in the rules. The value for each cell can be : -1 if you do not see the cell, 0 if you see the cell but it is empty, 1 if you are in the cell, 2 if your opponent is in the cell
    board: [],
};

let position= "";
let lastPosition= "";

let lastKnownOpponentPosition = "";

let lastPerformedAction = "";

let Move = {
    action: "",
    value: ""
};

let expectedFog = [];

/** -----------------------------METHODES DEMANDEES--------------------------- **/

/*
    setup(AIplay) which takes 1 argument whose value is 1 if your AI is the first player, or 2 if it should play second.
    This function has to return a Promise that is resolved into a position string (see below), indicating its placement,
    in less than 1000ms.
*/
function setup(AIplay){
    console.log("AIPLAY");
    for(let i=1;i<=9;i++){
        let row=[];
        for(let j=1;i<=9;i++){
            if((i<=5 && AIplay===1) || (i>=5 && AIplay===2))row.push(0);
            else row.push(-1);
        }
        expectedFog.push(row);
    }
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

/** -----------------------------METHODES NON DEMANDEES MAIS UTILES AU JEU--------------------------- **/

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

function isPlayerVisible(gameState){
    gameState.board.forEach((cellValue)=>{
        if(cellValue===2) return true;
    })
}

function setExpectedFog(Move){
    switch(Move.action){
        case "move":
            // get position before move
            // remove fog created by old position
            // create fog around new Position
            // note that newPosition is the string Move.value
            break;
        case "wall":
            let wallPosition = {pos_x: Move.value[0][0], pos_y: Move.value[0][1]};
            let cellsUpByTwo = [
                wallPosition.pos_x+wallPosition.pos_y,
                wallPosition.pos_x+(parseInt(wallPosition.pos_y)-1),
                (parseInt(wallPosition.pos_x)+1)+wallPosition.pos_y,
                ""+(parseInt(wallPosition.pos_x)+1)+(parseInt(wallPosition.pos_y)-1)
            ];
            let cellsUpByOne= [
                wallPosition.pos_x+(parseInt(wallPosition.pos_y)+1),
                ""+(parseInt(wallPosition.pos_x)+1)+(parseInt(wallPosition.pos_y)-1),
                (parseInt(wallPosition.pos_x)+1)+wallPosition.pos_y,
                ""+(parseInt(wallPosition.pos_x)-1)+(parseInt(wallPosition.pos_y)),
                ""+(parseInt(wallPosition.pos_x)+2)+(parseInt(wallPosition.pos_y)),
                ""+(parseInt(wallPosition.pos_x)+2)+(parseInt(wallPosition.pos_y)-1),
                ""+(parseInt(wallPosition.pos_x))+(parseInt(wallPosition.pos_y)-2),
                ""+(parseInt(wallPosition.pos_x)+1)+(parseInt(wallPosition.pos_y)-2)
            ];
            cellsUpByOne.forEach((element)=>{
                let x= parseInt(element[0]);
                let y= parseInt(element[1]);
                if(x<=9 && y<=9){
                    expectedFog[x][y]+=1;
                }
            })
            cellsUpByTwo.forEach((element)=>{
                let x= parseInt(element[0]);
                let y= parseInt(element[1]);
                if(x<=9 && y<=9){
                    expectedFog[x][y]+=2;
                }
            })
            break;
        case "idle":
            break;
        default:
            console.log("Unexpected Move")
    }
}

function calculatePositionWithFog(gameState){

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