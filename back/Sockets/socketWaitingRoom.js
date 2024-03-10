const {Server} = require("socket.io");

function createSocket(io) {
    //const io = new Server(server);
    const rooms = [];
    let waitingPlayers = new Map();

    const WaitingRoomNamespace = io.of("/api/waitingRoom");

        WaitingRoomNamespace.on("connection", (socket) => {
            console.log("a user " + socket.id +" connected");

            socket.on("waiting_room", (playerToken) => {
                console.log("user " + socket.id + " is in the waiting room");

                // si le joueur n'est pas déjà dans la liste des joueurs en attente, on l'ajoute
                if (!waitingPlayers.has(playerToken)) {
                    waitingPlayers.set(playerToken, socket.id);
                }
                console.log("token", playerToken);
                // on regarde si on a 2 joueurs en attente
                if (waitingPlayers.size >= 2) {
                    const players = Array.from(waitingPlayers.values());
                    const room = {
                        name: "room_" + players[0] + "_" + players[1],
                        players: players
                    };
                    rooms.push(room);
                    console.log("room created", room.name);
                    // on retire les joueurs de la liste des joueurs en attente
                    waitingPlayers.delete(playerToken);
                    waitingPlayers.delete(players[0]);
                    waitingPlayers.delete(players[1]);
                    startGame(room);
                }

            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
                // on retire le joueur de la liste des joueurs en attente
                waitingPlayers.forEach((value, key) => {
                    if (key === socket.id) {
                        waitingPlayers.delete(key);
                    }
                });
            });
        });

    function startGame(room) {
        console.log('starting game');
        const players = room.players;
        players.forEach((player) => {
            WaitingRoomNamespace.to(player).emit('startGame', room.name);
        });
    }

}

module.exports = {createSocket};