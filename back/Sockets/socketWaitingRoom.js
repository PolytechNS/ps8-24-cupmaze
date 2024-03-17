const jwt = require('jsonwebtoken');
const {getUser, clearGameDb, decodeJWTPayload} = require("../database/mongo");
const matchmaking = require("./matchmaking.js");
const {Game} = require("../logic/Game");
const {beginningPositionIsValid} = require("../logic/movePlayerReferee");

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
        user = decodeJWTPayload(token);
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

        let activePlayer = 1;
        socket.on("choosePositionToBegin", (data) => {
            console.log("choosePositionToBegin");
            let roomId = data.roomId; // room id
            let cellId = data.cellId; // cell id
            let token = data.tokens; // token
            let gameState = GameState[roomId];
            let user = decodeJWTPayload(token);
            if (!gameState || !roomId || !cellId) { return; }

            if (gameState.game.currentPlayer === 1 && user.id === roomId
            || gameState.game.currentPlayer === 2 && user.id !== roomId) {
                const colonne = parseInt(cellId.split("-")[0]);
                const ligne = parseInt(cellId.split("-")[1]);
                var res = beginningPositionIsValid(gameState.game.currentPlayer, ligne);

                WaitingRoomNamespace.emit('beginningPositionIsValid', res);
                console.log("beginningPositionIsValid", res);
                if (res === false) { return; }
                if (gameState.game.actionsToDo === 0) {
                    WaitingRoomNamespace.emit('checkAction',true);
                    return;
                }
                if (gameState.game.currentPlayer === 1) {
                    gameState.game.playerPosition.player1 = [colonne, ligne];
                } else {
                    gameState.game.playerPosition.player2 = [colonne, ligne];
                }

                const caseWanted = gameState.game.getCase(colonne, ligne);
                caseWanted.setIsOccupied(true);
                console.log("caseWanted", caseWanted +" current player", gameState.game.currentPlayer);
                WaitingRoomNamespace.to(roomId).emit('currentPlayer', gameState.game.currentPlayer, gameState.game.playerPosition.player2);
                gameState.game.actionsToDo--;
                gameState.game.lastPlayerPosition = "position";
            }
        });

        socket.on("movePlayer", (data) => {
            let roomId = data.roomId; // room id
            let cellId = data.cellId; // cell id
            let token = data.tokens; // token
            let gameState = GameState[roomId];
            let user = decodeJWTPayload(token);
            if (!gameState || !roomId || !cellId) { return; }

        });

        socket.on("layWall", (position) => {
            console.log("layWall", position);
        });

        socket.on("validateRound", (data) => {
            console.log("validateRound");
            let roomId = data.roomId; // room id
            let token = data.tokens; // token
            let gameState = GameState[roomId];
            let user = decodeJWTPayload(token);
            if (!gameState || !roomId) { return; }

            if (gameState.game.currentPlayer === 1 && user.id === roomId ||
                gameState.game.currentPlayer === 2 && user.id !== roomId) {

            gameState.game.currentPlayer = gameState.game.currentPlayer === 1 ? 2 : 1;
            gameState.game.actionsToDo = 1;
            gameState.game.numberTour++;

            const winner = gameState.game.isGameOver(gameState.game.playerPosition);
            if (winner[0]) {
                WaitingRoomNamespace.to(roomId).emit('gameOver', winner);
                return;
            }

            WaitingRoomNamespace.to(roomId).emit('numberTourAfter', gameState.game.numberTour);

            if (gameState.game.numberTour === 101){
                WaitingRoomNamespace.to(roomId).emit('endGame', "draw");
            }

            let possibleMoves = gameState.game.getPossibleMoves(gameState.game.playerPosition[`player${gameState.game.currentPlayer}`]);
            WaitingRoomNamespace.to(roomId).emit('updateRound',
                possibleMoves, gameState.game.numberTour,
                gameState.game.playerPosition, gameState.game.currentPlayer,
            gameState.game.nbWallsPlayer1, gameState.game.nbWallsPlayer2);
            }

        });
    }
}


module.exports = {createSocket};
module.exports.rooms = rooms;