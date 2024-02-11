// This function doesn't handle walls.
function computeMove(possiblesMoves, playerPosition ) {
    //console.log("gameState", gameState);
    if (playerPosition === null) {
        let moveIndex = Math.floor(Math.random() * 7);
        return [8, moveIndex];
    }
    let possibleMoves = possiblesMoves;
    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
}

module.exports = { computeMove };