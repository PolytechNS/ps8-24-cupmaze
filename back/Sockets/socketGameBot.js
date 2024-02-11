const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");
const { Game } = require("../logic/Game.js");
const { getGame, createGame} = require("../database/mongo");

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

        socket.on("saveGame", (msg)=>{
            getGame(msg).then((savedGame) => {
                if (savedGame) {
                    // TODO si l'utilisateur a déjà une partie sauvegardée il faut voir s'il veut l'écraser ou pas
                }
                game.setUserEmail(msg);
                console.log("userEmail received was : "+msg)
                createGame(JSON.parse(JSON.stringify(game.toJSON()))).then(() => {
                    socket.emit("goBackToMenu",true);
                });
            });
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}

module.exports = {
    createSocket
};