const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");
const { Game } = require("../logic/Game.js");

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
        const game = new Game();


        //TODO
        socket.on("isMoveValid", (msg) => {
            console.log("On vérifie si le mouvement est valide");
            let caseWanted = game.retrieveCase(msg[0], msg[2]);
            let answer = game.moveIsPossible(caseWanted);
            if(!answer) console.log("[-] Le mouvement n'est pas valide");
            gameNamespace.emit("moveIsValid", answer);
        });

        //TODO
        socket.on("newMovePlayer1", (msg) => {
            console.log("Appliquer le nouveau mouvement au joueur 1");
            let caseWanted = game.retrieveCase(msg[0], msg[2]);
            let answer = game.movePlayer(caseWanted);
            gameNamespace.emit("isPlayer1Mooved", answer);
        });

        //TODO
        socket.on("putAWall", (msg) => {
            console.log("On applique un nouveau mur");
        });

        socket.on("NewTurn", (msg) => {
            console.log("On change de tour");
            game.validateRound();
        });

        socket.on("newMove", (msg) => {
            console.log("On demande à l'IA de jouer maintenant");
            let newPosition = AIEasy.computeMove(msg);
            gameNamespace.emit("updatedBoard", newPosition);
        });

        socket.on("undoPosition", (msg) => {
            console.log("On a fait un undo sur une position");
            game.undoPosition();
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}

module.exports = {
    createSocket
};