export {removePlayerCircle, addPlayerCircle};

// fonction pour effacer l'anncienne position du joueur
function removePlayerCircle(oldPosition,currentPlayer) {
    const oldCell = document.getElementById(oldPosition);
    oldCell.classList.remove("occupied");
    // ne pas mettre firstChild car je veut juste retirer
    // le cercle et pas tout ce qu'il y a dans la cellule
    const playerCircle = document.getElementById("player"+currentPlayer+"-circle");
    //check if they are child and remove it
    if(playerCircle) oldCell.removeChild(playerCircle);
}

function addPlayerCircle(cellTarget,currentPlayer) {
    console.log(cellTarget.id);
    const circle = document.createElement("div");
    circle.classList.add("player" + currentPlayer + "-circle");
    circle.id="player" + currentPlayer + "-circle";
    //const cell = document.getElementById(newPosition);
    cellTarget.classList.add("occupied");
    cellTarget.appendChild(circle);
}