
let gameStates = {
    // a list containing each of your opponent's walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    opponentWalls: [],
    // a list containing each of your walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    ownWalls: [],
    //a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1) as defined in the rules. The value for each cell can be : -1 if you do not see the cell, 0 if you see the cell but it is empty, 1 if you are in the cell, 2 if your opponent is in the cell
    board: [],
}


let Move = {
    action: "",
    value: ""
}

function setup(AIplay){
    console.log("AIPLAY");
    //return a Promise that is resolved into a position string
    //The position string is composed of 2 digits representing a cell exactly as stated in the rules.
}

function nextMove(gameState){
    console.log("gameState");
    //return a Promise that is resolved into a move object representing your AI's next move.
    //The move object has the following properties:
        //action: "move", "wall", or "idle" (note that "idle" can only be used when no legal action can be performed)
        //value (only if the action is not "idle"):
            // for the "move" action: a position string
            // for the "wall" action: a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical.
}

function correction(rightMove){
    console.log("rightMove");
    //return a Promise that is resolved into the boolean true, indicating it is ready to continue
}

function updateBoard(gameState){
    console.log("updateBoard");
    //return a Promise resolved into the boolean true in 50ms maximum.
}

/*-----------fonction non utile pour le jeu mais pour l'affichage du plateau-----------*/

function initGame(){
    // fill the board with -1
    for (let i = 0; i < 9; i++) {
        gameStates.board.push([]);
        for (let j = 0; j < 9; j++) {
            gameStates.board[i].push(0);
        }
    }
    gameStates.opponentWalls = [];
    gameStates.ownWalls = [];
}
function displayBoard() {
    const symbols = {
        "-1": "?", // Case non visible
        "0": ".", // Case vide
        "1": "X", // Votre position
        "2": "O", // Position de l'adversaire
    };

    // Affichage des numéros de colonnes
    let header = "  ";
    for (let i = 1; i <= 9; i++) {
        header += `${i} `;
    }
    console.log(header);

    // Affichage des lignes du plateau
    for (let i = 0; i < 9; i++) {
        let row = `${i + 1} `;
        for (let j = 0; j < 9; j++) {
            row += symbols[gameStates.board[i][j]] + " ";
        }
        console.log(row);
    }
}

initGame();
displayBoard();