import {extractWallInfo, findAdjacentWall} from "./utils.js";
export {Graph};

class Graph {
    constructor() {
        this.vertices = {};
    }

    addVertex(vertex) {
        this.vertices[vertex] = [];
    }

    addEdge(vertex1, vertex2) {
        this.vertices[vertex1].push(vertex2);
        this.vertices[vertex2].push(vertex1);
    }

    removeEdge(vertex1, vertex2) {
        if (this.vertices[vertex1] && this.vertices[vertex2]) {
            this.vertices[vertex1] = this.vertices[vertex1].filter(neighbor => neighbor !== vertex2);
            this.vertices[vertex2] = this.vertices[vertex2].filter(neighbor => neighbor !== vertex1);
        } else {
            console.log("no vertex " + vertex1 + " and/or " + vertex2);
        }
    }

    initializeEdges() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (i !== 0) this.addEdge(i + "-" + j, (i - 1) + "-" + j);
                if (j !== 0) this.addEdge(i + "-" + j, i + "-" + (j - 1));
            }
        }
    }


    addWall(wallPosition,wallType){
        if(wallType==="wh"){
            const cellAboveVertex=wallPosition;
            const cellBelowVertex=(parseInt(wallPosition[0])+1)+"-"+wallPosition[2];
            this.removeEdge(cellAboveVertex,cellBelowVertex)
        }
        else if(wallType==="wv"){
            const cellLeftVertex=wallPosition;
            const cellRightVertex=wallPosition[0]+"-"+(parseInt(wallPosition[2])+1);
            this.removeEdge(cellLeftVertex,cellRightVertex)
        }
    }

    removeWall(wallPosition,wallType){
        if(wallType==="wh"){
            const cellAboveVertex=wallPosition;
            const cellBelowVertex=(parseInt(wallPosition[0])+1)+"-"+wallPosition[2];
            this.addEdge(cellAboveVertex,cellBelowVertex)
        }
        else if(wallType==="wv"){
            const cellLeftVertex=wallPosition;
            const cellRightVertex=wallPosition[0]+"-"+(parseInt(wallPosition[2])+1);
            this.addEdge(cellLeftVertex,cellRightVertex)
        }
    }

    checkAndAdd(enemyPosition,currentPlayer,wallType,wallPosition) {
        const enemyFinishLine=currentPlayer===1? "0":"8";

        const firstWall=wallPosition[0]+"-"+wallPosition[1];
        const secondWallPosition=extractWallInfo(findAdjacentWall(wallType,wallPosition).id).wallPosition;
        const secondWall=secondWallPosition[0]+"-"+secondWallPosition[1];

        this.addWall(firstWall,wallType);
        this.addWall(secondWall,wallType);

        const visited = {};
        const queue = [];

        // Initialiser les nœuds visités à false
        Object.keys(this.vertices).forEach(vertex => {
            visited[vertex] = false;
        });

        // Ajouter le nœud de départ à la file d'attente et le marquer comme visité
        queue.push(enemyPosition);
        visited[enemyPosition] = true;

        while (queue.length > 0) {
            // Retirer un nœud de la file d'attente et l'afficher
            const currentNode = queue.shift();

            // if condition is true then we have traveled from enemy player position to enemy finish line
            if(currentNode[0]===enemyFinishLine) {
                return true;
            }

            // Parcourir les voisins du nœud actuel
            this.vertices[currentNode].forEach(neighbor => {
                // Si le voisin n'a pas été visité, l'ajouter à la file d'attente et le marquer comme visité
                if (!visited[neighbor]) {
                    queue.push(neighbor);
                    visited[neighbor] = true;
                }
            });
        }
        this.removeWall(firstWall,wallType);
        this.removeWall(secondWall,wallType);
        console.log("Couldn't find path");
        return false;
    }

}