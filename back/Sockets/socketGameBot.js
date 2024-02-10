const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");
const { Game } = require("../logic/Game.js");
const {beginningPositionIsValid} = require("../logic/movePlayerReferee");

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

        socket.on("choosePositionToBegin", (cellId) => {
            console.log("choosePositionToBegin", cellId);
            const x = parseInt(cellId.split("-")[0]);

            var res = beginningPositionIsValid(game.currentPlayer, x);
            console.log("res", res);
            gameNamespace.emit("beginningPositionIsValid", res);
        });

        socket.on("validateRound", (msg) => {
            const playerPosition = game.playerPosition;
            console.log("playerPosition", playerPosition.player2);
            let possibleMoves = game.getPossibleMoves(playerPosition.player2);
            const numberTour = game.numberTour;
            const currentplayer = game.currentPlayer;
            const nbWallsPlayer1 = game.nbWallsPlayer1;
            const nbWallsPlayer2 = game.nbWallsPlayer2;

            console.log("validateRound", msg);
            gameNamespace.emit("numberTour", numberTour);

            // on demande à l'IA de jouer
            let newAIPosition = AIEasy.computeMove(possibleMoves);
            game.currentPlayer = 2
            console.log("newAIPosition", newAIPosition);
            gameNamespace.emit("positionAI", newAIPosition, currentplayer);

            // on met à jour la position de l'IA
            game.playerPosition.player2 = newAIPosition;

            // on verifie si la partie est finie
            const winner = game.isGameOver(game.playerPosition);
            if (winner !== 0) {
                gameNamespace.emit("gameOver", winner);
                return;
            }

            game.currentPlayer = 1;
            game.numberTour++;
            game.actionsToDo = 1;

            console.log("numberTour", numberTour);
            gameNamespace.emit("numberTourAfter", numberTour);

            game.lastPlayerPosition = game.playerPosition;

            if (numberTour > 1) {
                possibleMoves = game.getPossibleMoves(playerPosition.player1);
            }

            conspole.log("possibleMoves", possibleMoves);
            console.log("playerPosition", playerPosition);
            gameNamespace.emit("updateRound",
                possibleMoves, numberTour,
                playerPosition, currentplayer,
                nbWallsPlayer1, nbWallsPlayer2);
        });
    });
}

module.exports = {
    createSocket
};