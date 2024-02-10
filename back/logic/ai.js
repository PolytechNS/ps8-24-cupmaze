// This function doesn't handle walls.
function computeMove(playerPosition,game) {
    if (playerPosition === null) {
        let moveIndex = Math.floor(Math.random() * 7);
        return "8-" + moveIndex.toString() + "~cell";
    }

    // Calculate possibleMoves
    let possibleMoves = game.getPossibleMoves(playerPosition);
    console.log(possibleMoves);

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
}

module.exports = { computeMove };