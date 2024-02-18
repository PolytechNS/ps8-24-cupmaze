const {Case} = require("./Case");
const {Wall} = require("./Wall");
const {Space} = require("./Space");
const {Game} = require("./Game");

/*----------------------------------------------------------*/
class dataAdapter {
    constructor(game) {
        this.game = game;
        this.buildDataGame();
    }
    buildDataGame() {
        this.game.casePosition = [];
        this.game.wallPossible = [];
        this.game.gameState = {
            opponentWalls: [],
            ownWalls: [],
            board: []
        }
        const wallRow = [];
        for (let y = 0; y < 9; y++) {
            const row = [];
            const boardRow = [];
            for (let x = 0; x < 9; x++) {
                row.push(`${y+1}${x+1}`);
                if(x > 0 && y < 8) {
                    this.game.wallPossible.push([`${y+1}${x+1}`, 0]);
                }
                if (x === 4) {
                    boardRow.push(0);
                } else if (x > 4) {
                    boardRow.push(-1);
                } else {
                    boardRow.push(0);
                }
            }
            this.game.casePosition.push(row);
            this.game.gameState.board.push(boardRow);
        }

    }
}

function displayBoard(board) {
    for (let j = 8; j >= 0; j--) {
        let line = "";
        for (let i = 0; i < 9; i++) {
            line += board[i][j] + " ";
        }
        console.log(line);
    }
}

function displayBoardWall(board) {
    let line = "";
    for (let i = 0; i < board.length; i++) {
        if (i % 9 === 0) {
            console.log(line);
            line = "";
        }
        line += board[i] + " ";
    }
}



const game = new Game();
const adapter = new dataAdapter(game);
//displayBoard(game.casePosition);
colonne = 4;
ligne = 8;
//console.log(game.gameState.board[colonne-1][ligne-1]);


class Node {
    constructor(colonne, ligne, state) {
        this.colonne = colonne;
        this.ligne = ligne;
        this.state = state;
        this.neighbors = [];
        this.index = ligne * 9 + colonne + 1;
        // -1 if you do not see the cell,
        // 0 if you see the cell but it is empty,
        // 1 if you are in the cell,
        // 2 if your opponent is in the cell
    }
    setState(state) {
        this.state = state;
    }

    isGoal(player) {
        if (player === 1 && this.ligne === 8) {
            return true;
        } else if (player === 2 && this.ligne === 0) {
            return true;
        }
        return false;
    }
    toString() {
        return `${this.colonne+1}${this.ligne+1}`;
    }
}

class NodeWall {
    constructor(colonne, ligne, orientation) {
        this.colonne = colonne;
        this.ligne = ligne;
        this.orientation = orientation;
    }
    setOrientation(orientation) {
        this.orientation = orientation;
    }
    extractListRepresentation() {
        // retourn la representation de la position du mur avec orientation = 0 et son autre orientation = 1
        const wallPositionVertical = [`${this.colonne+1}${this.ligne+1}`, 0];
        const wallPositionHorizontal = [`${this.colonne+1}${this.ligne+1}`, 1];
        return [wallPositionVertical, wallPositionHorizontal];
    }
    toString() {
        return `(${this.colonne+1}, ${this.ligne+1}) ${this.orientation}`;
    }
}

class PriorityQueue {
    constructor() {
        this.collection = [];
    }
    enqueue(data, priority) {
        let added = false;
        for (let i = 0; i < this.collection.length; i++) {
            if (priority < this.collection[i].priority) {
                this.collection.splice(i, 0, { data, priority });
                added = true;
                break;
            }
        }
        if (!added) {
            this.collection.push({ data, priority });
        }
    }

    dequeue() {
        return this.collection.shift();
    }
    isEmpty() {
        return (this.collection.length === 0);
    }
}

class Graph {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.walls = new Map();
        this.nodes = new Map();
        // create nodes
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const node = new Node(j, i, (i === 4) ? 0 : (i > 4) ? -1 : 0);
                this.addNode(node);
                if (j !== 8 && i !== 0) {
                    const wall = new NodeWall(j, i, -1);
                    this.addWall(wall);
                }
            }
        }
        // create edges
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const currentNode = this.getNode(j, i);
                if (i > 0) {
                    const neighborNode = this.getNode(j, i - 1);
                    currentNode.neighbors.push(neighborNode);
                }
                if (i < height - 1) {
                    const neighborNode = this.getNode(j, i + 1);
                    currentNode.neighbors.push(neighborNode);
                }
                if (j > 0) {
                    const neighborNode = this.getNode(j - 1, i);
                    currentNode.neighbors.push(neighborNode);
                }
                if (j < width - 1) {
                    const neighborNode = this.getNode(j + 1, i);
                    currentNode.neighbors.push(neighborNode);
                }
            }
        }
    }
    addNode(node) {
        const key = `${node.colonne},${node.ligne}`;
        this.nodes.set(key, node);
    }
    getNode(colonne, ligne) {
        const key = `${colonne},${ligne}`;
        return this.nodes.get(key);
    }
    addWall(wall) {
        const key = `${wall.colonne},${wall.ligne}`;
        this.walls.set(key, wall);
    }
    getWall(colonne, ligne) {
        const key = `${colonne},${ligne}`;
        return this.walls.get(key);
    }
    getWalls() {
        return Array.from(this.walls.values());
    }
    removeWall(colonne, ligne) {
        const key = `${colonne},${ligne}`;
        this.walls.delete(key);
    }

    removeWallPlacement(colonne, ligne, orientation) {
        //console.log("wall removed at", `(${colonne+1},${ligne+1})`, orientation);
        if (orientation === 0) {
            this.addEdge(colonne, ligne, colonne, ligne - 1);
            this.addEdge(colonne + 1, ligne, colonne + 1, ligne - 1);

        } else if (orientation === 1) {
            this.addEdge(colonne, ligne, colonne - 1, ligne);
            this.addEdge(colonne, ligne + 1, colonne - 1, ligne + 1);
        }
    }

    getNodeState(colonne, ligne) {
        const node = this.getNode(colonne, ligne);
        return node ? node.state : null;
    }
    updateNodeState(colonne, ligne, state) {
        const node = this.getNode(colonne, ligne);
        if (node) {
            node.setState(state);
        }
    }

    addEdge(colonne1, ligne1, colonne2, ligne2) {
        const node1 = this.getNode(colonne1, ligne1);
        const node2 = this.getNode(colonne2, ligne2);
        if (node1 && node2) {
            node1.neighbors.push(node2);
            node2.neighbors.push(node1);
        }
    }

    removeEdge(colonne1, ligne1, colonne2, ligne2) {
        const node1 = this.getNode(colonne1, ligne1);
        const node2 = this.getNode(colonne2, ligne2);
        if (node1 && node2) {
            node1.neighbors = node1.neighbors.filter(neighbor => neighbor !== node2);
            node2.neighbors = node2.neighbors.filter(neighbor => neighbor !== node1);
        }
    }
    hasEdge(colonne1, ligne1, colonne2, ligne2) {
        const node1 = this.getNode(colonne1, ligne1);
        const node2 = this.getNode(colonne2, ligne2);
        return node1 && node2 && node1.neighbors.includes(node2) && node2.neighbors.includes(node1);
    }
    getNeighbors(colonne, ligne) {
        const node = this.getNode(colonne, ligne);
        return node ? node.neighbors : [];
    }
    possibleMovesWithJump(colonne, ligne) {
        const allNeighbors = this.getNeighbors(colonne, ligne);
        const possibleMoves = [];
        for (const neighbor of allNeighbors) {
            //console.log("neighbor", neighbor.toString());
            if (neighbor.state === 0 || neighbor.state === -1) {
                possibleMoves.push(neighbor);
            } else if (neighbor.state === 2) {
                const direction = (neighbor.colonne === colonne)
                    ? (neighbor.ligne > ligne) ? "N" : "S"
                    : (neighbor.colonne > colonne) ? "E" : "W";
                const behindNeighborColonne =
                            (direction ==="E") ? neighbor.colonne + 1 :
                            (direction === "W") ? neighbor.colonne - 1 :
                                neighbor.colonne;
                const behindNeighborLigne =
                            (direction === "N") ? neighbor.ligne + 1 :
                            (direction === "S") ? neighbor.ligne - 1 :
                                neighbor.ligne;
                const behindNeighborState = this.getNodeState(behindNeighborColonne, behindNeighborLigne);
                if (behindNeighborState === -1 || behindNeighborState === 0 && this.hasEdge(neighbor.colonne, neighbor.ligne, behindNeighborColonne, behindNeighborLigne)) {
                    possibleMoves.push(this.getNode(behindNeighborColonne, behindNeighborLigne));
                }
            }
        }
        return possibleMoves;
    }

    isValidWallPlacement(colonne, ligne, orientation, playerPosition, opponentPosition) {
        // there always has to be a path from each player's position to their goal
        const playerNode = this.getNode(parseInt(playerPosition[0]) - 1, parseInt(playerPosition[1]) - 1);
        const ennemyFinishLine = (playerNode.state === 1) ? 8 : 0;
        this.placeWall(colonne, ligne, orientation);

        const visited = new Set();
        const queue = [];
        Object.keys(this.nodes).forEach(key => {
            visited[key] = false;
        });
        queue.push(playerNode);
        visited[playerNode.index] = true;
        while (queue.length > 0) {
            const currentNode = queue.shift();
            if (currentNode.ligne === ennemyFinishLine) {
                this.removeWall(colonne, ligne, orientation);
                return true;
            }
            for (const neighbor of currentNode.neighbors) {
                if (!visited[neighbor.index]) {
                    queue.push(neighbor);
                    visited[neighbor.index] = true;
                }
            }
        }
        this.removeWall(colonne, ligne, orientation);
        return false;
    }

    placeWall(colonne, ligne, orientation) {
        if (colonne === 8 || ligne === 0) {
            //console.log("invalid wall position");
            return false;
        }
        if (orientation !== 0 && orientation !== 1) {
            //console.log("invalid wall orientation");
            return false;
        }
        // check if there is already a wall
        if (orientation === 0) {
            if (!this.hasEdge(colonne, ligne, colonne, ligne - 1) || !this.hasEdge(colonne + 1, ligne, colonne + 1, ligne - 1)) {
                //console.log("wall already placed");
                return false;
            }
        }

        // horizontal wall
        if (orientation === 0) {
            //console.log("wall placed at", `(${colonne+1},${ligne+1})`, orientation);
            this.removeEdge(colonne, ligne, colonne, ligne - 1);
            this.removeEdge(colonne + 1, ligne, colonne + 1, ligne - 1);
            this.removeWall(colonne, ligne);
        }
        // vertical wall
        if (orientation === 1) {
            this.removeEdge(colonne, ligne, colonne - 1, ligne);
            this.removeEdge(colonne, ligne + 1, colonne - 1, ligne + 1);
            this.removeWall(colonne, ligne);
        }
        //console.log("wall placed at", `(${colonne+1},${ligne+1})`, orientation);
    }

    isGameOver(numberPlayer) {
        if (numberPlayer === 1) {
            for (let i = 0; i < 9; i++) {
                if (this.getNode(i, 8).state === 1) {
                    return true;
                }
            }
        }
        if (numberPlayer === 2) {
            for (let i = 0; i < 9; i++) {
                if (this.getNode(i, 0).state === 2) {
                    return true;
                }
            }
        }
        return false;
    }
    wallPossible(){
        // return a list of possible wall
        return this.getWalls().map(wall => wall.extractListRepresentation()).flat();
    }

    distanceBetween(playerPosition, goalPosition) {
        const startNode = this.getNode(parseInt(playerPosition[0]) - 1, parseInt(playerPosition[1]) - 1);
        //console.log("playerPosition distance beetween", playerPosition);
        const goalNode = this.getNode(parseInt(goalPosition[0]) - 1, parseInt(goalPosition[1]) - 1);
        const distance = this.Dijkstra(startNode);
        if (distance[goalNode.index] !== undefined) {
            return distance[goalNode.index];
        } else {
            return Infinity;
        }
    }


    Dijkstra(startNode) {
        const distance = new Array(this.nodes.size).fill(Infinity);
        //console.log("startNode", startNode.index);
        distance[startNode.index] = 0;
        const visited = new Set();
        const priorityQueue = new PriorityQueue();
        priorityQueue.enqueue(startNode, 0);
        while (!priorityQueue.isEmpty()) {
            const currentNode = priorityQueue.dequeue().data;
            visited.add(currentNode);
            for (const neighbor of currentNode.neighbors) {
                if (!visited.has(neighbor)) {
                    const totalDistance = distance[currentNode.index] + 1;
                    if (totalDistance < distance[neighbor.index]) {
                        distance[neighbor.index] = totalDistance;
                        priorityQueue.enqueue(neighbor, totalDistance);
                    }
                }
            }
        }
        return distance;
    }

    distanceToGoal(player, playerPosition) {
        // return the distance to the goal for a player (1 or 2)
        if (playerPosition === "") { return 100; }
        const goalLine = (player === 1) ? 8 : 0;
        let minDistances = Infinity;
        for (let i = 0; i < 9; i++) {
            if (this.getNode(i, goalLine).isGoal(player)){
                //console.log("node is goal", this.getNode(i, goalLine).toString());
                const distance = this.distanceBetween(playerPosition, `${i+1}${goalLine+1}`);
                minDistances = Math.min(minDistances, distance);
            }
        }
        return minDistances;
    }
}

const graph = new Graph(9, 9);
//console.log("wall possible", graph.wallPossible());

console.log("graph", graph.getNodeState(0, 0));
console.log("51 ", graph.getNeighbors(4, 0).map(node => node.toString()));
console.log("58", graph.getNeighbors(4, 7).map(node => node.toString()));
console.log("possibleMovesWithJump at 58", graph.possibleMovesWithJump(4, 7).map(node => node.toString()));

//graph.placeWall(4,1, 0);
//console.log("possibleMovesWithJump at 51", graph.possibleMovesWithJump(4, 0).map(node => node.toString()));




let ai;
let position= ""
let move = {
    action: "",
    value: ""
}

class IA {
    constructor(AIplay) {
        this.player = AIplay;
        this.opponent = null
        this.playerPosition = "";
        this.adversaryPosition = "";
        this.graph = new Graph(9, 9);
    }
    setup(AIplay) {
        // define initial position based on player number
        this.player = AIplay;
        this.opponent = (AIplay === 1) ? 2 : 1;
        const position = (AIplay === 1) ? "51" : "59";
        this.graph.updateNodeState(parseInt(position[0]) - 1, parseInt(position[1]) - 1, 1);
        this.playerPosition = position;
        this.previousPlayerPosition = position;
        // on dira que l'adversaire est a 59
        this.adversaryPosition = (AIplay === 1) ? "" : "51"
        this.graph.updateNodeState(parseInt(this.adversaryPosition[0]) - 1, parseInt(this.adversaryPosition[1]) - 1, 2);
        return position;
    }

    minimaxInit(gameState, depth) {
        let alpha = Number.NEGATIVE_INFINITY;
        let beta = Number.POSITIVE_INFINITY;
        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = null;
        //console.log("move possible", this.generateMoves().filter(move => move.action === "move").map(move => move.value));
        for (const move of this.generateMoves()) {
            this.simulateMove(move, gameState);
            const evaluation = this.minimax(gameState, depth - 1, false, alpha, beta);
            this.undoMove(move, gameState);
            if (evaluation > maxEval) {
                maxEval = evaluation;
                bestMove = move;
            }
            alpha = Math.max(alpha, maxEval);
            if (beta <= alpha) {
                break;
            }
        }
        return bestMove;
    }


    minimax(gameState, depth, isMaximizing, alpha, beta) {
        if (this.isTerminalState()) {
            if (isMaximizing) {
                return -1000;
            } else {
                return 1000;
            }
        }
        if (depth === 0) {
            return this.evaluate(gameState);
        }
        if (isMaximizing) {
            let maxEval = Number.NEGATIVE_INFINITY;
            const moves = this.generateMoves();
            for (const move of moves) {
                this.simulateMove(move, gameState);
                const evaluation = this.minimax(gameState, depth - 1, false, alpha, beta);
                this.undoMove(move, gameState);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, maxEval);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxEval;
        } else {
            let minEval = Number.POSITIVE_INFINITY;
            const moves = this.generateMoves();
            for (const move of moves) {
                this.simulateMove(move, gameState);
                const evaluation = this.minimax(gameState, depth - 1, true, alpha, beta);
                this.undoMove(move, gameState);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, minEval);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }
    nextMove(gameState) {
        const startTime = performance.now();
        const bestMove = this.minimaxInit(gameState,2);
        const endTime = performance.now();
        console.log("time", endTime - startTime);
        console.log("bestMove", bestMove);
        return bestMove;
    }
    generateMoves() {
        const wallPossible = this.graph.wallPossible();
        const possibleMoves = this.graph.possibleMovesWithJump(parseInt(this.playerPosition[0]) - 1, parseInt(this.playerPosition[1]) - 1);
        const moves = [];
        for (const possibleMove of possibleMoves) {
            moves.push({
                action: "move",
                value: possibleMove.toString()}
            );
        }
        for (const wall of wallPossible) {
            moves.push({
                action: "wall",
                value: wall
            });
        }

        return moves;
    }
    simulateMove(move, gameStates) {
        if (move.action === "move") {
            this.graph.updateNodeState(parseInt(this.playerPosition[0]) - 1, parseInt(this.playerPosition[1]) - 1, 0);
            this.graph.updateNodeState(parseInt(move.value[0]) - 1, parseInt(move.value[1]) - 1, this.player);

            gameStates.board[parseInt(this.playerPosition[0]) - 1][parseInt(this.playerPosition[1]) - 1] = 0;
            gameStates.board[parseInt(move.value[0]) - 1][parseInt(move.value[1]) - 1] = this.player;
            this.previousPlayerPosition = this.playerPosition;
            this.playerPosition = move.value;
        } else if (move.action === "wall") {
            this.graph.placeWall(parseInt(move.value[0][0]) - 1, parseInt(move.value[0][1]) - 1, move.value[1]);
            gameStates.ownWalls.push(move.value);
        }
    }

    undoMove(move, gameStates) {
        if (move.action === "move") {
            this.graph.updateNodeState(parseInt(this.previousPlayerPosition[0]) - 1, parseInt(this.previousPlayerPosition[1]) - 1, this.player);
            this.graph.updateNodeState(parseInt(move.value[0]) - 1, parseInt(move.value[1]) - 1, 0);
            // update du gameStates
            gameStates.board[parseInt(this.previousPlayerPosition[0]) - 1][parseInt(this.previousPlayerPosition[1]) - 1] = this.player;
            gameStates.board[parseInt(move.value[0]) - 1][parseInt(move.value[1]) - 1] = 0;
            this.playerPosition = this.previousPlayerPosition;
        } else if (move.action === "wall") {
            this.graph.removeWallPlacement(parseInt(move.value[0][0]) - 1, parseInt(move.value[0][1]) - 1, move.value[1]);
            // update du gameStates
            gameStates.ownWalls.pop();
        }
    }

    evaluate(gameStates) {
        let score = 0;

        const distanceToGoal = this.graph.distanceToGoal(this.player, this.playerPosition);
        score += 100 - distanceToGoal;
        // distance to the player's goal for the adversary
        const distanceToAdversaryGoal = this.graph.distanceToGoal(2, this.adversaryPosition);
        score -= 100 - distanceToAdversaryGoal;

        if (distanceToGoal === 1) {
            score += 1000;
        } else if (distanceToAdversaryGoal === 1) {
            score -= 1000;
        }
        //console.log("score", score);
        return score;
    }
    isTerminalState() {
        return this.graph.isGameOver(this.player);
    }
    updateBoard(gameState){
        let ownWalls = gameState.ownWalls;
        //console.log("ownWalls", ownWalls);
        let opponentWalls = gameState.opponentWalls;
        let walls = ownWalls.concat(opponentWalls);
        let board = gameState.board;
        for (const wall of walls) {
            let colonne = parseInt(wall[0][0]);
            let ligne = parseInt(wall[0][1]);
            let orientation = wall[1];
            this.graph.placeWall(colonne, ligne, orientation);
        }
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 1) {
                    this.playerPosition = `${i+1}${j+1}`;
                }
                if (board[i][j] === 2) {
                    this.adversaryPosition = `${i+1}${j+1}`;
                }
                this.graph.updateNodeState(i, j, board[i][j]);
            }
        }
        return true;
    }
}

function setup(AIplay) {
    console.log("setup");
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            ai = new IA();
            position = ai.setup(AIplay);
            resolve(position);
        }, 1000);
    });
}

function nextMove(gameStates){
    console.log("nextMove");
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            move = ai.nextMove(gameStates);
            resolve(move);
        }, 200);
    });
}

function correction(rightMove){
    console.log("rightMove");
    //return a Promise that is resolved into the boolean true, indicating it is ready to continue
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 50);
    });
}

function updateBoard(gameStates){
    console.log("updateBoard");
    //return a Promise resolved into the boolean true in 50ms maximum.
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            ai.updateBoard(gameStates);
            resolve(true);
        }, 50);
    });
}

/*-------------------------------------------------------------------------------*/
let gameStates = {
    // a list containing each of your opponent's walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    opponentWalls: [],
    // a list containing each of your walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    ownWalls: [],
    //a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1) as defined in the rules. The value for each cell can be : -1 if you do not see the cell, 0 if you see the cell but it is empty, 1 if you are in the cell, 2 if your opponent is in the cell
    board: [],
}


class GenerateGameStates {
    constructor() {
        this.gameStates = {
            opponentWalls: [],
            ownWalls: [],
            board: []
        }
        this.createEmptyBoard();
    }
    createEmptyBoard() {
        for (let i = 0; i < 9; i++) {
            const row = [];
            for (let j = 0; j < 9; j++) {
                if (j === 4) {
                    row.push(0);
                } else if (j > 4) {
                    row.push(-1);
                } else {
                    row.push(0);
                }
            }
            this.gameStates.board.push(row);
        }
    }
}

const generateGameStates = new GenerateGameStates();
const gameState = generateGameStates.gameStates;


function testAI() {
    setup(1).then((position) => {
        nextMove(gameState).then((move) => {
            console.log("move", move);
            correction(true).then((rightMove) => {
                console.log("rightMove", rightMove);
                updateBoard(gameState).then((boardUpdated) => {
                    console.log("boardUpdated", boardUpdated);
                });
            });
        });
    });
}

//console.log("this.wall", graph.getWalls().map(wall => wall.extractListRepresentation()).flat().filter(wall => wall[0] === "19"));
testAI();
//console.log("gameState", gameState);