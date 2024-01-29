export {
    beginningPositionIsValid,
    moveIsValid
};

function beginningPositionIsValid(currentPlayer, position) {
    return (currentPlayer === 1) ? position === "0" : position === "8";
}

function moveIsValid(oldPosition, cell) {
    console.log(getAdjacentCells(oldPosition));
    if(cell.classList.contains("occupied")){
        alert("Cette cellule est déjà occupée. Choisissez une autre.");
        return false;
    }

    const newPosition = cell.id;
    let newPositionLine = parseInt(newPosition[0]);
    let newPositionColumn = parseInt(newPosition[2]);

    let oldPositionLine = parseInt(oldPosition[0]);
    let oldPositionColumn = parseInt(oldPosition[2]);

    const adjacentPlayerCell = findAdjacentPlayer(oldPosition);
    if(adjacentPlayerCell){
        const OrientationAdjacentPlayer = findOrientationAdjacentPlayer(adjacentPlayerCell, oldPosition);
        const wallBehindAdjacentPlayer = findWallBehindPlayer(newPosition, OrientationAdjacentPlayer);
        console.log(wallBehindAdjacentPlayer);
        if (wallBehindAdjacentPlayer) {
            alert("Vous ne pouvez pas sauter il y a un mur derrière le joueur");
            return false;
        }
        return true;
    }

    if (!(-1 < newPositionLine < 9 && -1 < newPositionColumn < 9)){
        alert("chuckles wtf");
        return false;
    }
    if (newPositionLine === oldPositionLine) {
        //Player is moving horizontally
        let wallId="wv~";
        if(newPositionColumn === oldPositionColumn + 1 ){
            //Player is going right
            wallId+=newPositionLine+"-"+oldPositionColumn;
            if(!document.getElementById(wallId).classList.contains("wall-laid"))
                return true;
            alert("Vous ne pouvez pas traverser les murs");
            return false;
        }
        if(newPositionColumn === oldPositionColumn - 1 ){
            //Player is going left
            wallId+=newPositionLine+"-"+newPositionColumn;
            if(!document.getElementById(wallId).classList.contains("wall-laid"))
                return true;
            alert("Vous ne pouvez pas traverser les murs");
            return false;
        }
    }
    if (newPositionColumn === oldPositionColumn) {
        //Player is moving vertically
        let wallId="wh~";
        if(newPositionLine === oldPositionLine - 1 ){
            //Player is going up
            wallId+=newPositionLine+"-"+newPositionColumn;
            if(!document.getElementById(wallId).classList.contains("wall-laid"))
                return true;
            alert("Vous ne pouvez pas traverser les murs");
            return false;
        }
        if(newPositionLine === oldPositionLine + 1){
            //Player is going down
            wallId+=oldPositionLine+"-"+newPositionColumn;
            if(!document.getElementById(wallId).classList.contains("wall-laid"))
                return true;
            alert("Vous ne pouvez pas traverser les murs");
            return false;
        }
    }
    alert("Votre position actuel ne permet pas ce mouvement");
    return false;
}

function getAdjacentCells(position) {
    let line = parseInt(position[0]);
    let column = parseInt(position[2]);

    // ajouter les cases adjacentes
    const adjacentCells = [];
    if (line > 0) {
        adjacentCells.push(document.getElementById(`${line - 1}-${column}~cell`));
    }
    if (line < 8) {
        adjacentCells.push(document.getElementById(`${line + 1}-${column}~cell`));
    }
    if (column > 0) {
        adjacentCells.push(document.getElementById(`${line}-${column - 1}~cell`));
    }
    if (column < 8) {
        adjacentCells.push(document.getElementById(`${line}-${column + 1}~cell`));
    }
    return adjacentCells;
}
function findAdjacentPlayer(position){
    const adjacentCells = getAdjacentCells(position);
    for (const cell of adjacentCells) {
        if(cell.classList.contains("occupied"))
            return cell;
    }
    return false;
}

function findOrientationAdjacentPlayer(adjacentPlayerCell, oldPosition){
    const adjacentPlayerCellId = adjacentPlayerCell.id;
    const adjacentPlayerCellLine = parseInt(adjacentPlayerCellId[0]);
    const adjacentPlayerCellColumn = parseInt(adjacentPlayerCellId[2]);
    const oldPositionLine = parseInt(oldPosition[0]);
    const oldPositionColumn = parseInt(oldPosition[2]);

    if (adjacentPlayerCellLine === oldPositionLine - 1) {
        return "N";
    }
    if (adjacentPlayerCellLine === oldPositionLine + 1) {
        return "S";
    }
    if (adjacentPlayerCellColumn === oldPositionColumn + 1) {
        return "E";
    }
    if (adjacentPlayerCellColumn === oldPositionColumn - 1) {
        return "O";
    }
}

function findWallBehindPlayer(newPosition, orientationAdjactentPlayer){
    // chercher si il y a un mur derrière le joueur adjacent celon l'orientation du joueur adjacent
    const newPositionLine = parseInt(newPosition[0]);
    const newPositionColumn = parseInt(newPosition[2]);

    switch (orientationAdjactentPlayer) {
        case "N":
            const wallNId = "wh~" + newPositionLine + "-" + newPositionColumn;
            if (document.getElementById(wallNId).classList.contains("wall-laid")) {
                return true;
            }
            break;
        case "S":
            const wallSId = "wh~" + newPositionLine-1 + "-" + newPositionColumn;
            if (document.getElementById(wallSId).classList.contains("wall-laid")) {
                return true;
            }
            break;
        case "E":
            const wallEId = "wv~" + newPositionLine + "-" + newPositionColumn-1;
            if (document.getElementById(wallEId).classList.contains("wall-laid")) {
                return true;
            }
            break;
        case "O":
            const wallOId = "wv~" + newPositionLine + "-" + newPositionColumn;
            if (document.getElementById(wallOId).classList.contains("wall-laid")) {
                return true;
            }
            break;
    }
}