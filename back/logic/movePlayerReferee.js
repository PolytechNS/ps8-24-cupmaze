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

        // on recupere le mur
        const wallId = (newLine === line) ?
            this.elements.find((element) =>
                element instanceof Wall &&
                element.inclinaison === "vertical" &&
                element.line === line &&
                element.column === Math.min(column, newColumn)) :
            this.elements.find((element) =>
                element instanceof Wall &&
                element.inclinaison === "horizontal" &&
                element.line === Math.min(line, newLine) &&
                element.column === column);

        const cell = this.elements.find((element) => element instanceof Case && element.line === newLine && element.column === newColumn);
    }
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