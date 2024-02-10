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

        socket.on("newMove", (msg) => {
            console.log("On demande à l'IA de jouer maintenant");
            let newPosition = AIEasy.computeMove(msg);
            gameNamespace.emit("updatedBoard", newPosition);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });

        socket.on("isGameOver", () => {
            console.log("On demande à l'IA si la partie est terminée");
            let answer = game.isGameOver();
            gameNamespace.emit("gameOver", answer[0], answer[1]);
        });

        socket.on("newMoveHumanIsPossible", async (positionY, positionX) => {
            let possibleMoves = await game.getPossibleMoves(game.getPlayerCurrentPosition(1));
            let caseWanted = await game.getCase(positionY, positionX);
            let isPossible = possibleMoves.includes(caseWanted);
            if (isPossible){
                let saveOldPosition = game.getPlayerCurrentPosition(1);
                game.movePlayer(1, caseWanted, game.getPlayerCurrentPosition(1));
                if (saveOldPosition !== null) gameNamespace.emit("isNewMoveHumanIsPossible", isPossible, saveOldPosition.translateHTMLCase(), game.getPlayerCurrentPosition(1).translateHTMLCase());
                else gameNamespace.emit("isNewMoveHumanIsPossible", isPossible, null, game.getPlayerCurrentPosition(1).translateHTMLCase());
            }
        });
    });
}

module.exports = {
    createSocket
};