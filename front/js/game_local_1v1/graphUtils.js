import {extractWallInfo, findAdjacentWall} from "./utils.js";

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
                if (i !== 8) this.addEdge(i + "-" + j, (i + 1) + "-" + j);
                if (j !== 0) this.addEdge(i + "-" + j, i + "-" + (j - 1));
                if (j !== 8) this.addEdge(i + "-" + j, i + "-" + (j + 1));
            }
        }
    }
}