import { extractWallInfo, findAdjacentWall, findAdjacentSpace, highlightElements, removeHighlight, updateNumberAction } from "../game_local_1v1/utils.js";
import {beginningPositionIsValid,getPossibleMoves} from "../game_local_1v1/movePlayerReferee.js";
import {removePlayerCircle, addPlayerCircle} from "./movePlayerUtils.js";
import {isWallPlacementValid,updateNumberWallsDisplay} from "../game_local_1v1/wallLayingUtils.js"
import {startNewRound, setUpNewRound} from "../game_local_1v1/roundUtils.js";
import {setVisionForPlayer} from "../game_local_1v1/fog_of_war.js";

let socket;

let currentPlayer = 1;
let nbWallsPlayer1 = 10;
let nbWallsPlayer2 = 10;
let actionsToDo = 1;

let lastActionType = "";

let numberTour = 1;

let victoryAnswer = "";

const playerPositions = {
    player1: null,
    player2: null
};

let lastPlayerPositions = {
    player1 : null,
    player2 : null
}

let board;
let possibleMoves=[];
document.addEventListener("DOMContentLoaded", main);


function main() {
    socket = io("/api/game");

    board = document.getElementById("grid");

    //On ajoute un event listener sur l'écran anti triche
    document.getElementById("popup-button").addEventListener("click",startNewRound);

    //On ajoute un event listener pour valider le round
    document.getElementById("button-validate-action").addEventListener("click",validateRound);

    //On ajoute un event listener pour undo l'action
    document.getElementById("button-undo-action").addEventListener("click",undoAction);

    initializeTable();

    //Mettre le brouillard de guerre
    setVisionForPlayer(currentPlayer,playerPositions);
    //On setup les différents textes nécessaires
    setUpNewRound(currentPlayer,nbWallsPlayer1,nbWallsPlayer2,numberTour);
}

/*
    * Fonction qui initialise le plateau de jeu
    * Elle va generer toute les cases du plateau, cellules, mur vertical et horizontal et les espace entre les murs
    *
    * Pour generer on utilise une boucle for qui va creer les elements et les ajouter au html,
    * precisement en fils de la balise avec l'id "grid"
    *
    * on ajoute au élement un event listener, c'est a dire une fonction qui sera executer quand on clique sur l'element
    * absolument tout est modifiable, on peut changer le type d'element, les classes, les id, les event listener, etc...
    *
 */
function initializeTable() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cellId = i + "-" + j;
            const cell = document.createElement("div");
            cell.id = cellId+"~cell";
            cell.classList.add("cell");
            cell.addEventListener("click", choosePositionToBegin);
            board.appendChild(cell);
            if(j !== 8) {
                const wallId = i + "-" + j + "~" + (i + 1) + "-" + j;
                const wall = document.createElement("div");
                wall.id = "wv~"+i+"-"+j;
                wall.classList.add("wall-vertical")
                board.appendChild(wall);
            }
        }
        if(i === 8) break;
        for (let j = 0; j < 9; j++) {
            const wallId = i + "-" + j + "~" + i + "-" + (j + 1);
            const wall = document.createElement("div");
            wall.id = "wh~"+i+"-"+j;
            wall.classList.add("wall-horizontal");
            const spaceId = i + "-" + j;
            const space = document.createElement("div");
            space.id = spaceId+"-space";
            space.classList.add("space");
            board.appendChild(wall);
            if(j !== 8) {
                board.appendChild(space);
            }
        }
    }
}

/** #############################################  ROUND METHODS  ############################################# **/

/**
 * Cette fonction est appelée à chaque fois qu'un utilisateur va valider un round
 * Quand on valide un round, on va sauvegarder les nouvelles positions des joueurs et on va lancer la pop up
 */
function validateRound() {
  
    // on envoie un message au serveur pour lui dire de valider le round
    socket.emit("validateRound");
    socket.on("numberTour", (numberTour) => {
        console.log("numberTour", numberTour);
        if (numberTour > 1) {
            possibleMoves.forEach(cell => {
                cell.classList.remove("possible-move");
            });
        }
        socket.off("numberTour");
    });
    socket.on("positionAI", (AIPosition, currentplayer,playerPosition) => {
        console.log("debug positionAI");
        console.log("newAIPosition", AIPosition, currentplayer, playerPosition);
        if (playerPosition["player2"] !== null){
            const htmlOldPosition=playerPosition["player2"][0]+"-"+playerPosition["player2"][1]+"~cell";
            console.log("htmlOldPosition", htmlOldPosition);
            removePlayerCircle(htmlOldPosition, currentplayer);
        }
        console.log("AIPosition", AIPosition);
        let circle_bot = document.getElementById(AIPosition);
        console.log("circle_bot", circle_bot);
        addPlayerCircle(circle_bot, currentplayer);
        socket.off("newAIPosition");
    });
    socket.on("gameOver", (winner) => {
        if (winner !== null) {
            document.getElementById("popup-ready-message").innerHTML = "Victoire du joueur " + winner + " !! Félicitations ! ";$
            document.getElementById("popup").style.display = 'flex';
            document.getElementById("popup-button").style.display = "none";
        }
        socket.off("gameOver");
    });
    socket.on("numberTourAfter", (numberTour) => {
        if (numberTour === 101) {
            document.getElementById("popup-ready-message").innerHTML = "Nombre de tours max atteints, égalité";
            document.getElementById("popup").style.display = 'flex';
            document.getElementById("popup-button").style.display = "none";
        }
        socket.off("numberTourAfter");
    });
    socket.on("updateRound", (possibleMoves, numberTour, playerPosition, currentPlayer, nbWallsPlayer1, nbWallsPlayer2) => {
        console.log("updateRound", numberTour, playerPosition, currentPlayer, nbWallsPlayer1, nbWallsPlayer2);
        setVisionForPlayer(currentPlayer, playerPosition);
        setUpNewRound(currentPlayer, nbWallsPlayer1, nbWallsPlayer2, numberTour);
        socket.off("updateBoard");
    });
}

/**
 * Fonction qui analyse si un joueur à fini une partie ou pas
 * @returns {boolean}
 */
function isGameOver(){
    socket.emit("isGameOver", null);
    socket.on("gameOver", function(isGameOver, numberWinner){
        if(isGameOver){
            if(numberWinner === 1) victoryAnswer = "Victoire du joueur 1 !! Félicitations ! ";
            else if(numberWinner === 2) victoryAnswer = "Victoire du joueur 2 !! Félicitations ! ";
            else victoryAnswer = "Egalité entre les deux joueurs !";
            return true;
        }
        socket.off("gameOver");
        return false;
    });
}

/** #############################################  WALL LAYING METHODS  ############################################# **/

/*
 fonction pour gerer le survol des murs
 */
function wallListener(event) {
    const firstWallToColor = event.target;
    firstWallToColor.classList.add("wall-hovered");

    // on parse les ID pour avoir les coordonnées des murs
    const wallId = firstWallToColor.id;
    const { wallType, wallPosition } = extractWallInfo(wallId);

    // la on va chercher les mur a colorier et l'espace entre les murs a colorier
    const secondWallToColor = findAdjacentWall(wallType, wallPosition);
    const spaceToColor = findAdjacentSpace(wallPosition);

    if (isWallPlacementValid(firstWallToColor, secondWallToColor, spaceToColor) === false) {
        removeHighlight(firstWallToColor, secondWallToColor, spaceToColor)
        return;
    }

    // on rajoute les classes pour colorier
    highlightElements(firstWallToColor, secondWallToColor, spaceToColor);

    firstWallToColor.addEventListener("mouseleave", () => {
        removeHighlight(firstWallToColor, secondWallToColor, spaceToColor);
    });
}

/**
 * EventListener qui se déclenche quand on va vouloir poser un mur
 * On va ajouter ce listener sur tous les murs qui sont posés
 */
function wallLaid(event) {
    //On va récupérer le premier mur
    const firstWallToColor = event.target;

    // on parse les ID pour avoir les coordonnées des murs
    const wallId = firstWallToColor.id;
    const { wallType, wallPosition } = extractWallInfo(wallId);

    // la on va chercher les mur a colorier et l'espace entre les murs a colorier
    const secondWallToColor = findAdjacentWall(wallType, wallPosition);
    const spaceToColor = findAdjacentSpace(wallPosition);

    if (isWallPlacementValid(firstWallToColor, secondWallToColor, spaceToColor) === false) {
        return;
    }

    /**
     * On vérifie si les joueurs possèdent bien le bon nombre de murs avant de les poser
     */
    if(actionsToDo>0 && ((currentPlayer===1 && nbWallsPlayer1>0) || (currentPlayer===2 && nbWallsPlayer2>0))) {
        secondWallToColor.classList.add("wall-laid","laidBy" + currentPlayer);
        secondWallToColor.removeEventListener("mouseenter",wallListener);
        secondWallToColor.removeEventListener("click",wallLaid);

        spaceToColor.classList.add("wall-laid","laidBy" + currentPlayer);

        firstWallToColor.classList.add("wall-laid","laidBy" + currentPlayer);
        firstWallToColor.removeEventListener("mouseenter",wallListener);
        firstWallToColor.removeEventListener("click",wallLaid);

        if (currentPlayer === 1) nbWallsPlayer1--;
        else nbWallsPlayer2--;

        showButtonVisible();
        //On sauvegarde la dernière action
        lastActionType = "wall " + firstWallToColor.id + " " + spaceToColor.id + " " + secondWallToColor.id;
        updateNumberWallsDisplay(currentPlayer,nbWallsPlayer1,nbWallsPlayer2);
    }
    else{
        alert("Insufficent number of actions and/or walls");
    }
}


/** #############################################  MOVE PLAYER METHODS  ############################################# **/

/**
 * Fonction qui gere le placement des pions la 1er fois :
 * Chaque joueur doit placer un pion sur la 1er ligne pour le joueur 1
 * et sur la derniere ligne pour le joueur 2 sinon on affiche un message d'erreur
 * et ensuite on change de listener pour le tour suivant car le comportement change
 *
 */
function choosePositionToBegin(event) {

    socket.emit("choosePositionToBegin", event.target.id);
    console.log("choosePositionToBegin", event.target.id);
    console.log("choosePositionToBegin");
    socket.on("beginningPositionIsValid", (res) => {
        console.log("beginningPositionIsValid");
        if (!res) {
            alert("Vous devez commencez par la première ligne");
            return;
        }
        socket.off("beginningPositionIsValid");
    });
    socket.on("checkAction", (res) => {
        if (res) {
            alert("Vous n'avez plus d'actions disponibles");
            return;
        }
        socket.off("checkAction");
    });
    event.target.classList.add("occupied");
    socket.on("currentPlayer", (currentPlayer, playerposition) => {
        console.log("currentPlayer");
        addPlayerCircle(event.target, currentPlayer);
        if (playerposition) {
            const cells = document.querySelectorAll(".cell");
            cells.forEach(cell => {
                cell.removeEventListener("click", choosePositionToBegin);
                cell.addEventListener("click", movePlayer);
            });
            const walls = document.querySelectorAll(".wall-vertical,.wall-horizontal");
            walls.forEach(wall => {
                wall.addEventListener("mouseenter", wallListener);
                wall.addEventListener("click", wallLaid);
            })
        }
        socket.off("currentPlayer");
    });
    showButtonVisible();
}
/*
    const clickedCell = event.target;
    console.log(clickedCell);
    if(!beginningPositionIsValid(currentPlayer,clickedCell.id[0])){
        alert("Vous devez commencez par la première ligne")
        return;
    }

    //On vérifie si le joueur possède assez d'actions
    if(actionsToDo===0){
        alert("Vous n'avez plus d'actions disponibles");
        return;
    }

    clickedCell.classList.add("occupied");
    playerPositions[`player${currentPlayer}`] = clickedCell.id;
    addPlayerCircle(clickedCell.id, currentPlayer);

    if (playerPositions.player1) {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.removeEventListener("click", choosePositionToBegin);
            cell.addEventListener("click", movePlayer);
        });

        const walls = document.querySelectorAll(".wall-vertical,.wall-horizontal");
        walls.forEach(wall=>{
            wall.addEventListener("mouseenter",wallListener);
            wall.addEventListener("click",wallLaid);
        })

    }
    //On enlève l'action réalisée au compteur
    showButtonVisible();
    //On sauvegarde la dernière action
    lastActionType = "position";
}
*/
function movePlayer(event) {
    const target = event.target;
    console.log(target);
    console.log(target.id);
    let cellId=target.id;
    // il faudra mettre des verif ici quand on aura extrait le graphe du plateau
    if(target.id.includes("circle")){
        alert("occupied");
        return;
    }
    else if(target.classList.contains("fog")){
        cellId=target.id.split("~")[1]+"~cell";
        console.log(cellId);
    }
    const clickedCell=document.getElementById(cellId);

    socket.emit("newMoveHumanIsPossible", clickedCell.id[2], clickedCell.id[0]);
    socket.on("isNewMoveHumanIsPossible", (isPossible, lastPosition, newPosition) => {
        if(isPossible){
            console.log("move valid");
            if(lastPosition!==null) removePlayerCircle(lastPosition, currentPlayer);
            console.log("allo");
            addPlayerCircle(target, 1);
            lastActionType = "position";
            showButtonVisible();
        }else{
            alert("Mouvement non autorisé");
        }
    });

    /*if (clickedCell.classList.contains("possible-move") && actionsToDo===1) {
        console.log("move valid");
        removePlayerCircle(playerPositions,currentPlayer);
        playerPositions[`player${currentPlayer}`] = clickedCell.id;
        addPlayerCircle(clickedCell,currentPlayer);
        showButtonVisible();
        //On sauvegarde la dernière action
        lastActionType = "position";
    }*/
}


/** #############################################  UNDO METHODS  ############################################# **/

/**
 * Cette fonction est appelée quand un joueur veut annuler l'action qu'il vient d'effectuer
 * On va donc regarder la variable lastActionType pour savoir qu'elle est la dernière action utilisée
 * Si la dernière action est la pose d'un mur, alors la variable ressemble à ceci : lastActionType = "wall "+firstWallToColor.id+" "+spaceToColor.id+" "+secondWallToColor.id;
 * Si la dernière action est la mouvement d'un pion, alors on va regarder dans les données sauvegardées au début du tour pour replacer le pion correctement
 */
function undoAction(){
    //On remet le nombre d'actions à 1
    actionsToDo=1;
    updateNumberAction(1);

    //On re-cache les boutons
    document.getElementById("button-validate-action").style.display = "none";
    document.getElementById("button-undo-action").style.display = "none";

    //On vérifie si la dernière action est un mouvement de pion
    if(lastActionType === "position"){
        document.getElementById(playerPositions["player"+currentPlayer]).innerHTML = "";
        document.getElementById(playerPositions["player"+currentPlayer]).classList.remove("occupied");
        playerPositions["player"+currentPlayer] = lastPlayerPositions["player"+currentPlayer];
        if(numberTour===1){
            const cells = document.querySelectorAll(".cell");
            cells.forEach(cell => {
                cell.removeEventListener("click", movePlayer);
                cell.addEventListener("click", choosePositionToBegin);
            });

            const walls = document.querySelectorAll(".wall-vertical,.wall-horizontal");
            walls.forEach(wall=>{
                wall.removeEventListener("mouseenter",wallListener);
                wall.removeEventListener("click",wallLaid);
            })

        }else{ //Si on est pas dans le premier tour
            addPlayerCircle(document.getElementById(lastPlayerPositions["player"+currentPlayer]),currentPlayer);
        }
    }else{ //Si la dernière action la placement d'un mur
        if(currentPlayer === 1) nbWallsPlayer1++;
        else nbWallsPlayer2++;

        //On parle la string pour récupérer les id des 3 murs que l'on va devoir remettre en "normal"
        undoLayingWall(lastActionType.split(" "));

        //On update la phrase affichée sur le site
        updateNumberWallsDisplay(currentPlayer,nbWallsPlayer1,nbWallsPlayer2);
    }
}

function undoLayingWall(wall){
    let firstWall=document.getElementById(wall[1]);
    let space=document.getElementById(wall[2]);
    let secondWall=document.getElementById(wall[3]);

    //Remove classes used for coloring
    firstWall.classList.remove("wall-laid","laidBy"+currentPlayer);
    space.classList.remove("wall-laid","laidBy"+currentPlayer);
    secondWall.classList.remove("wall-laid","laidBy"+currentPlayer);

    //Add back eventListeners
    firstWall.addEventListener("mouseenter",wallListener);
    firstWall.addEventListener("click",wallLaid);

    secondWall.addEventListener("mouseenter",wallListener);
    secondWall.addEventListener("click",wallLaid);
}



/**UTILS **/
function showButtonVisible(){
    document.getElementById("button-validate-action").style.display = "flex";
    document.getElementById("button-undo-action").style.display = "flex";
}
