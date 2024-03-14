const jwt = require('jsonwebtoken');
const {getUser, clearGameDb, decodeJWTPayload} = require("../database/mongo");
const matchmaking = require("./matchmaking.js");
const {Game} = require("../logic/Game");

const rooms = [];
let playersWithRooms = {};
let GameState = {};
function createSocket(io) {
    //const io = new Server(server);
    //let waitingPlayers = new Map();

    const WaitingRoomNamespace = io.of("/api/waitingRoom");
        WaitingRoomNamespace.on("connection", (socket) => {
            console.log("a user " + socket.id +" connected");
            let currentRoomId = null;

            socket.on("waiting_room", async (playerToken) => {
                console.log("user " + socket.id + " is in the waiting room");
                const userDB = await getUser(jwt.verify(playerToken, 'secret').email);
                if (!userDB) { return; }
                const user = decodeJWTPayload(playerToken);
                currentRoomId = user.id;
                await initMatchmaking(socket, playerToken);
            });

            socket.on("disconnect", () => {
                console.log("user " + socket.id + " disconnected from waiting room " + currentRoomId);
                if (currentRoomId === null) { return; }
                console.log("WaitingRoomSocket: removing " + currentRoomId + " from waiting room");
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
        const userDB = await getUser(jwt.verify(token, 'secret').email);
        if (!userDB) { return; }
        let user = decodeJWTPayload(token);
        socket.join(user.id);
        let match = await matchmaking.joinWaitingRoom(user.id, user.username);
        if (!match) { return; }

        console.log("match found " + match.username + " vs " + user.username);
        WaitingRoomNamespace.to(user.id).emit('matchFound', {
            'opponent': match.username,
            'opponentId': match.id,
            'room' : user.id
        });
        WaitingRoomNamespace.to(match.id).emit('matchFound', {
            'opponent': user.username,
            'opponentId': user.id,
            'room' : user.id
        });
        playersWithRooms[user.id] = {
            'player1': user.id,
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
        // on a verifier que le joueur est bien dans la room maintenant on peut initialiser le jeu
        let playerNumber;
        if (!GameState[roomId]) {
            playerNumber = 1;
            GameState[roomId] = {
                'player1': user.id,
                'player2': null,
                'game': new Game()
            };
        } else {
            playerNumber = 2;
            GameState[roomId].player2 = user.id;
        }
        // on envoie les informations du jeu a tout les joueurs dans la room
        WaitingRoomNamespace.to(roomId).emit('game', GameState[roomId], playerNumber);
    }

    // on ecoute les evenements du jeu
    function playGame(socket) {

        socket.on("askForPlayerNumber", (token) => {
            let user = decodeJWTPayload(token);
            console.log("askForPlayerNumber: ", user);
            let room = playersWithRooms[user.id];
            let playerNumber;
            if (!room) {
                playerNumber = 1;
                console.log("askForPlayerNumber", playerNumber);
                WaitingRoomNamespace.to(user.id).emit("playerNumber", playerNumber);
                return;
            }
            playerNumber = 2;
            console.log("askForPlayerNumber", playerNumber);
            // on envoie le numero du joueur a tout les joueurs dans la room
            WaitingRoomNamespace.to(room.player1).emit('playerNumber', playerNumber);
        })

        socket.on("choosePositionToBegin", (data) => {
            console.log("choosePositionToBegin", data);
            let roomId = data.roomId; // room id
            let cellId = data.cellId; // cell id
            let gameState = GameState[roomId];
            if (!gameState || !roomId || !cellId) { return; }

            let token = data.token;

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