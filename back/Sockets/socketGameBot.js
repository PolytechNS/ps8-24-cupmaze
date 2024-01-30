const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");

/**
 * Cette fonction va servir pour pouvoir créer le socket qui correspond à quand on va vouloir initialiser une partie entre le bot et un joueur en local
 * Cette fonction est appelée dans le fichier "index.js" pour l'initialiser en attendant une connexion d'un client
 * @param server
 */
function createSocket(server){
    //On passe en paramètre le serveur que l'on reçoit en paramètre de la fonction
    const io = new Server(server);
    io.on("connection", (socket) => {
        console.log("a user connected");

        //Quand on reçoit un message "newMove" alors on doit demander à l'IA de jouer et on envoie le résultat au client (io.emit)
        socket.on("newMove", (msg) => {
            console.log("Player1 make a new movement, we will compute the AI's move and send it back to the client");
            let newPosition = AIEasy.computeMove(msg);
            io.emit("updatedBoard", newPosition);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}

module.exports = {
    createSocket
};