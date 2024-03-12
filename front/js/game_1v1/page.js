import {beginningPositionIsValid} from "../game_local_1v1/movePlayerReferee.js";
import {removePlayerCircle, addPlayerCircle} from "../game_1vbot/movePlayerUtils.js";
import {updateNumberWallsDisplay} from "../game_local_1v1/wallLayingUtils.js"
import {startNewRound, setUpNewRound} from "../game_local_1v1/roundUtils.js";
import {setVisionForPlayer} from "../game_local_1v1/fog_of_war.js";
import {getCookie} from "./waiting_room.js";


let socket;
let lastActionType = "";
let victoryAnswer = "";
let board;
let possibleMoves=[];
document.addEventListener("DOMContentLoaded", main,false);

let gameInformation;
function searchToObject() {
    gameInformation = {
        'roomName': localStorage.getItem('room'),
        'opponent': localStorage.getItem('opponent'),
        'opponentId': localStorage.getItem('opponentId'),
    }
}


function main() {
    socket = io("/api/waitingRoom");
    searchToObject();
    console.log("gameInformation", gameInformation);
    socket.emit("setupGame", getCookie("jwt"));
    socket.emit("joinRoom", gameInformation.roomName);

    board = document.getElementById("grid");

    //On ajoute un event listener sur l'écran anti triche
    document.getElementById("popup-button").addEventListener("click",startNewRound);

    //On ajoute un event listener pour valider le round
    document.getElementById("button-validate-action").addEventListener("click",validateRound);

    //On ajoute un event listener pour undo l'action
    document.getElementById("button-undo-action").addEventListener("click",undoAction);

    initializeTable();
    //Mettre le brouillard de guerre
    //Mettre le brouillard de guerre
    //setVisionForPlayer(1, {player1: null, player2: null});
    //On setup les différents textes nécessaires
    //setUpNewRound(1,10,10,1);
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
            const cellId = (j+1) + "-" + (9-i);
            const cell = document.createElement("div");
            cell.id = cellId+"~cell";
            cell.classList.add("cell");
            cell.addEventListener("click", choosePositionToBegin);
            board.appendChild(cell);
            if(j !== 8) {
                const wall = document.createElement("div");
                wall.id = "wv~"+(j+1)+"-"+(9-i);
                wall.classList.add("wall-vertical")
                board.appendChild(wall);
            }
        }
        if(i === 8) break;
        for (let j = 0; j < 9; j++) {
            const wall = document.createElement("div");
            wall.id = "wh~"+(j+1)+"-"+(9-i);
            wall.classList.add("wall-horizontal");
            const spaceId = (j+1)+"-"+(9-i);
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

    isGameOver();
    // on envoie un message au serveur pour lui dire de valider le round
    socket.emit("validateRound");

    socket.on("numberTour", (numberTour) => {
        if (numberTour > 1) {
            possibleMoves.forEach(cell => {
                cell.classList.remove("possible-move");
            });
        }
        socket.off("numberTour");
    });
    socket.on("positionOpp", (OpponentPosition, currentplayer,playerPosition) => {
        if (playerPosition["player2"] !== null){
            const htmlOldPosition=playerPosition["player2"][0]+"-"+playerPosition["player2"][1]+"~cell";
            console.log("htmlOldPosition", htmlOldPosition);
            removePlayerCircle(htmlOldPosition, currentplayer);
        }
        console.log("OpponentPosition", OpponentPosition);
        let circle_opp = document.getElementById(OpponentPosition);
        console.log("circle_opp", circle_opp);
        addPlayerCircle(circle_opp, currentplayer);
        socket.off("positionOpp");
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
        //setVisionForPlayer(currentPlayer, playerPosition);
        //setUpNewRound(currentPlayer, nbWallsPlayer1, nbWallsPlayer2, numberTour);
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
            if(numberWinner === 1) {
                victoryAnswer = "Victoire du joueur 1 !! Félicitations ! ";
                alert(victoryAnswer);
            } else if(numberWinner === 2) {
                victoryAnswer = "Victoire du joueur 2 !! Félicitations ! ";
                alert(victoryAnswer);
            }
            return true;
        }
        socket.off("gameOver");
        return false;
    });
}

/** #############################################  WALL LAYING METHODS  ############################################# **/

function extractWallInfo(wallId) {
    const wallType = wallId.split("~")[0];
    const wallPosition = wallId.split("~")[1];
    return { wallType, wallPosition };
}

function findAdjacentWall(wallType, wallPosition) {
    const colonne = parseInt(wallPosition.split("-")[0]);
    const ligne = parseInt(wallPosition.split("-")[1]);

    if (wallType === "wv" && colonne < 9) {
        return  document.getElementById(`wv~${colonne}-${ligne-1}`);
    } else if (wallType === "wh" && ligne < 9) {
        return document.getElementById(`wh~${colonne+1}-${ligne}`);
    } else {
        if (wallType === "wv") {
            return document.getElementById(`wv~${colonne}-${ligne}`);
        }
        return document.getElementById(`wh~${colonne+1}-${ligne}`);
    }
}

function findAdjacentSpace(wallPosition) {
    const colonne = parseInt(wallPosition.split("-")[0]);
    const ligne = parseInt(wallPosition.split("-")[1]);

    var space = `${colonne}-${ligne}-space`;
    if (colonne < 9  && ligne <= 9) {
        console.log("space", space);
        return document.getElementById(space);
    } else {
        if (ligne === 9) {
            console.log("space", `${colonne-1}-${ligne}-space`);
            return document.getElementById(`${colonne}-${ligne-1}-space`);
        } else {
            console.log("space", `${colonne}-${ligne-1}-space`);
            return document.getElementById(`${colonne-1}-${ligne}-space`);
        }
    }
}

function isWallPlacementValid(firstWall, secondWall, space) {
    const isLaid = firstWall.classList.contains("wall-laid") || secondWall.classList.contains("wall-laid") || space.classList.contains("wall-laid");
    return !isLaid;
}

function highlightElements(firstWall, secondWall, space) {
    secondWall.classList.add("wall-hovered");
    space.classList.add("space-hovered");
}

function removeHighlight(firstWall, secondWall, space) {
    firstWall.classList.remove("wall-hovered");
    secondWall.classList.remove("wall-hovered");
    space.classList.remove("space-hovered");
}
/*
 fonction pour gerer le survol des murs
 */
function wallListener(event) {

    const firstWallToColor = event.target;

    // on parse les ID pour avoir les coordonnées des murs
    const wallId = firstWallToColor.id;
    const { wallType, wallPosition } = extractWallInfo(wallId);
    console.log(wallType, wallPosition);
    if (wallPosition[0] === "9" || wallPosition[2] === "1") {
        return;
    }
    firstWallToColor.classList.add("wall-hovered");

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
    const adjacentWall = findAdjacentWall(wallType, wallPosition);
    const adjacentSpace = findAdjacentSpace(wallPosition);

    if(isWallPlacementValid(firstWallToColor, adjacentWall, adjacentSpace) === false) {
        return;
    }

    socket.emit("wallLaid", firstWallToColor, wallType, wallPosition, wallId);
    socket.on("laidWall", (currentPlayer, nbWallsPlayer1, nbWallsPlayer2) => {
        if (currentPlayer === null) {
            alert("Vous n'avez plus d'actions disponibles");
            return;
        }
        adjacentWall.classList.add("wall-laid", "laidBy" + currentPlayer);
        adjacentWall.removeEventListener("mouseenter", wallListener);
        adjacentWall.removeEventListener("click", wallLaid);

        adjacentSpace.classList.add("wall-laid", "laidBy" + currentPlayer);

        firstWallToColor.classList.add("wall-laid", "laidBy" + currentPlayer);
        firstWallToColor.removeEventListener("mouseenter", wallListener);
        firstWallToColor.removeEventListener("click", wallLaid);
        showButtonVisible();
        updateNumberWallsDisplay(currentPlayer, nbWallsPlayer1, nbWallsPlayer2);
        socket.off("laidWall");
        lastActionType="wall";
    });
}

/** #############################################  MOVE PLAYER METHODS  ############################################# **/

/**
 * Fonction qui gere le placement des pions la 1er fois :
 * Chaque joueur doit placer un pion sur la 1er ligne pour le joueur 1
 * et sur la derniere ligne pour le joueur 2 sinon on affiche un message d'erreur
 * et ensuite on change de listener pour le tour suivant car le comportement change
 */
function choosePositionToBegin(event) {
    socket.emit("choosePositionToBegin", event.target.id);
    socket.on("beginningPositionIsValid", (res) => {
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
        lastActionType = "position";
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

    socket.emit("newMoveHumanIsPossible", clickedCell.id);
    socket.on("isNewMoveHumanIsPossible", (isPossible, lastPosition) => {
        if (isPossible) {
            console.log("move valid");
            if(lastPosition!==null) removePlayerCircle(lastPosition, 1);
            addPlayerCircle(target, 1);
            lastActionType = "position";
            showButtonVisible();
        }else{
            alert("Mouvement non autorisé");
        }
        socket.off("isNewMoveHumanIsPossible");
    });
}


/** #############################################  UNDO METHODS  ############################################# **/

/**
 * Cette fonction est appelée quand un joueur veut annuler l'action qu'il vient d'effectuer
 * On va donc regarder la variable lastActionType pour savoir qu'elle est la dernière action utilisée
 * Si la dernière action est la pose d'un mur, alors la variable ressemble à ceci : lastActionType = "wall "+firstWallToColor.id+" "+spaceToColor.id+" "+secondWallToColor.id;
 * Si la dernière action est la mouvement d'un pion, alors on va regarder dans les données sauvegardées au début du tour pour replacer le pion correctement
 */
function undoAction(){
    //On re-cache les boutons
    document.getElementById("button-validate-action").style.display = "none";
    document.getElementById("button-undo-action").style.display = "none";
    //On re-donne la possiblité de sauvegarder
    document.getElementById("button-save-game").style.display = "flex";

    //On vérifie si la dernière action est un mouvement de pion
    if(lastActionType === "position"){
        socket.emit("undoMovePosition");
        socket.on("undoMove", (oldPosition, newPosition, currentPlayer, numberTourGame) => {
            console.log("undoMove", oldPosition, newPosition, currentPlayer, numberTourGame);
            removePlayerCircle(oldPosition, currentPlayer);
            if(newPosition!==""){
                let cell = document.getElementById(newPosition);
                addPlayerCircle(cell, currentPlayer);
            }
            if(numberTourGame===1){
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

            }
            socket.off("undoMove");
        });

    }else{ //Si la dernière action la placement d'un mur
        socket.emit("undoWall");
        socket.on("idWallToUndo", (tabIDHTML, player, numberWall) => {
            document.getElementById(tabIDHTML[0]).classList.remove("wall-laid","laidBy"+player);
            document.getElementById(tabIDHTML[0]).addEventListener("mouseenter",wallListener);
            document.getElementById(tabIDHTML[0]).addEventListener("click",wallLaid);
            document.getElementById(tabIDHTML[1]).classList.remove("wall-laid","laidBy"+player);
            document.getElementById(tabIDHTML[1]).addEventListener("mouseenter",wallListener);
            document.getElementById(tabIDHTML[1]).addEventListener("click",wallLaid);
            document.getElementById(tabIDHTML[2]).classList.remove("wall-laid","laidBy"+player);
            updateNumberWallsDisplay(1, numberWall, null)
            socket.off("undoLayingWall");
        });
    }
}
/**UTILS **/
function showButtonVisible(){
    document.getElementById("button-validate-action").style.display = "flex";
    document.getElementById("button-undo-action").style.display = "flex";
    document.getElementById("button-save-game").style.display = "none";
}
