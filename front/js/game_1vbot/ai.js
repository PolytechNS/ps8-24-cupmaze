// This function doesn't handle walls.
export function computeMove(gameState) {

    if(gameState === null){
        let moveIndex = Math.floor(Math.random()*7);
        return "8-"+moveIndex.toString()+"~cell";
    }

    let pos_x = gameState[0];
    let pos_y = gameState[2];
    let possibleMoves = [];
    // Check if moving left is possible.
    if (pos_x > 0){
        let newPosition = gameState;
        newPosition[0] -= 1;
        possibleMoves.push(newPosition);

    }
    // Check if moving right is possible.
    if (pos_x < 8) {
        let newPosition = gameState;
        newPosition[0] += 1;
        possibleMoves.push(newPosition);
    }
    // Check if moving down is possible.
    if (pos_y < 8){
        let newPosition = gameState;
        newPosition[2] += 1;
        possibleMoves.push(newPosition);
    }
    // Check if moving up is possible.
    if (pos_y > 0) {
        let newPosition = gameState;
        newPosition[2] -= 1;
        possibleMoves.push(newPosition);
    }

    // Get a random integer between 0 and possibleMoves.length-1
    let moveIndex = Math.floor(Math.random()*possibleMoves.length);
    return possibleMoves[moveIndex];
}