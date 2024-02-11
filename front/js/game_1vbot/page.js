import { extractWallInfo, highlightElements, removeHighlight} from "../game_local_1v1/utils.js";
import {beginningPositionIsValid} from "../game_local_1v1/movePlayerReferee.js";
import {removePlayerCircle, addPlayerCircle} from "./movePlayerUtils.js";
import {updateNumberWallsDisplay} from "../game_local_1v1/wallLayingUtils.js"
import {startNewRound, setUpNewRound} from "../game_local_1v1/roundUtils.js";
import {setVisionForPlayer} from "../game_local_1v1/fog_of_war.js";

let socket;
let lastActionType = "";
let victoryAnswer = "";
let board;
let possibleMoves=[];
const intent = window.location.search.split("=")[1];
console.log(intent);
document.addEventListener("DOMContentLoaded", main(intent));



function main(isLoadGame) {
    socket = io("/api/game");

    board = document.getElementById("grid");

    //On ajoute un event listener sur l'écran anti triche
    document.getElementById("popup-button").addEventListener("click",startNewRound);

    //On ajoute un event listener pour valider le round
    document.getElementById("button-validate-action").addEventListener("click",validateRound);

    //On ajoute un event listener pour undo l'action
    document.getElementById("button-undo-action").addEventListener("click",undoAction);

    //On ajoute un event listener pour enregistrer une partie
    document.getElementById("button-save-game").addEventListener("click",saveGame);

    if(isLoadGame){
        let username = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
        socket.emit("retrieveGame",username);
        socket.on("launchSavedGame",(msg)=>{
            if(msg!==true)alert("sorry no game found");
            else alert("retrieving game");
            socket.emit("loadGame");
        })
        socket.on("data",(data)=>{
            console.log(data);
            let dataObject=JSON.parse(JSON.stringify(data));
            console.log(dataObject);
            initializeLoadTable(dataObject);
            //Mettre le brouillard de guerre
            setVisionForPlayer(dataObject.currentPlayer,dataObject.playerPosition);
            //On setup les différents textes nécessaires
            setUpNewRound(dataObject.currentPlayer,dataObject.nbWallsPlayer1,dataObject.nbWallsPlayer2,dataObject.numberTour);
            socket.off("data");
        })
    }
    else{
        initializeTable();
        //Mettre le brouillard de guerre
        //Mettre le brouillard de guerre
        setVisionForPlayer(1, {player1: null, player2: null});
        //On setup les différents textes nécessaires
        setUpNewRound(1,10,10,1);
    }
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

function initializeLoadTable(data) {
    data.elements.forEach((element)=>{
        let i=element.pos_x;
        let j=element.pos_y;
        switch (getNatureOfElement(element)){
            case "case":
                const cellId = i + "-" + j;
                const cell = document.createElement("div");
                cell.id = cellId+"~cell";
                cell.classList.add("cell");
                cell.addEventListener("click", choosePositionToBegin);
                board.appendChild(cell);
                if(element.isOccupied===true) cell.classList.add("occupied");
                console.log(element);
                break;
            case "wall":
                if(element.inclinaison==="vertical") {
                    const wall = document.createElement("div");
                    wall.id = "wv~" + i + "-" + j;
                    wall.classList.add("wall-vertical")
                    board.appendChild(wall);
                    if(element.isLaid) wall.classList.add("wall-laid");
                    console.log(element);
                }
                else{
                    const wall = document.createElement("div");
                    wall.id = "wh~" + i + "-" + j;
                    wall.classList.add("wall-horizontal");
                    board.appendChild(wall);
                    if(element.isLaid) wall.classList.add("wall-laid");
                    console.log(element);
                }
                break;
            case "space":
                const spaceId = i + "-" + j;
                const space = document.createElement("div");
                space.id = spaceId+"-space";
                space.classList.add("space");
                board.appendChild(space);
                if(element.isLaid) space.classList.add("wall-laid");
                console.log(element);
                break;
            default:
                console.log("Unexpected Element");
        }
    })
}

function getNatureOfElement(element){
    if(element.isOccupied!==null) return "case";
    if(element.isLaid!=null){
        if (element.inclinaison!==null) return "wall";
        return "space";
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
    console.log("validateRound");
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
        socket.off("positionAI");
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

function saveGame() {
    let userEmail="";

    // Récupérer tous les cookies
    const cookies = document.cookie;

    // Diviser les cookies en tableau de paires clé-valeur
    const cookieArray = cookies.split('; ');

    // Parcourir chaque paire clé-valeur pour obtenir les informations souhaitées
    cookieArray.forEach(cookie => {
        const [key, value] = cookie.split('=');
        if(key==='Nameaccount') userEmail=value;
        console.log(`Clé: ${key}, Valeur: ${value}`);
    });
    if(userEmail!=="") {
        console.log("Saving game for "+userEmail);
        socket.emit("saveGame",userEmail);
        socket.on("goBackToMenu",(isWentWell)=>{
            if(isWentWell!==true){
                alert("Sth went wrong");
            }
            else{
                alert("Partie sauvegardée avec succès !");
                window.location.href = "http://localhost:8000/mainMenu.html";
                socket.off("goBackToMenu");
            }
        });
    }
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

    socket.emit("wallListener", firstWallToColor, wallType, wallPosition);
    socket.on("highlightElements",(adjacentWall, space, adjacentWallId, adjacentSpaceId) => {
        if (adjacentWall === null ) {
            console.log("adjacentWall is null");
            removeHighlight(firstWallToColor, adjacentWall, space)
            return;
        }
        const wallToColor = document.getElementById(adjacentWallId);
        const spaceToColor = document.getElementById(adjacentSpaceId);
        highlightElements(firstWallToColor, wallToColor, spaceToColor);
        firstWallToColor.addEventListener("mouseleave", () => {
            removeHighlight(firstWallToColor, wallToColor, spaceToColor);
        });
        socket.off("highlightElements");
    });
    /*
    const firstWallToColor = event.target;
    firstWallToColor.classList.add("wall-hovered");

    // on parse les ID pour avoir les coordonnées des murs
    const wallId = firstWallToColor.id;
    const { wallType, wallPosition } = extractWallInfo(wallId);
    console.log("wallType", wallType);

    socket.emit("wallListener", firstWallToColor, wallType, wallPosition);
    socket.on("highlightElements",(adjacentWall, space, adjacentWallId, adjacentSpaceId) => {
        console.log("highlightElements", adjacentWallId, adjacentSpaceId);
        console.log("spaceId", adjacentSpaceId);
        console.log("wallId", adjacentWallId);
        const wallToColor = document.getElementById(adjacentWallId);
        console.log("wall", wallToColor);
        const spaceToColor = document.getElementById(adjacentSpaceId);
        console.log("space", spaceToColor);
        highlightElements(firstWallToColor, wallToColor, spaceToColor);
        firstWallToColor.addEventListener("mouseleave", () => {
            removeHighlight(firstWallToColor, wallToColor, spaceToColor);
        });
        socket.off("highlightElements");
    });
    /*
    // la on va chercher les mur a colorier et l'espace entre les murs a colorier
    //const secondWallToColor = findAdjacentWall(wallType, wallPosition);
    //const spaceToColor = findAdjacentSpace(wallPosition);

    if (isWallPlacementValid(firstWallToColor, secondWallToColor, spaceToColor) === false) {
        removeHighlight(firstWallToColor, secondWallToColor, spaceToColor)
        return;
    }

    // on rajoute les classes pour colorier
    highlightElements(firstWallToColor, secondWallToColor, spaceToColor);

    firstWallToColor.addEventListener("mouseleave", () => {
        removeHighlight(firstWallToColor, secondWallToColor, spaceToColor);
    });
     */
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

    socket.emit("wallLaid", firstWallToColor, wallType, wallPosition, wallId);
    socket.on("laidWall", (secondWallToColor, spaceToColor, currentPlayer, nbWallsPlayer1, nbWallsPlayer2) => {
        if (secondWallToColor === null) {
            return;
        }
        const htmlSecondWallToColor = document.getElementById(secondWallToColor);
        const htmlSpaceToColor = document.getElementById(spaceToColor);
        htmlSecondWallToColor.classList.add("wall-laid", "laidBy" + currentPlayer);
        htmlSecondWallToColor.removeEventListener("mouseenter", wallListener);
        htmlSecondWallToColor.removeEventListener("click", wallLaid);

        htmlSpaceToColor.classList.add("wall-laid", "laidBy" + currentPlayer);

        firstWallToColor.classList.add("wall-laid", "laidBy" + currentPlayer);
        firstWallToColor.removeEventListener("mouseenter", wallListener);
        firstWallToColor.removeEventListener("click", wallLaid);
        showButtonVisible();
        updateNumberWallsDisplay(currentPlayer, nbWallsPlayer1, nbWallsPlayer2);
        socket.off("laidWall");
        lastActionType="wall";
    });
    /*
    // la on va chercher les mur a colorier et l'espace entre les murs a colorier
    const secondWallToColor = findAdjacentWall(wallType, wallPosition);
    const spaceToColor = findAdjacentSpace(wallPosition);

    if (isWallPlacementValid(firstWallToColor, secondWallToColor, spaceToColor) === false) {
        return;
    }

    /**
     * On vérifie si les joueurs possèdent bien le bon nombre de murs avant de les poser

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
    */
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
            if(lastPosition!==null) removePlayerCircle(lastPosition, 1);
            console.log("allo");
            addPlayerCircle(target, 1);
            lastActionType = "position";
            showButtonVisible();
        }else{
            alert("Mouvement non autorisé");
        }
        socket.off("isNewMoveHumanIsPossible");
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
