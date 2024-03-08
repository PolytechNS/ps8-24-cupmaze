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
        this.wallRepresentation = Array.from(this.walls.values()).map(wall => wall.extractListRepresentation()).flat();
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
        // on supprime les murs de la representation
        this.wallRepresentation = this.wallRepresentation.filter(wall => wall[0] !== `${colonne+1}${ligne+1}`);
    }
    removeAdjacentWallRepresentation(colonne,ligne,orientation) {
        if (orientation === 0) {
            // on retire de la repentation le mur mur avec wall[0] = (colonne-1,ligne) et wall[1] = 0
            if (colonne > 0 && colonne < 8) {
                for (let i = 0; i < this.wallRepresentation.length; i++) {
                    if (this.wallRepresentation[i][0] === `${colonne}${ligne + 1}` && this.wallRepresentation[i][1] === 0
                        || this.wallRepresentation[i][0] === `${colonne + 2}${ligne + 1}` && this.wallRepresentation[i][1] === 0) {
                        this.wallRepresentation.splice(i, 1);
                    }
                }
            }
            if (colonne === 0) {
                for (let i = 0; i < this.wallRepresentation.length; i++) {
                    if (this.wallRepresentation[i][0] === `${colonne + 2}${ligne + 1}` && this.wallRepresentation[i][1] === 0) {
                        this.wallRepresentation.splice(i, 1);
                    }
                }
            }
            if (colonne === 8) {
                for (let i = 0; i < this.wallRepresentation.length; i++) {
                    if (this.wallRepresentation[i][0] === `${colonne}${ligne + 1}` && this.wallRepresentation[i][1] === 0) {
                        this.wallRepresentation.splice(i, 1);
                    }
                }
            }
        }
        if (orientation === 1) {
            // on retire de la repentation le mur mur avec wall[0] = (colonne,ligne-1) et wall[1] = 0
            if (ligne > 0 && ligne < 8) {
                for (let i = 0; i < this.wallRepresentation.length; i++) {
                    if (this.wallRepresentation[i][0] === `${colonne}${ligne}` && this.wallRepresentation[i][1] === 1) {
                        this.wallRepresentation.splice(i, 1);
                    }
                }
            }
        }
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
            console.log("invalid wall orientation");
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
            this.removeAdjacentWallRepresentation(colonne,ligne,orientation);
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
        return this.wallRepresentation;
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

class AI {

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
        const position = (AIplay === 1) ? "51" : "59";
        this.graph.updateNodeState(parseInt(position[0]) - 1, parseInt(position[1]) - 1, 1);
        this.playerPosition = position;
        this.previousPlayerPosition = position;
        this.adversaryPosition = (AIplay === 1) ? "" : "";
        this.graph.updateNodeState(parseInt(this.adversaryPosition[0]) - 1, parseInt(this.adversaryPosition[1]) - 1, 2);
        return position;
    }

    nextMove(gameState) {
        // si la position de l'adversaire n'est pas connue j'avance le plus proche du goal
        if (this.adversaryPosition === "") {
            const nextMove = this.nextMoveToGoal(this.playerPosition);
            this.graph.updateNodeState(parseInt(nextMove[0]) - 1, parseInt(nextMove[1]) - 1, 1);
            this.previousPlayerPosition = this.playerPosition;
            this.playerPosition = nextMove;
            return nextMove;
        }

    }

}