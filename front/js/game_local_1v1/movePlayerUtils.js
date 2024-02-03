export {removePlayerCircle, addPlayerCircle};

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

function addPlayerCircle(cell,currentPlayer) {
    const circle = document.createElement("div");
    circle.classList.add("player" + currentPlayer + "-circle");
    circle.id="player" + currentPlayer + "-circle";
    cell.classList.add("occupied");
    cell.appendChild(circle);
}