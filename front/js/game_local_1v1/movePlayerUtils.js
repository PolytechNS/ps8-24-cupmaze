export {removePlayerCircle, addPlayerCircle, removePlayerCircleIA};

// fonction pour effacer l'anncienne position du joueur
function removePlayerCircle(playerPositions,currentPlayer) {
    console.log("playerPositions", playerPositions);
    let oldPosition = playerPositions[`player${currentPlayer}`];
    console.log("oldPosition", oldPosition);
    if (oldPosition === null) {return;}
    const oldCell = document.getElementById(oldPosition);

    oldCell.classList.remove("occupied");
    const playerCircle = document.getElementById("player"+currentPlayer+"-circle");
    if(playerCircle) oldCell.removeChild(playerCircle);
}

function removePlayerCircleIA(playerPostion,currentPlayer) {
    console.log("playerPositions", circleBot);
    console.log("currentPlayer", currentPlayer);
    const oldCell = circleBot;
    oldCell.classList.remove("occupied");
    const playerCircle = document.getElementById("player"+currentPlayer+"-circle");
    if(playerCircle) oldCell.removeChild(playerCircle);
}

function addPlayerCircle(cell,currentPlayer) {
    const circle = document.createElement("div");
    circle.classList.add("player" + currentPlayer + "-circle");
    circle.id="player" + currentPlayer + "-circle";
    console.log("cell", cell);
    cell.classList.add("occupied");
    cell.appendChild(circle);
}