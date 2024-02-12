function setup(AIplay){
    console.log("AIPLAY");
    //return a Promise that is resolved into a position string
    //The position string is composed of 2 digits representing a cell exactly as stated in the rules.
}

function nextMove(gameState){
    console.log("gameState");
    //return a Promise that is resolved into a move object representing your AI's next move.
    //The move object has the following properties:
        //action: "move", "wall", or "idle" (note that "idle" can only be used when no legal action can be performed)
        //value (only if the action is not "idle"):
            // for the "move" action: a position string
            // for the "wall" action: a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical.
}

function correction(rightMove){
    console.log("rightMove");
    //return a Promise that is resolved into the boolean true, indicating it is ready to continue
}

function updateBoard(gameState){
    console.log("updateBoard");
    //return a Promise resolved into the boolean true in 50ms maximum.
}