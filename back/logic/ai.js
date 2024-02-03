// This function doesn't handle walls.
function computeMove(gameState) {
    if (gameState === null) {
        let moveIndex = Math.floor(Math.random() * 7);
        return "8-" + moveIndex.toString() + "~cell";
    }

    // Convert gameState to an array
    let newPosition = gameState.split('-');
    let pos_x = parseInt(newPosition[0]);
    let pos_y = parseInt(newPosition[1]);
    let possibleMoves = [];

    // Check if moving left is possible.
    if (pos_x > 0) {
        let newColor = pos_x - 1;
        possibleMoves.push([newColor, pos_y].join('-') + "~cell");
    }
    // Check if moving right is possible.
    if (pos_x < 8) {
        let newColor = pos_x + 1;
        possibleMoves.push([newColor, pos_y].join('-') + "~cell");
    }
    // Check if moving down is possible.
    if (pos_y < 8) {
        let newColor = pos_y + 1;
        possibleMoves.push([pos_x, newColor].join('-') + "~cell");
    }
    // Check if moving up is possible.
    if (pos_y > 0) {
        let newColor = pos_y - 1;
        possibleMoves.push([pos_x, newColor].join('-') + "~cell");
    }

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
}

module.exports = { computeMove };