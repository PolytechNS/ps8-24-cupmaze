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


let monChiffre;
let nombreWallMoi = 10;
let nombreWallAdversaire = 10;

let tourActuel = 1;

let trackerAdversaire = "";


let onAPoseUnMur = false;
let coordoneesDernierMur = ""



let positionPotentiellesDuBot = [];


function setup(AIplay){
    monChiffre = AIplay;
    tourActuel++;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(AIplay === 1){
                //Dans le cas où on commence en bas du plateau
                resolve("81");
            }else{
                resolve("89");
            }
        }, 1000); // Resolving within 1000ms
    });
}

function nextMove(gameState){

    /*
    gameState.board
    gameState.opponentWalls
    gameState.ownWalls
     */

    const move = {
        action: "",
        value: ""
    }

    /*
    HYPOTHESE : ICI ON NE POSE QUE DES MURS HORIZONTAUX
    ON PART EGALEMENT DU PRINCIPE QUE DANS LES IA POUR AVOIR 10/20, LE BOT NE VA JAMAIS POSE UN MUR DANS SON PROPRE CAMP
     */


    let derniereActionJoueur;
    if(10 - gameState.opponentWalls.length !== nombreWallAdversaire){
        nombreWallAdversaire = 10 - gameState.opponentWalls.length;
        derniereActionJoueur = "wall";
    }


    return new Promise((resolve, reject) => {
        if(isPlayerVisible(gameState.board)[0] || (derniereActionJoueur === "wall" && trackerAdversaire !== "")){
            //call arnaud method
        }else if(nombreWallMoi > 0){
            if(monChiffre === 1) {
                if(trackerAdversaire !== ""){
                    move.action = "wall";
                    let positionMur = trackerAdversaire[0] + (parseInt(trackerAdversaire[1]) - 1).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    resolve(move);
                } else if(tourActuel === 2) { //Au tour numéro deux on pose un mur en haut à droite de la grille pour couvrir une première moitié
                    move.action = "wall";
                    move.value = ["78", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "78";
                    nombreWallMoi--;
                    resolve(move);
                } else if (tourActuel === 3) { //Au tour numéro trois on pose un mur en haut à gauche pour couvrir l'autre moitié
                    move.action = "wall";
                    move.value = ["28", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "28";
                    nombreWallMoi--;
                    resolve(move);
                }else if(positionPotentiellesDuBot.length > 0){
                    move.action = "wall";
                    let positionMur = positionPotentiellesDuBot[0][0] + (parseInt(positionPotentiellesDuBot[0][1]) - 1).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    resolve(move);
                } else {
                    //TODO : ALLER TOUT DROIT, SI NOTRE BOT BUG AU MOINS ON A UNE SOLUTION DE SECOURS
                }
            } else if (monChiffre === 2){
                if(trackerAdversaire !== ""){
                    move.action = "wall";
                    let positionMur = trackerAdversaire[0] + (parseInt(trackerAdversaire[1]) + 1).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    resolve(move);
                } else if(tourActuel === 2){
                    move.action = "wall";
                    move.value = ["73", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "73";
                    nombreWallMoi--;
                    resolve(move);
                } else if(tourActuel === 3) {
                    move.action = "wall";
                    move.value = ["23", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "23";
                    nombreWallMoi--;
                    resolve(move);
                }else if(positionPotentiellesDuBot.length > 0){
                    move.action = "wall";
                    let positionMur = positionPotentiellesDuBot[0][0] + (parseInt(positionPotentiellesDuBot[0][1]) + 1).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    resolve(move);
                } else {
                    //TODO : ALLER TOUT DROIT, SI NOTRE BOT BUG AU MOINS ON A UNE SOLUTION DE SECOURS
                }
            }
        }else{
            // TODO : ALLER DE LAVANT SI ON PEUT OU ALORS SUR ON COTE POUR EVITER UN MUR @arnaud jsp tu vas implémenter ça
        }
    },200);
}


//Fonction qui check si on voit le joueur au début du tour, dans le but d'appeller la fonction d'Arnaud
function isPlayerVisible(board){
    if(monChiffre === 1){
        for(let y = 8; y >= 0; y--){
            for(let x = 0; x <= 8; x++){
                if(board[y][x] === 2){
                    return [true, x, y];
                }
            }
        }
        return [false, null, null];
    } else {
        for(let y = 0; y <= 8; y++){
            for(let x = 0; x <= 8; x++){
                if(board[y][x] === 2){
                    return [true, x, y];
                }
            }
        }
        return [false, null, null];
    }
}

function correction(rightMove){
    //return a Promise that is resolved into the boolean true, indicating it is ready to continue
}

function updateBoard(gameState){
    //return a Promise resolved into the boolean true in 50ms maximum.
    if(isPlayerVisible(gameState.board)[0]){
        trackerAdversaire = isPlayerVisible(gameState.board)[1].toString() + isPlayerVisible(gameState.board)[2].toString();
        positionPotentiellesDuBot = [];
        positionPotentiellesDuBot.push(trackerAdversaire);
    } else {
        if(onAPoseUnMur){
            let answer = isPlayerDetectedByOurWall(parseInt(coordoneesDernierMur[0]), parseInt(coordoneesDernierMur[1]), gameState.board);
            if(answer[0]){
                trackerAdversaire = answer[1];
            }else{
                positionPotentiellesDuBot.push(answer[1]);
                positionPotentiellesDuBot.push(answer[2]);
            }
        }
    }
    onAPoseUnMur = false;
    tourActuel++;

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true); // Resolve the promise with true
        }); // Resolve within 50ms
    });
}



function isPlayerDetectedByOurWall(positionMurX, positionMurY, board){
    let xToTest;
    let yToTest;

    //Premier case que l'on test
    xToTest = positionMurX;
    yToTest = positionMurY + 1;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest + 1;

            let xPotentiel2 = xToTest-1;
            let yPotentiel2 = yToTest;

            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }

    //Deuxième case que l'on test
    xToTest = positionMurX+1;
    yToTest = positionMurY+1;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest +1;

            let xPotentiel2 = xToTest+1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }

    //Troisième case que l'on test
    xToTest = positionMurX+2;
    yToTest = positionMurY;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest +1;

            let xPotentiel2 = xToTest+1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }

    //Quatrième case que l'on test
    xToTest = positionMurX+2;
    yToTest = positionMurY-1;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest -1;

            let xPotentiel2 = xToTest+1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }

    //Cinquième case que l'on test
    xToTest = positionMurX+1;
    yToTest = positionMurY-2;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest+1;
            let yPotentiel1 = yToTest;

            let xPotentiel2 = xToTest;
            let yPotentiel2 = yToTest-1;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }

    //Sixième case que l'on test
    xToTest = positionMurX;
    yToTest = positionMurY-2;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest-1;
            let yPotentiel1 = yToTest;

            let xPotentiel2 = xToTest;
            let yPotentiel2 = yToTest-1;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }

    //Septième case que l'on test
    xToTest = positionMurX-1;
    yToTest = positionMurY-1;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest-1;

            let xPotentiel2 = xToTest-1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }

    //Huitième case que l'on test
    //Septième case que l'on test
    xToTest = positionMurX-1;
    yToTest = positionMurY;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest+1;

            let xPotentiel2 = xToTest-1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }
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