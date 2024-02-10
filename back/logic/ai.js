// This function doesn't handle walls.
function computeMove(gameState) {
    console.log("gameState", gameState);
    if (gameState === null) {
        let moveIndex = Math.floor(Math.random() * 7);
        return [8, moveIndex];
    }
    let possibleMoves = gameState;
    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
}

module.exports = { computeMove };