export {
    beginningPositionIsValid,
    moveIsValid,
    getPossibleMoves
};

function beginningPositionIsValid(currentPlayer, position) {
    return (currentPlayer === 1) ? position === "0" : position === "8";
}

function getPossibleMoves(position) {
    if (position === null) { return; }
    const possibleMoves = [];
    const [line, column] = position.split("-").map((value) => parseInt(value));

    function checkMove(newLine, newColumn, posibleMoves) {
        if (newLine < 0 || newLine > 8 || newColumn < 0 || newColumn > 8) {
            return;
        }
        const cell = document.getElementById(`${newLine}-${newColumn}~cell`);
        if (cell.classList.contains("occupied")) {
            const adjacentPlayerCell = findAdjacentPlayer(line, column);
            if (adjacentPlayerCell) {
                const orientationAdjactentPlayer = findOrientationAdjacentPlayer(adjacentPlayerCell, position);
                const wallBehindAdjacentPlayer = findWallBehindPlayer(position, orientationAdjactentPlayer);
                //console.log(wallBehindAdjacentPlayer);
                //console.log(orientationAdjactentPlayer);
                if (wallBehindAdjacentPlayer) {
                    return;
                }
                /*
                const jumpCell = findJumpCell(newLine, newColumn, orientationAdjactentPlayer);
                if (jumpCell) {
                    console.log(jumpCell);
                    posibleMoves.push(jumpCell);
                    jumpCell.classList.add("possible-move");

                 */
                }
            }
        const wallId = (newLine === line) ? `wv~${line}-${Math.min(column, newColumn)}` : `wh~${Math.min(line, newLine)}-${column}`;
        const wall = document.getElementById(wallId);
        if (!wall.classList.contains("wall-laid")) {
            posibleMoves.push(cell);
            cell.classList.add("possible-move");
        }
    }

    // verifie l'axe vertical
    checkMove(line - 1, column, possibleMoves);
    checkMove(line + 1, column, possibleMoves);
    // verifie l'axe horizontal
    checkMove(line, column - 1, possibleMoves);
    checkMove(line, column + 1, possibleMoves);
    return possibleMoves;
}

function findAdjacentPlayer(line, column) {
    const checkAdjacentCell = (deltaLine, deltaColumn) => {
        const adjacentCell = document.getElementById(`${line + deltaLine}-${column + deltaColumn}~cell`);
        return adjacentCell && adjacentCell.classList.contains("occupied") ? adjacentCell : null;
    };
    return checkAdjacentCell(-1, 0) || checkAdjacentCell(1, 0) || checkAdjacentCell(0, -1) || checkAdjacentCell(0, 1);
}

function findOrientationAdjacentPlayer(adjacentPlayerCell, currentPosition) {
    const [adjacentLine, adjacentColumn] = adjacentPlayerCell.id.split("-").map((value) => parseInt(value));
    const [currentLine, currentColumn] = currentPosition.split("-").map((value) => parseInt(value));
    return adjacentLine === currentLine ? "horizontal" : adjacentColumn === currentColumn ? "vertical" : null;
}

function findWallBehindPlayer(currentPosition, orientationAdjactentPlayer) {
    const [currentLine, currentColumn] = currentPosition.split("-").map((value) => parseInt(value));
    const wallId =
        orientationAdjactentPlayer === "horizontal" ? `wv~${currentLine}-${Math.min(currentColumn, currentColumn + 1)}` : `wh~${Math.min(currentLine, currentLine + 1)}-${currentColumn}`;
    return wallId ? document.getElementById(wallId).classList.contains("wall-laid") : false;
}

function findJumpCell(line, column, orientationAdjactentPlayer) {
    const jumpLine = orientationAdjactentPlayer === "horizontal" ? line : line - 1;
    const jumpColumn = orientationAdjactentPlayer === "vertical" ? column : column + 2;
    if (jumpLine >= 0 && jumpLine <= 8 && jumpColumn >= 0 && jumpColumn <= 8) {
        return document.getElementById(`${jumpLine}-${jumpColumn}~cell`);
    }
    return null;
}




















function moveIsValid(oldPosition, cell) {
    if(cell.classList.contains("occupied")){
        alert("Cette cellule est déjà occupée. Choisissez une autre.");
        return false;
    }

    const newPosition = cell.id;
    let newPositionLine = parseInt(newPosition[0]);
    let newPositionColumn = parseInt(newPosition[2]);

    let oldPositionLine = parseInt(oldPosition[0]);
    let oldPositionColumn = parseInt(oldPosition[2]);

    const adjacentPlayerCell = findAdjacentPlayer2(oldPosition);
    if(adjacentPlayerCell){
        const OrientationAdjacentPlayer = findOrientationAdjacentPlayer(adjacentPlayerCell, oldPosition);
        const wallBehindAdjacentPlayer = findWallBehindPlayer(newPosition, OrientationAdjacentPlayer);
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
function findAdjacentPlayer2(position){
    const adjacentCells = getAdjacentCells(position);
    for (const cell of adjacentCells) {
        if(cell.classList.contains("occupied"))
            return cell;
    }
    return false;
}

function findOrientationAdjacentPlayer2(adjacentPlayerCell, oldPosition){
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

function findWallBehindPlayer2(newPosition, orientationAdjactentPlayer){
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