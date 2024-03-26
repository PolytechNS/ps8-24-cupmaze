// This function doesn't handle walls.
function computeMove(possiblesMoves, playerPosition ) {
    if (playerPosition === null) {
        let moveIndex = Math.floor(Math.random() * 9) + 1;
        return [moveIndex, 9];
    }
    let possibleMoves = possiblesMoves;
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
}

module.exports = { computeMove };