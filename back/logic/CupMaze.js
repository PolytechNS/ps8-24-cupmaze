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
                if ((behindNeighborState === -1 || behindNeighborState === 0) && this.hasEdge(neighbor.colonne, neighbor.ligne, behindNeighborColonne, behindNeighborLigne)) {
                    possibleMoves.push(this.getNode(behindNeighborColonne, behindNeighborLigne));
                }
            }
        }
        return possibleMoves;
    }

    isValidWallPlacement(colonne, ligne, orientation, playerPosition, opponentPosition) {
        // there always has to be a path from each player's position to their goal
        if (playerPosition === "" || opponentPosition === "") {
            return true;
        }
        const playerNode = this.getNode(parseInt(playerPosition[0]) - 1, parseInt(playerPosition[1]) - 1);
        const ennemyFinishLine = (playerNode.state === 1) ? 8 : 0;
        if (this.placeWall(colonne, ligne, orientation) === false) {
            return false;
        }
        //this.placeWall(colonne, ligne, orientation);
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
                //this.removeWall(colonne, ligne, orientation);
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
        this.ownWalls = 0;
        this.opponent = (AIplay === 1) ? 2 : 1;
        const position = (AIplay === 1) ? "81" : "89";
        this.graph.updateNodeState(parseInt(position[0]) - 1, parseInt(position[1]) - 1, 1);
        this.playerPosition = position;
        this.previousPlayerPosition = position;
        // on dira que l'adversaire est a 89
        this.adversaryPosition = (AIplay === 1) ? "" : "";
        this.graph.updateNodeState(parseInt(this.adversaryPosition[0]) - 1, parseInt(this.adversaryPosition[1]) - 1, 2);
        return position;
    }
    minimaxInit(gameState, depth) {
        let alpha = Number.NEGATIVE_INFINITY;
        let beta = Number.POSITIVE_INFINITY;
        let maxEval = Number.NEGATIVE_INFINITY;
        let bestMove = null;
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
        let ownWalls = gameState.ownWalls;
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
        const startTime = performance.now();
        const bestMove = this.minimaxInit(gameState,2);
        const endTime = performance.now();
        //console.log("time", endTime - startTime);
        //console.log("bestMove", bestMove);
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
        if (this.ownWalls < 10) {
            for (const wall of wallPossible) {
                moves.push({
                    action: "wall",
                    value: wall
                });
            }
        }
        return moves;
    }
    simulateMove(move, gameStates) {
        if (move.action === "move") {
            this.graph.updateNodeState(parseInt(this.playerPosition[0]) - 1, parseInt(this.playerPosition[1]) - 1, 0);
            this.graph.updateNodeState(parseInt(move.value[0]) - 1, parseInt(move.value[1]) - 1, 1);
            gameStates.board[parseInt(this.playerPosition[0]) - 1][parseInt(this.playerPosition[1]) - 1] = 0;
            gameStates.board[parseInt(move.value[0]) - 1][parseInt(move.value[1]) - 1] = 1;
            this.previousPlayerPosition = this.playerPosition;
            this.playerPosition = move.value;
        } else if (move.action === "wall") {
            this.graph.isValidWallPlacement(parseInt(move.value[0][0]) - 1, parseInt(move.value[0][1]) - 1, move.value[1],this.adversaryPosition,this.playerPosition);
            this.graph.placeWall(parseInt(move.value[0][0]) - 1, parseInt(move.value[0][1]) - 1, move.value[1]);
            gameStates.ownWalls.push(move.value);
        }
    }
    undoMove(move, gameStates) {
        if (move.action === "move") {
            this.graph.updateNodeState(parseInt(this.previousPlayerPosition[0]) - 1, parseInt(this.previousPlayerPosition[1]) - 1, 1);
            this.graph.updateNodeState(parseInt(move.value[0]) - 1, parseInt(move.value[1]) - 1, 0);
            // update du gameStates
            gameStates.board[parseInt(this.previousPlayerPosition[0]) - 1][parseInt(this.previousPlayerPosition[1]) - 1] = 1;
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
        const distanceToAdversaryGoal = this.graph.distanceToGoal(this.opponent, this.adversaryPosition);
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
        this.ownWalls = ownWalls.count;
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

/*-------------------------------------------------------------------------------*/
let ai;
let position= ""
let move = {
    action: "",
    value: ""
}

let monChiffre;
let nombreWallMoi = 10;
let nombreWallAdversaire = 10;
let tourActuel = 1;
let trackerAdversaire = "";
let onAPoseUnMur = false;
let coordoneesDernierMur = "";
let positionPotentiellesDuBot = [];
let derniereActionMoi = "";

function isPlayerVisible(board){
    if(monChiffre === 1){
        for(let y = 8; y >= 0; y--){
            for(let x = 0; x <= 8; x++){
                if(board[y][x] === 2){
                    trackerAdversaire = (x+1).toString() + (y+1).toString();
                    return [true, x, y];
                }
            }
        }
        return [false, null, null];
    } else {
        for(let y = 0; y <= 8; y++){
            for(let x = 0; x <= 8; x++){
                if(board[y][x] === 2){
                    trackerAdversaire = (x+1).toString() + (y+1).toString();
                    return [true, x, y];
                }
            }
        }
    }
    return [false, null, null];
}


exports.setup = function setup(AIplay) {
    tourActuel++;
    monChiffre = AIplay;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            ai = new IA();
            position = ai.setup(AIplay);
            resolve(position);
        }, 1000);
    });
}

exports.nextMove = function nextMove(gameState){
    const move = {
        action: "",
        value: ""
    }

    let derniereActionJoueur;
    if(10 - gameState.opponentWalls.length !== nombreWallAdversaire){
        nombreWallAdversaire = 10 - gameState.opponentWalls.length;
        derniereActionJoueur = "wall";
    }
    return new Promise((resolve, reject) => {
        if(isPlayerVisible(gameState.board)[0] || (derniereActionJoueur === "wall" && trackerAdversaire !== "")){
            //console.log("isPlayerVisible");
            const move = ai.nextMove(gameState);
            if (move.action === "wall" && move.value[1] === 0) {
                nombreWallMoi--;
                onAPoseUnMur = true;
                derniereActionMoi = "wall";
                coordoneesDernierMur = move.value[0];
            }
            resolve(move);
        }else if(nombreWallMoi > 0){
            if(monChiffre === 1) {
                if(trackerAdversaire !== ""){
                    move.action = "wall";
                    let positionMur = trackerAdversaire[0] + (parseInt(trackerAdversaire[1])).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                } else if(tourActuel === 2) {
                    move.action = "wall";
                    move.value = ["78", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "78";
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                } else if (tourActuel === 3) {
                    move.action = "wall";
                    move.value = ["28", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "28";
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                }else if(positionPotentiellesDuBot.length > 0){
                    move.action = "wall";
                    let positionMur = positionPotentiellesDuBot[0][0] + (parseInt(positionPotentiellesDuBot[0][1])).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                } else {
                    const move = ai.nextMove(gameState);
                    if (move.action === "wall" && move.value[1] === 0) {
                        nombreWallMoi--;
                        onAPoseUnMur = true;
                        derniereActionMoi = "wall";
                        coordoneesDernierMur = move.value[0];
                    }
                    resolve(move);
                }
            } else if (monChiffre === 2){
                if(trackerAdversaire !== ""){
                    move.action = "wall";
                    let positionMur = trackerAdversaire[0] + (parseInt(trackerAdversaire[1]) + 1).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                } else if(tourActuel === 2){
                    move.action = "wall";
                    move.value = ["73", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "73";
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                } else if(tourActuel === 3) {
                    move.action = "wall";
                    move.value = ["23", 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = "23";
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                }else if(positionPotentiellesDuBot.length > 0){
                    move.action = "wall";
                    let positionMur = positionPotentiellesDuBot[0][0] + (parseInt(positionPotentiellesDuBot[0][1]) + 1).toString();
                    move.value = [positionMur, 0];
                    onAPoseUnMur = true;
                    coordoneesDernierMur = positionMur;
                    nombreWallMoi--;
                    derniereActionMoi = "wall";
                    resolve(move);
                } else {
                    const move = ai.nextMove(gameState);
                    if (move.action === "wall" && move.value[1] === 0) {
                        nombreWallMoi--;
                        onAPoseUnMur = true;
                        derniereActionMoi = "wall";
                        coordoneesDernierMur = move.value[0];
                    }
                    resolve(move);
                }
            }
        }else{
            const move = ai.nextMove(gameState);
            if (move.action === "wall" && move.value[1] === 0) {
                nombreWallMoi--;
                onAPoseUnMur = true;
                derniereActionMoi = "wall";
                coordoneesDernierMur = move.value[0];
            }
            resolve(move);
        }
        const end = performance.now();
        //console.log("nextMove", end - start);
    },200);
}
exports.correction = function correction(rightMove){
    //console.log("rightMove");
    //return a Promise that is resolved into the boolean true, indicating it is ready to continue
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(derniereActionMoi === "wall"){
                nombreWallMoi++;
                onAPoseUnMur = false;
                coordoneesDernierMur = "";
            }
            if(rightMove.action === "wall" && rightMove.value[1] === 0){
                nombreWallMoi--;
                onAPoseUnMur = true;
                coordoneesDernierMur = rightMove.value[0];
            }
            resolve(true);
        }, 50);
    });
}

function isPlayerDetectedByOurWall(positionMurX, positionMurY, board){
    positionMurX = positionMurX - 1;
    positionMurY = positionMurY - 1;
    let xToTest;
    let yToTest;
    if(board[positionMurX][positionMurY+1] === -1 && board[positionMurX+1][positionMurY+1] === -1){
        return [false, (positionMurX+1).toString()+(positionMurY+1+1).toString(), (positionMurX+1+1).toString()+(positionMurY+1+1).toString()];
    }else if(board[positionMurX+2][positionMurY] === -1 && board[positionMurX+2][positionMurY-1] === -1){
        return [false, (positionMurX+2+1).toString()+(positionMurY+1).toString(), (positionMurX+2+1).toString()+(positionMurY-1+1).toString()];
    } else if (board[positionMurX][positionMurY-2] === -1 && board[positionMurX+1][positionMurY-2] === -1){
        return [false, (positionMurX+1).toString()+(positionMurY-2+1).toString(), (positionMurX+1+1).toString()+(positionMurY-2+1).toString()];
    }else if(board[positionMurX-1][positionMurY] === -1 && board[positionMurX-1][positionMurY-1] === -1){
        return [false, (positionMurX-1+1).toString()+(positionMurY+1).toString(), (positionMurX-1+1).toString()+(positionMurY-1+1).toString()];
    }
    //Premier case que l'on test
    xToTest = positionMurX;
    yToTest = positionMurY + 1;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest + 1;

            let xPotentiel2 = xToTest-1;
            let yPotentiel2 = yToTest;

            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, (xPotentiel2+1).toString()+(yPotentiel2+1).toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, (xPotentiel1+1).toString()+(yPotentiel1+1).toString(), null];
            } else {
                return [false, (xPotentiel1+1).toString()+(yPotentiel1+1).toString(), (xPotentiel2+1).toString()+(yPotentiel2+1).toString()];
            }
        }
    }
    //Deuxième case que l'on test
    xToTest = positionMurX+1 ;
    yToTest = positionMurY+1 ;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){
            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest +1;

            let xPotentiel2 = xToTest+1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, (xPotentiel2+1).toString()+(yPotentiel2+1).toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, (xPotentiel1+1).toString()+(yPotentiel1+1).toString(), null];
            } else {
                return [false, (xPotentiel1+1).toString()+(yPotentiel1+1).toString(), (xPotentiel2+1).toString()+(yPotentiel2+1).toString()];
            }
        }
    }
    //Troisième case que l'on test
    xToTest = positionMurX+2;
    yToTest = positionMurY;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest +1;

            let xPotentiel2 = xToTest+1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }
    //Quatrième case que l'on test
    xToTest = positionMurX+2;
    yToTest = positionMurY-1;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest -1;

            let xPotentiel2 = xToTest+1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }
    //Cinquième case que l'on test
    xToTest = positionMurX+1;
    yToTest = positionMurY-2;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest+1;
            let yPotentiel1 = yToTest;

            let xPotentiel2 = xToTest;
            let yPotentiel2 = yToTest-1;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }
    //Sixième case que l'on test
    xToTest = positionMurX;
    yToTest = positionMurY-2;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest-1;
            let yPotentiel1 = yToTest;

            let xPotentiel2 = xToTest;
            let yPotentiel2 = yToTest-1;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }
    //Septième case que l'on test
    xToTest = positionMurX-1;
    yToTest = positionMurY-1;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest-1;

            let xPotentiel2 = xToTest-1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }
    //Huitième case que l'on test
    xToTest = positionMurX-1;
    yToTest = positionMurY;
    if(xToTest >=0 && xToTest<=8 && yToTest >=0 && yToTest<=8){
        if(board[xToTest][yToTest] === -1){

            let xPotentiel1 = xToTest;
            let yPotentiel1 = yToTest+1;

            let xPotentiel2 = xToTest-1;
            let yPotentiel2 = yToTest;
            if(yPotentiel1 > 8 || yPotentiel1 <0 || xPotentiel1 < 0 || xPotentiel1 > 8){ //case impossible donc on a plus qu'une case qui est bloquante et c'est le bloc
                return [true, xPotentiel2.toString()+yPotentiel2.toString(), null];
            } else if(yPotentiel2 > 8 || yPotentiel2 <0 || xPotentiel2 < 0 || xPotentiel2 > 8){
                return [true, xPotentiel1.toString()+yPotentiel1.toString(), null];
            } else {
                return [false, xPotentiel1.toString()+yPotentiel1.toString(), xPotentiel2.toString()+yPotentiel2.toString()];
            }
        }
    }
    return [false, null, null];
}

exports.updateBoard = function updateBoard(gameState){
    //console.log("updateBoard");
    //return a Promise resolved into the boolean true in 50ms maximum.
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            ai.updateBoard(gameState);
            if(isPlayerVisible(gameState.board)[0]){
                trackerAdversaire = isPlayerVisible(gameState.board)[1].toString() + isPlayerVisible(gameState.board)[2].toString();
                positionPotentiellesDuBot = [];
                positionPotentiellesDuBot.push(trackerAdversaire);
                //console.log("ON A VU LE JOUEUR");
            } else {
                if(onAPoseUnMur){
                    let answer = isPlayerDetectedByOurWall(parseInt(coordoneesDernierMur[0]), parseInt(coordoneesDernierMur[1]), gameState.board);
                    if(answer[0]){
                        //console.log("PAS VU MAIS TROUVE");
                        trackerAdversaire = answer[1][1] + answer[1][0];
                    }else if(answer[1] !== null && answer[2] !== null) {
                        //console.log("POTENTIELLEMENT");
                        positionPotentiellesDuBot = [];
                        positionPotentiellesDuBot.push(answer[1][1] + answer[1][0]);
                        positionPotentiellesDuBot.push(answer[2][1] + answer[2][0]);
                    }
                }
            }
            onAPoseUnMur = false;
            tourActuel++;
            resolve(true);
        }, 50);
    });
}

/*-------------------------------------------------------------------------------*/

module.exports = { Node, Graph, PriorityQueue, NodeWall};