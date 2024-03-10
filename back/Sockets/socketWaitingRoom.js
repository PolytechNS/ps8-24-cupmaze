const {Server} = require("socket.io");

function createSocket(io) {
    //const io = new Server(server);
    const rooms = [];
    let waitingPlayers = []

    const WaitingRoomNamespace = io.of("/api/waitingRoom");

        WaitingRoomNamespace.on("connection", (socket) => {
            console.log("a user " + socket.id +" connected");

            socket.on("waiting_room", () => {
                console.log("user " + socket.id + " is in the waiting room");

                // si le joueur n'est pas déjà dans la liste des joueurs en attente, on l'ajoute
                if (!waitingPlayers.includes(socket)) {
                    waitingPlayers.push(socket);
                }
                // on regarde si on a 2 joueurs en attente
                if (waitingPlayers.length >= 2) {
                    // on recupère les 2 premiers joueurs
                    const player1 = waitingPlayers.shift();
                    const player2 = waitingPlayers.shift();
                    const room = "room_" + player1.id + "_" + player2.id;
                    player1.join(room);
                    player2.join(room);
                    rooms.push(room);
                    console.log('room created', room);
                    startGame(room);
                }

            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
                waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
            });
        });




    function startGame(room) {
        console.log('starting game');
        WaitingRoomNamespace.in(room).emit('startGame', room);
    }

}

module.exports = {createSocket};