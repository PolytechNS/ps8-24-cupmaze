const {Server} = require("socket.io");
const {createGame, get} = require("../database/mongo.js");
const {Game} = require("../logic/Game");
const jwt = require('jsonwebtoken');
const {getUser, clearGameDb} = require("../database/mongo");

const rooms = [];
function createSocket(io) {
    //const io = new Server(server);

    let waitingPlayers = new Map();

    const WaitingRoomNamespace = io.of("/api/waitingRoom");
        WaitingRoomNamespace.on("connection", (socket) => {
            console.log("a user " + socket.id +" connected");

            socket.on("waiting_room", async (playerToken) => {
                console.log("user " + socket.id + " is in the waiting room");
                try {
                    const email = jwt.verify(playerToken, 'secret').email;
                    const user = await getUser(email);
                    console.log("user", user._id);
                    if (!user) {
                        console.log("user not found");
                        return;
                    }
                    if (!waitingPlayers.has(playerToken)) {
                        waitingPlayers.set(playerToken, { userId: user._id, userName: user.username, socket: socket });
                    }
                    console.log("waiting players", waitingPlayers.size);
                    if (waitingPlayers.size >= 2) {
                        const tokens = Array.from(waitingPlayers.keys())[0];
                        const players = Array.from(waitingPlayers.values());
                        const playerIds = Array.from(waitingPlayers.values()).map(player => player.userId);
                        const room = {
                            name: "room_" + players[0].userName + "_" + players[1].userName,
                            playersId: playerIds,
                            players: players,
                            tokens: tokens
                        };
                        // chaque joueur rejoint la room
                        players[0].socket.join(room.name);
                        players[1].socket.join(room.name);
                        console.log("room created", room.name);

                        rooms.push(room);
                        // on retire les joueurs de la liste des joueurs en attente
                        waitingPlayers.delete(playerToken);
                        waitingPlayers.delete(tokens);
                        console.log("waiting players", waitingPlayers.size);
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
                    console.log("socket.id", socket.id, "value.socketId", value.id);
                    if (value.id === socket.id) {
                        waitingPlayers.delete(key);
                    }
                });
            });
        });

    async function startGame(room) {
        console.log('starting game');
        const players = room.players;
        const game = new Game();
        const matchInfo = {
            roomName: room.name,
            opponent: players[1].userName,
            opponentId: players[1].userId,
        };
        WaitingRoomNamespace.to(room.name).emit('matchFound', matchInfo);
    }
}

module.exports = {createSocket};
module.exports.rooms = rooms;