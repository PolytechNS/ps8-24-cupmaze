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

    const adjacentPlayer = findAdjacentPlayer(newPosition);
    if(adjacentPlayer){
        const wallBehindAdjacentPlayer = findWallBehindPlayer(adjacentPlayer);
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

function findWallBehindPlayer(adjacentPlayer) {
    console.log("adjacentPlayer", adjacentPlayer);
}