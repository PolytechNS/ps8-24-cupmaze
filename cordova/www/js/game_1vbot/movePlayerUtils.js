export {removePlayerCircle, addPlayerCircle};

// fonction pour effacer l'anncienne position du joueur
function removePlayerCircle(oldPosition,currentPlayer) {
    console.log("removePlayerCircle", oldPosition, currentPlayer)
    const oldCell = document.getElementById(oldPosition);
    console.log(oldCell);
    oldCell.classList.remove("occupied");
    const playerCircle = document.getElementById("player"+currentPlayer+"-circle");
    if (playerCircle && oldCell.contains(playerCircle)) {
        console.log(playerCircle.children);
        oldCell.removeChild(playerCircle);
    }
}

function addPlayerCircle(cellTarget,currentPlayer) {
    console.log("addPlayerCircle", cellTarget);
    const circle = document.createElement("div");
    circle.classList.add("player" + currentPlayer + "-circle");
    circle.id="player" + currentPlayer + "-circle";
    //const cell = document.getElementById(newPosition);
    cellTarget.classList.add("occupied");
    cellTarget.appendChild(circle);
}