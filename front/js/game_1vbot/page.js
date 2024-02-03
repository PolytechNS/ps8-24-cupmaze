import { extractWallInfo, findAdjacentWall, findAdjacentSpace, highlightElements, removeHighlight } from "../game_local_1v1/utils.js";
import {beginningPositionIsValid,moveIsValid} from "../game_local_1v1/movePlayerReferee.js";
import {setVisionForPlayer} from "../game_local_1v1/fog_of_war.js";

import {movePlayer, addPlayerCircle} from "../game_local_1v1/movePlayerUtils.js";
import {computeMove} from "./ai.js";

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
let board_Info;

document.addEventListener("DOMContentLoaded", main);


function main() {
    //On initialise le socket quand la partie commence
    socket = io();

    board = document.getElementById("grid");

    //On ajoute un event listener sur l'écran anti triche
    document.getElementById("popup-button").addEventListener("click",startNewRound);

    //On ajoute un event listener pour valider le round
    document.getElementById("button-validate-action").addEventListener("click",validateRound);

    //On ajoute un event listener pour undo l'action
    document.getElementById("button-undo-action").addEventListener("click",undoAction);

    board_Info = initializeTable();

    //Mettre le brouillard de guerre
    setVisionForPlayer(currentPlayer,playerPositions);

    //On setup les différents textes nécessaires
    setUpNewRound();
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
    const boardInfo = [];

    for (let i = 0; i < 9; i++) {
        const row = [];
        for (let j = 0; j < 9; j++) {
            const cellId = i + "-" + j;
            row.push({type: "cell", id: cellId});

            const cell = document.createElement("div");

            cell.id = cellId+"~cell";
            cell.classList.add("cell");
            cell.addEventListener("click", choosePositionToBegin);
            board.appendChild(cell);
            if(j !== 8) {
                const wallId = i + "-" + j + "~" + (i + 1) + "-" + j;
                row.push({type: "wall-vertical", id: wallId});

                const wall = document.createElement("div");
                wall.id = "wv~"+i+"-"+j;
                wall.classList.add("wall-vertical")
                board.appendChild(wall);
            }
        }
        if (i === 8) {
            boardInfo.push(row);
            break;
        }
        for (let j = 0; j < 9; j++) {
            const wallId = i + "-" + j + "~" + i + "-" + (j + 1);
            row.push({type: "wall-horizontal", id: wallId});

            const wall = document.createElement("div");
            wall.id = "wh~"+i+"-"+j;
            wall.classList.add("wall-horizontal");

            const spaceId = i + "-" + j;
            row.push({type: "space", id: spaceId});

            const space = document.createElement("div");
            space.id = spaceId+"-space";
            space.classList.add("space");
            board.appendChild(wall);
            if(j !== 8) {
                board.appendChild(space);
            }
        }
        boardInfo.push(row);
    }
    return boardInfo;
}

/**
 * Fonction qui gere le placement des pions la 1er fois :
 * Chaque joueur doit placer un pion sur la 1er ligne pour le joueur 1
 * et sur la derniere ligne pour le joueur 2 sinon on affiche un message d'erreur
 * et ensuite on change de listener pour le tour suivant car le comportement change
 *
 */
function choosePositionToBegin(event) {

    const clickedCell = event.target;
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
    addPlayerCircle(clickedCell, currentPlayer);

    if (playerPositions.player1 && playerPositions.player2) {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.removeEventListener("click", choosePositionToBegin);
            cell.addEventListener("click", ()=>movePlayer(cell,playerPositions,currentPlayer,actionsToDo,lastActionType))
        });

        const walls = document.querySelectorAll(".wall-vertical,.wall-horizontal");
        walls.forEach(wall=>{
            wall.addEventListener("mouseenter",wallListener);
            wall.addEventListener("click",wallLaid);
        })

    }

    //On enlève l'action réalisée au compteur
    actionsToDo--;
    document.getElementById("button-validate-action").style.display = "flex";
    document.getElementById("button-undo-action").style.display = "flex";
    updateNumberAction(0);

    //On sauvegarde la dernière action
    lastActionType = "position";
}

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

    //ancien to do: Vérifier si un mur n'est pas déjà posé ?
    if((firstWallToColor.classList.contains("wall-laid")) || (secondWallToColor.classList.contains("wall-laid")) || (spaceToColor.classList.contains("wall-laid"))){
        alert("Unexpected Error : wall shouldn't be clickable");
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

        //TODO enlever l'event listener pour le mur juste avant

        if (currentPlayer === 1) nbWallsPlayer1--;
        else nbWallsPlayer2--;

        actionsToDo--;
        document.getElementById("button-validate-action").style.display = "flex";
        document.getElementById("button-undo-action").style.display = "flex";
        updateNumberAction(0);
        //On sauvegarde la dernière action
        lastActionType = "wall " + firstWallToColor.id + " " + spaceToColor.id + " " + secondWallToColor.id;
        updateNumberWallsDisplay();
    }
    else{
        alert("Insufficent number of actions and/or walls");
    }
}

function updateNumberWallsDisplay(){
    if(currentPlayer===1) document.getElementById("display-current-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer1;
    else document.getElementById("display-current-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer2;
}


/**
 * Event listener que l'on ajoute au bouton sur l'écran anti triche
 * Quand l'utilisateur veut jouer son tour, on va enlever l'écran anti triche, affiche la grille et le texte au dessus
 */
function startNewRound(){
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
    document.getElementById("grid").style.display = 'grid';
    document.getElementById("display-current-player").style.display = "flex";
    document.getElementById("display-current-walls").style.display = "flex";
    document.getElementById("display-number-actions").style.display = "flex";
    document.getElementById("display-number-tour").style.display = "flex";
}

/**
 * Fonction permettant de pouvoir afficher la pop-up pour l'écran anti-triche
 * On va donc cacher la grille derrière pour éviter la triche
 */
function setUpNewRound(){
    document.getElementById("button-validate-action").style.display = "none";
    document.getElementById("button-undo-action").style.display = "none"
    document.getElementById("popup-ready-message").innerHTML = "C'est à vous de jouer : Joueur " +currentPlayer;
    document.getElementById("popup").style.display = 'flex';
    document.getElementById("grid").style.display = 'none';
    document.getElementById("display-current-player").style.display = "none";
    document.getElementById("display-current-player").innerHTML = "Joueur "+currentPlayer+" : ";
    document.getElementById("display-current-walls").style.display = "none";
    if(currentPlayer===1) document.getElementById("display-current-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer1;
    else document.getElementById("display-current-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer2;
    document.getElementById("display-number-actions").innerHTML = "Nombre d'actions restantes : 1";
    document.getElementById("display-number-actions").style.display = "none";
    document.getElementById("display-number-tour").innerHTML = "Tour numéro : "+numberTour;
    document.getElementById("display-number-tour").style.display = "none";

}



/**
 * Fonction qui est appelée à la fin du round du joueur pour appeler le bot à jouer
 * Elle comporte tt les appels au fichier ai.js pour se voir le nouveau comportement du bot
 */
function validateRound() {

    if(isGameOver()){
        document.getElementById("popup-ready-message").innerHTML = victoryAnswer;
        document.getElementById("popup").style.display = 'flex';
        document.getElementById("popup-button").style.display = "none";
    } else {

        //On récupère la nouvelle position générée par l'IA
        socket.emit("newMove", playerPositions["player2"]);
        socket.on("updatedBoard", (newPositionBot) => {
            console.log(newPositionBot);

            //On vérifie que le mouvement est légal, sinon on recommence
            /*if(playerPositions["player2"] !== null){
                while(!moveIsValid(lastPlayerPositions["player2"],document.getElementById(newPositionBot))){
                    newPositionBot = computeMove(playerPositions["player2"]);
                }
            }*/

            //On ajout le cercle du joueur au bon endroit
            let circle_bot = document.getElementById(newPositionBot);
            console.log("PLAYER POSITION 2 : "+playerPositions["player2"]);
            currentPlayer = 2;
            if(playerPositions["player2"] !== null) removePlayerCircle();
            addPlayerCircle(circle_bot, 2);

            //On sauvegarde la nouvelle position du pot dans le jeu
            playerPositions["player2"] = newPositionBot;
            console.log(playerPositions);
            currentPlayer = 1;
            socket.off("updatedBoard");
        });



        //Mettre les cases en bon état
        if(numberTour === 1){
            const cells = document.querySelectorAll(".cell");
            cells.forEach(cell => {
                cell.removeEventListener("click", choosePositionToBegin);
                cell.addEventListener("click", movePlayer)
            });

            const walls = document.querySelectorAll(".wall-vertical,.wall-horizontal");
            walls.forEach(wall=>{
                wall.addEventListener("mouseenter",wallListener);
                wall.addEventListener("click",wallLaid);
            });
        }

        //On augmente le nombre de tours car le bot vient de jouer
        numberTour++;
        actionsToDo=1;

        //On regarde si on est arrivé au 100ème tour, si c'est le cas alors => égalité
        if(numberTour === 101){
            document.getElementById("popup-ready-message").innerHTML = "Nombre de tours max atteints, égalité";
            document.getElementById("popup").style.display = 'flex';
            document.getElementById("popup-button").style.display = "none";
        }


        //On applique la sauvegarde des états des pions
        lastPlayerPositions["player1"] = playerPositions["player1"];
        lastPlayerPositions["player2"] = playerPositions["player2"];

        //On lance le nouveau round pour le joueur1
        setUpNewRound();
    }
}

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

        if(lastPlayerPositions["player"+currentPlayer] === null){ //Cette condition est vraie si et seulement si on est dans le premier tour
            document.getElementById(playerPositions["player"+currentPlayer]).classList.remove("occupied");

            const cells = document.querySelectorAll(".cell");
            cells.forEach(cell => {
                cell.removeEventListener("click", ()=>movePlayer(cell,playerPositions,currentPlayer,actionsToDo,lastActionType));
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
        playerPositions["player"+currentPlayer] = lastPlayerPositions["player"+currentPlayer];
    }else{ //Si la dernière action la placement d'un mur
        if(currentPlayer === 1) nbWallsPlayer1++;
        else nbWallsPlayer2++;
        //On parle la string pour récupérer les id des 3 murs que l'on va devoir remettre en "normal"
        let parse = lastActionType.split(" ");
        let firstWall=document.getElementById(parse[1]);
        let space=document.getElementById(parse[2]);
        let secondWall=document.getElementById(parse[3]);

        firstWall.classList.remove("wall-laid","laidBy"+currentPlayer);
        firstWall.addEventListener("mouseenter",wallListener);
        firstWall.addEventListener("click",wallLaid);

        space.classList.remove("wall-laid","laidBy"+currentPlayer);

        secondWall.classList.remove("wall-laid","laidBy"+currentPlayer);
        secondWall.addEventListener("mouseenter",wallListener);
        secondWall.addEventListener("click",wallLaid);

        //On update la phrase affichée sur le site
        updateNumberWallsDisplay();
    }
}


/**
 * Fonction qui analyse si un joueur à fini une partie ou pas
 * @returns {boolean}
 */
function isGameOver() {
    if (currentPlayer === 2) {
        if ((playerPositions["player1"] && playerPositions["player1"][0] === "8") && (!playerPositions["player2"] || playerPositions["player2"][0] !== "0")) {
            victoryAnswer = "Victoire du joueur 1 !! Félicitations ! ";
            return true;
        }
        if ((playerPositions["player1"] && playerPositions["player1"][0] === "8") && (playerPositions["player2"] && playerPositions["player2"][0] === "0")) {
            victoryAnswer = "Egalité entre les deux joueurs !";
            return true;
        }
        if ((playerPositions["player2"] && playerPositions["player2"][0] === "0") && (!playerPositions["player1"] || playerPositions["player1"][0] !== "8")) {
            victoryAnswer = "Victoire du joueur 2 !! Félicitations ! ";
            return true;
        }
    }
    //console.log(playerPositions["player1"] + " "+playerPositions["player2"]);
    return false;
}