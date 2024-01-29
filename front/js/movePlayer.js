import {moveIsValid} from "./referee.js";
import {updateNumberAction} from "./utils.js";

export {movePlayer, addPlayerCircle};
function movePlayer(cell,playerPositions,currentPlayer,actionsToDo,lastActionType) {
    const clickedCell = cell;
    // il faudra mettre des verif ici quand on aura extrait le graphe du plateau

    if(moveIsValid(playerPositions[`player${currentPlayer}`],clickedCell) && actionsToDo===1) {
        removePlayerCircle(playerPositions,currentPlayer);
        playerPositions[`player${currentPlayer}`] = clickedCell.id;
        console.log(playerPositions);
        addPlayerCircle(clickedCell, currentPlayer);

        actionsToDo--;
        document.getElementById("button-validate-action").style.display = "flex";
        document.getElementById("button-undo-action").style.display = "flex";
        updateNumberAction(0);
        //On sauvegarde la dernière action
        lastActionType = "position";
    } else {
        alert("Mouvement impossible ou pas assez d'actions");
    }
}

function addPlayerCircle(cell, player) {
    const circle = document.createElement("div");
    circle.classList.add("player" + player + "-circle");
    circle.id="player" + player + "-circle";
    cell.appendChild(circle);
}

// fonction pour effacer l'anncienne position du joueur
function removePlayerCircle(playerPositions,currentPlayer) {
    const oldPosition = playerPositions[`player${currentPlayer}`];
    const oldCell = document.getElementById(oldPosition);

    oldCell.classList.remove("occupied");
    // ne pas mettre firstChild car je veut juste retirer
    // le cercle et pas tout ce qu'il y a dans la cellule
    const playerCircle = document.getElementById("player"+currentPlayer+"-circle");
    if(playerCircle) oldCell.removeChild(playerCircle);

}
