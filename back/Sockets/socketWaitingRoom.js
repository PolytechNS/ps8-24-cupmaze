const {Server} = require("socket.io");
const {createGame, get} = require("../database/mongo.js");
const {Game} = require("../logic/Game");
const jwt = require('jsonwebtoken');
const {getUser} = require("../database/mongo");

function createSocket(io) {
    //const io = new Server(server);
    const rooms = [];
    let waitingPlayers = new Map();

    const WaitingRoomNamespace = io.of("/api/waitingRoom");

        WaitingRoomNamespace.on("connection", (socket) => {
            console.log("a user " + socket.id +" connected");

            socket.on("waiting_room", async (playerToken) => {
                console.log("user " + socket.id + " is in the waiting room");
                try {
                    console.log("playerToken", playerToken);
                    const email = jwt.verify(playerToken, 'secret').email;
                    console.log("email", email);
                    const user = await getUser(email);
                    console.log("user", user);
                    if (!user) {
                        console.log("user not found");
                        return;
                    }
                    if (!waitingPlayers.has(playerToken)) {
                        waitingPlayers.set(playerToken, { userName: user.username, socketId: socket.id });
                    }
                    console.log("waiting players", waitingPlayers);
                    if (waitingPlayers.size >= 2) {
                        const players = Array.from(waitingPlayers.values());
                        const room = {
                            name: "room_" + players[0].userName + "_" + players[1].userName,
                            players: players
                        };
                        rooms.push(room);
                        console.log("room created", room.name);
                        // on retire les joueurs de la liste des joueurs en attente
                        waitingPlayers.delete(playerToken);
                        waitingPlayers.delete(players[0].socketId);
                        waitingPlayers.delete(players[1].socketId);
                        startGame(room);
                    }
                } catch (e) {
                    console.log(e);
                }


            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
                // on retire le joueur de la liste des joueurs en attente
                waitingPlayers.forEach((value, key) => {
                    console.log("value", value, "key", key);
                    console.log("socket.id", socket.id, "value.socketId", value.socketId);
                    if (value.socketId === socket.id) {
                        waitingPlayers.delete(key);
                    }
                });
            });
        });

    function startGame(room) {
        console.log('starting game');
        const players = room.players;


        const newGame = new Game()

        players.forEach((player) => {
            const playerSocketId = waitingPlayers.get(player).socketId;
            WaitingRoomNamespace.to(playerSocketId).emit('startGame', room.name);
        });
    }

}

module.exports = {createSocket};