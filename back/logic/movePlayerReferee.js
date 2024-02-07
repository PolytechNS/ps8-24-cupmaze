export {
    beginningPositionIsValid,
    moveIsValid,
    getPossibleMoves
};

function beginningPositionIsValid(currentPlayer, position) {
     return (currentPlayer === 1) ? position === "0" : position === "8";
}

function getPossibleMoves(playerPosition, elements) {
    const possibleMoves = [];
    const [line, column] = playerPosition;

    function checkMove(newLine, newColumn, possibleMoves, direction) {
        if (newLine < 0 || newLine > 8 || newColumn < 0 || newColumn > 8) {
            return;
        }

        // on recupere le mur meme si il nn'est pas placé pour le moment
        // et on recupere la cellule
        const wall = (newLine === line) ?
            this.elements.find((element) =>
                element instanceof Wall &&
                element.inclinaison === "vertical" &&
                element.pos_x === line &&
                element.pos_y === Math.min(column, newColumn)) :
            this.elements.find((element) =>
                element instanceof Wall &&
                element.inclinaison === "horizontal" &&
                element.pos_x === Math.min(line, newLine) &&
                element.pos_y === column);

        const cell = this.elements.find((element) =>
            element instanceof Case &&
            element.pos_x === newLine &&
            element.pos_y === newColumn);

        // on verifie si le mur est placé
        if (!wall || !wall.isLaid){
            if (cell.isOccupied) {
                var jumpCell = findJumpCell(newLine, newColumn, direction);
                if (jumpCell) {
                    possibleMoves.push(jumpCell);
                }
            } else {
                possibleMoves.push(cell);
            }
        }
    }

    // verifie l'axe vertical
    checkMove(line - 1, column, possibleMoves, "A");
    checkMove(line + 1, column, possibleMoves, "B");
    // verifie l'axe horizontal
    checkMove(line, column - 1, possibleMoves, "L");
    checkMove(line, column + 1, possibleMoves, "R");
}

function findAdjacentPlayer(line, column) {
}

function findOrientationAdjacentPlayer(adjacentPlayerCell, currentPosition) {

}

function findWallBehindPlayer(currentPosition, orientationAdjactentPlayer) {

}

function findJumpCell(line, column, direction) {

}


function moveIsValid(oldPosition, cell) {

}

function getAdjacentCells(position) {

}
function findAdjacentPlayer2(position){

}

function findOrientationAdjacentPlayer2(adjacentPlayerCell, oldPosition){

}

function findWallBehindPlayer2(newPosition, orientationAdjactentPlayer){

}