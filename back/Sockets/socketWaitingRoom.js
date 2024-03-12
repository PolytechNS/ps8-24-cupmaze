const jwt = require('jsonwebtoken');
const {getUser, clearGameDb} = require("../database/mongo");
const matchmaking = require("./matchmaking.js");
const {Game} = require("../logic/Game");

const rooms = [];
let playersWithRooms = {};
let boardState = {};
function createSocket(io) {
    //const io = new Server(server);
    //let waitingPlayers = new Map();

    const WaitingRoomNamespace = io.of("/api/waitingRoom");
        WaitingRoomNamespace.on("connection", (socket) => {
            console.log("a user " + socket.id +" connected");
            let currentRoomId = null;

            socket.on("waiting_room", async (playerToken) => {
                console.log("user " + socket.id + " is in the waiting room");
                const user = await getUser(jwt.verify(playerToken, 'secret').email);
                if (!user) {
                    console.log("user not found");
                    return;
                }
                currentRoomId = user._id;
                await initMatchmaking(socket, playerToken);
            });

            socket.on("disconnect", () => {
                console.log("user " + socket.id + " disconnected from waiting room " + currentRoomId);
                if (currentRoomId === null) {
                    return;
                }
                console.log("removing " + currentRoomId + " from waiting room");
                matchmaking.remove(currentRoomId);
            });


            socket.on('setupGame', token =>
                socket.on('joinRoom', (room) => {
                    initRoom(socket, token, room).then(r => {
                        console.log('room joined', room);
                    });
            }));
            playGame(socket);
        });

    // cherche a associer un joueur a une room
    async function initMatchmaking(socket, token) {
        console.log("setupGame", token);
        const user = await getUser(jwt.verify(token, 'secret').email);
        if (!user) {
            console.log("user not found");
            return;
        }
        socket.join(user._id);
        let match = await matchmaking.joinWaitingRoom(user._id, user.username);
        if (!match) {
            console.log("no match found");
            return;
        }

        console.log("match found " + match.username + " vs " + user.username);
        WaitingRoomNamespace.to(user._id).emit('matchFound', {
            'opponent': match.username,
            'opponentId': match.id,
            'room' : user._id
        });
        WaitingRoomNamespace.to(match.id).emit('matchFound', {
            'opponent': user.username,
            'opponentId': user._id,
            'room' : user._id
        });
        playersWithRooms[user._id] = {
            'player1': user._id,
            'player2': match.id
        };
    }

    // initialise le jeu pour une id de room donnée
    async function initRoom(socket, token, roomId) {
        socket.join(roomId);
        console.log('room joined', roomId);
        // on verifie le token founi dans gameParams
        let user;
        try {
            user = await getUser(jwt.verify(token, 'secret').email);
        } catch (e) {
            console.log(e);
        }
        if (!user) {
            console.log("user not found");
            return;
        }
        console.log("user", user._id);
        // on a verifier que le joueur est bien dans la room maintenant on peut initialiser le jeu
        if (!boardState[roomId]) {
            boardState[roomId] = {
                'player1': null,
                'player2': null,
                'game': new Game()
            };
        }
        WaitingRoomNamespace.to(roomId).emit('gameInitialized', boardState[roomId]);
    }

    // on ecoute les evenements du jeu
    function playGame(socket) {
        socket.on("choosePositionToBegin", (position) => {
            console.log("choosePositionToBegin", position);
        });

        socket.on("movePlayer", (position) => {
            console.log("movePlayer", position);
        });

        socket.on("layWall", (position) => {
            console.log("layWall", position);
        });
    }
}


module.exports = {createSocket};
module.exports.rooms = rooms;