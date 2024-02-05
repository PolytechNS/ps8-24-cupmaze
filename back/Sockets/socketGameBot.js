const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");
const Game = require("../logic/Game.js");

/**
 * Cette fonction va servir pour pouvoir créer le socket qui correspond à quand on va vouloir initialiser une partie entre le bot et un joueur en local
 * Cette fonction est appelée dans le fichier "index.js" pour l'initialiser en attendant une connexion d'un client
 * @param server
 */

function createSocket(server) {
    const io = new Server(server);

    const gameNamespace = io.of("/api/game");
    gameNamespace.on("connection", (socket) => {
        console.log("a user connected");

        let game = new Game();

        socket.on("newMove", (msg) => {
            console.log("Player1 makes a new movement, computing AI's move and sending it back to the client");
            let newPosition = AIEasy.computeMove(msg);
            gameNamespace.emit("updatedBoard", newPosition);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}

module.exports = {
    createSocket
};