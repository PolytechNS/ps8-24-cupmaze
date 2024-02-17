const utils = require("./utils");

let botGameState = {
    // a list containing each of your opponent's walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    opponentWalls: [],
    // a list containing each of your walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    ownWalls: [],
    //a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1) as defined in the rules. The value for each cell can be : -1 if you do not see the cell, 0 if you see the cell but it is empty, 1 if you are in the cell, 2 if your opponent is in the cell
    board: [],
};

let position= "";
let lastPosition= "";

let lastKnownOpponentPosition = [false,""];

let lastPerformedAction = "";

let Move = {
    action: "",
    value: ""
};

let expectedFog = [];
let expectedVision = [];

let player;
let roundNumber=1;

/** -----------------------------METHODES DEMANDEES--------------------------- **/

/*
    setup(AIplay) which takes 1 argument whose value is 1 if your AI is the first player, or 2 if it should play second.
    This function has to return a Promise that is resolved into a position string (see below), indicating its placement,
    in less than 1000ms.
*/
function setup(AIplay){
    console.log("AIPLAY");
    player=AIplay;
    for(let i=1;i<=9;i++){
        let row=[];
        for(let j=1;i<=9;i++){
            if((i<=5 && AIplay===1) || (i>=5 && AIplay===2))row.push(0);
            else row.push(-1);
        }
        expectedFog.push(row);
    }
    roundNumber++;
    expectedVision=expectedFog;
    position = player===1? "11":"19";
    lastPosition = position;

    return new Promise((resolve, reject)=>{
        resolve(position);
    });
    //return a Promise that is resolved into a position string
    //The position string is composed of 2 digits representing a cell exactly as stated in the rules.
}



/*
    fonction qui qui prend 1 argument qui est un objet gameState (voir ci-dessous) représentant l'état du jeu
    après l'action de votre adversaire. Cette fonction a 200 ms pour renvoyer une promesse qui est résolue en
    un objet move représentant le prochain mouvement de votre IA.


    console.log("gameState");
    const simulation = 1000;
    const possibleMoves = getPossibleMoves(gameState);
    const moveResults = [];
 */
function nextMove(gameState){
    const Move={action:"",value: ""};
    if(roundNumber===2) {
        Move.action = "wall";
        Move.value = player===1? ["39",0]:["32",0];
    }
    else{
        const opponentActionType = getOpponentActionType(gameState);
        if(opponentActionType==="wall")
            setExpectedFog({action:"wall",value:gameState.opponentWalls[gameState.opponentWalls.length-1]});
        else {
            let oppPlayerPos = isPlayerVisible(gameState);
            if(oppPlayerPos!==undefined) {
                lastKnownOpponentPosition[0]=true;
                lastKnownOpponentPosition[1] = oppPlayerPos;
            }
            else {
                lastKnownOpponentPosition[0]=false;
            }
        }

        if(lastKnownOpponentPosition[0]) {
            //move arnaud
        }
        else if(roundNumber===3){
            Move.action = "wall";
            if(opponentActionType==="wall") Move.value = player===1? ["79",0]:["72",0];
            else Move.value = player===1? ["78",0]:["73",0];
        }
        else{
            Move.action = "wall";
            let x = player===1? parseInt(lastKnownOpponentPosition[1][0])-1:parseInt(lastKnownOpponentPosition[1][0])+1;
            let y = lastKnownOpponentPosition[1][1];
            Move.value = ""+x+y;
        }
    }
    setExpectedFog(Move);
    lastPerformedAction=Move;
    roundNumber++;
    return new Promise((resolve, reject)=>{
        resolve(Move);
    });
}

function correction(rightMove){
    console.log("rightMove");
    //return a Promise that is resolved into the boolean true, indicating it is ready to continue
}

function updateBoard(gameState){
    if(roundNumber===2) {
        // if player is visible then remember their position
        let oppPlayerPos = isPlayerVisible(gameState);
        if(oppPlayerPos!==undefined) lastKnownOpponentPosition=oppPlayerPos;
        // otherwise check to see if we can pinpoint him using the fog
        else {
            let cellsToCheck = player === 1 ? ["29", "59"] : ["21", "51"];
            if(gameState.board[parseInt(cellsToCheck[0][1])][parseInt(cellsToCheck[0][0])]===-1) {
                lastKnownOpponentPosition[0]=true;
                lastKnownOpponentPosition[1]=""+(parseInt(cellsToCheck[0][0]) - 1) + cellsToCheck[0][1];
            }
            else if(gameState.board[parseInt(cellsToCheck[1][1])][parseInt(cellsToCheck[1][0])]===-1) {
                lastKnownOpponentPosition[0]=true;
                lastKnownOpponentPosition[1] = "" + (parseInt(cellsToCheck[1][0]) + 1) + cellsToCheck[1][1];
            }
        }
    }
    else {
        let oppPlayerPos = isPlayerVisible(gameState);
        if(oppPlayerPos!==undefined) lastKnownOpponentPosition=[true,oppPlayerPos];
    }
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
    for(let i=0;i<9;i++){
        for(let j=0;j<9;j++){
            if (gameState.board[i][j]===2) return ""+(9-j)+(1+i);
        }
    }
    return undefined;
}

function getOpponentActionType(newGameState){
    return newGameState.opponentWalls!==botGameState.opponentWalls? "wall":"move";
}

function getCellsAround(x,y){
    return [
        x+(parseInt(y)+1),
        x+(parseInt(y)-1),
        (parseInt(x)-1)+y,
        (parseInt(x)+1)+y,
    ]
}

function setExpectedFog(Move){
    switch(Move.action){
        case "move":
            // get position before move
            // remove fog created by old position
            let x=lastPosition[0];
            let y=lastPosition[1];
            let cellsAroundLastPosition=getCellsAround(x,y);
            cellsAroundLastPosition.push(lastPosition);
            cellsAroundLastPosition.forEach((element)=> addVisibilityToElement(element,-1));

            // create fog around new Position
            // note that newPosition is the string Move.value
            x=position[0];
            y=position[1];
            let cellsAroundNewPosition=getCellsAround(x,y);
            cellsAroundNewPosition.push(position);
            cellsAroundNewPosition.forEach((element)=> addVisibilityToElement(element,1));
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
            cellsUpByOne.forEach((element)=> addVisibilityToElement(element,1));
            cellsUpByTwo.forEach((element)=> addVisibilityToElement(element,2));
            break;
        case "idle":
            break;
        default:
            console.log("Unexpected Move")
    }
}

function addVisibilityToElement(element,visibility){
    let x= parseInt(element[0]);
    let y= parseInt(element[1]);
    if(x<=9 && y<=9){
        expectedFog[x][y]+=visibility;
    }
}

function setVisionFromFog(){
    for (let i=0;i<9;i++){
        for (let j=0;j<9;j++){
            expectedVision[i][j]=expectedFog[i][j]<0? -1:0;
            if(""+i+j===position) expectedVision[i][j]=1;
        }
    }
}

function calculateNextWallPosWithFog(gameState){
    let actualVision=gameState.board;
    let visionAnomalies=[];
    for(let i=0;i<9;i++){
        for (let j=0;j<9;j++){
            if(actualVision[i][j]!==expectedVision[i][j]) visionAnomalies.push(""+i+j);
        }
    }

    function wallPlacementValid(wallAbove) {
        return !gameState.opponentWalls.includes([wallAbove, 0]) && !gameState.opponentWalls.includes([wallAbove, 1]) &&
            !gameState.ownWalls.includes([wallAbove, 0]) && !gameState.ownWalls.includes([wallAbove, 1]);
    }

    if(visionAnomalies.length===1) {
        let anomalyX = parseInt(visionAnomalies[0][0]);
        let anomalyY = parseInt(visionAnomalies[0][1]);
        let wallAbove = "" + anomalyX + (anomalyY + 1);
        if (anomalyY < 9 && wallPlacementValid(wallAbove)) return wallAbove;
        wallAbove = "" + (anomalyX - 1) + (anomalyY + 1);
        if (anomalyY < 9 && anomalyX > 1 && wallPlacementValid(wallAbove)) return [wallAbove,0];
    }
    else if(visionAnomalies.length===2) {
            let anomaly1X = parseInt(visionAnomalies[0][0]);
            let anomaly1Y = parseInt(visionAnomalies[0][1]);

            let anomaly2X = parseInt(visionAnomalies[1][0]);
            let anomaly2Y = parseInt(visionAnomalies[1][1]);

            if(anomaly1X===anomaly2X){

            }
            let wallAbove = ""+Math.min(anomaly1X,anomaly2X)+Math.max(anomaly1Y+1,anomaly2Y+1);
    }
    else console.log("Unexpected vision anomaly")
}

//initGame();
//getPossibleMoves("48", botGameState);

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

/*function initGame(){
    // fill the board with -1
    for (let i = 0; i < 9; i++) {
        botGameState.board.push([]);
        for (let j = 0; j < 9; j++) {
            botGameState.board[i].push(`${i+1}${j+1}`);
        }
    }
    botGameState.opponentWalls = [];
    botGameState.ownWalls = [];
}
function displayBoard(board) {
    for (let j = 8; j >= 0; j--) {
        let line = "";
        for (let i = 0; i < 9; i++) {
            line += board[i][j] + " ";
        }
        console.log(line);
    }
}

function displayBoardWall(board) {
    let line = "";
    for (let i = 0; i < board.length; i++) {
        if (i % 9 === 0) {
            console.log(line);
            line = "";
        }
        line += board[i] + " ";
    }
}

initGame();
displayBoard(botGameState.board);*/