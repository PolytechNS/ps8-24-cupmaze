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
                socket.on('joinRoom', (room) =>
                    initRoom(socket, token, room)));


            playGame(socket);
        });

    // cherche a associer un joueur a une room
    async function initMatchmaking(socket, token) {
        const userDB = await getUser(jwt.verify(token, 'secret').email);
        if (!userDB) { return; }
        let user = decodeJWTPayload(token);
        socket.join(user.id);
        console.log("user " + user.username + " joined waiting room " + user.id);
        let match = await matchmaking.joinWaitingRoom(user.id, user.username);
        if (!match) { return; }

        console.log("match found " + match.username + " vs " + user.username);
        WaitingRoomNamespace.to(user.id).emit('matchFound', {
            'opponentName': match.username,
            'opponentId': match.id,
            'room' : user.id
        });
        WaitingRoomNamespace.to(match.id).emit('matchFound', {
            'opponentName': user.username,
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
        // on verifie le token founi dans gameParams
        if (!await getUser(jwt.verify(token, 'secret').email)) {
            console.log("user not found");
            return;
        }
        if (!GameState[roomId]) {
            GameState[roomId] = {
                'game': new Game()
            };
        }
        // on envoie les informations du jeu a tout les joueurs dans la room
        WaitingRoomNamespace.to(roomId).emit('game', "beginning");
    }

    // on ecoute les evenements du jeu
    function playGame(socket) {

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

                if (res === false) {
                    socket.emit("actionResult", {
                        valid: false,
                        message: "Il faut commencer sur votre ligne de depart",
                        actionType: "positionBegin"
                    })
                    console.log("Il faut commencer sur votre ligne de depart");
                    return;
                }
                if (gameState.game.actionsToDo === 0) {
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Vous avez deja joué",
                        actionType: "positionBegin"
                    });
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

                WaitingRoomNamespace.to(roomId).emit('actionResult', {
                    valid: true,
                    message: "Position choisie",
                    current: gameState.game.currentPlayer,
                    playerPositions: gameState.game.playerPosition.player2,
                    cellId: cellId,
                    actionType: "positionBegin"
                });

                gameState.game.actionsToDo--;
                gameState.game.lastPlayerPosition["player" + gameState.game.currentPlayer] = [colonne, ligne];
            } else {
                console.log("Begin :Ce n'est pas votre tour");
                socket.emit('actionResult', {
                    valid: false,
                    message: "Ce n'est pas votre tour",
                    actionType: "positionBegin"
                });
            }
        });


        socket.on("movePlayer", (data) => {
            let roomId = data.roomId; // room id
            let cellId = data.cellId; // cell id
            let token = data.tokens; // token
            let gameState = GameState[roomId];
            let user = decodeJWTPayload(token);
            if (!gameState || !roomId || !cellId) { return; }

            if (gameState.game.currentPlayer === 1 && user.id === roomId ||
                gameState.game.currentPlayer === 2 && user.id !== roomId) {
                if (gameState.game.actionsToDo === 0) {
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Vous avez deja joué",
                        case: "noMoreActions",
                        actionType: "movePlayer"
                    });
                    return;
                }

                const colonne = parseInt(cellId.split("-")[0]);
                const ligne = parseInt(cellId.split("-")[1]);

                const playerCurrentPosition = gameState.game.getPlayerCurrentPosition(gameState.game.currentPlayer);
                console.log("playerCurrentPosition", playerCurrentPosition);
                const possibleMoves = gameState.game.getPossibleMoves(playerCurrentPosition);
                console.log("possibleMoves", possibleMoves);
                console.log("colonne", colonne, "ligne", ligne);
                const caseWanted = gameState.game.getCase(colonne, ligne);

                if (possibleMoves.find((cell) => cell.getPos_x() === colonne && cell.getPos_y() === ligne)) {


                    gameState.game.movePlayer(gameState.game.currentPlayer, caseWanted, playerCurrentPosition);
                    WaitingRoomNamespace.to(roomId).emit('actionResult', {
                        valid: true,
                        message: "Joueur déplacé",
                        currentPlayer: gameState.game.currentPlayer,
                        cellId: cellId,
                        oldPosition:
                            gameState.game.lastPlayerPosition['player' + gameState.game.currentPlayer][0]+"-"+
                            +gameState.game.lastPlayerPosition['player' + gameState.game.currentPlayer][1]+"~cell",
                        actionType: "movePlayer"
                    });
                } else {
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Vous ne pouvez pas aller ici",
                        case: "notPossible",
                        actionType: "movePlayer"
                    });
                }
            } else {
                console.log("Move : Ce n'est pas votre tour");
                socket.emit('actionResult', {
                    valid: false,
                    message: "Ce n'est pas votre tour",
                    case: "notYourTurn",
                    actionType: "movePlayer"
                });
            }

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

                if (gameState.game.actionsToDo === 1) {
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Vous n'avez pas joué",
                        case: "notPlayed",
                        actionType: "validateRound"
                    });
                    return;
                }

                gameState.game.currentPlayer = gameState.game.currentPlayer === 1 ? 2 : 1;
                gameState.game.actionsToDo = 1;
                gameState.game.numberTour++;

                const winner = gameState.game.isGameOver(gameState.game.playerPosition);
                if (winner[0]) {
                    WaitingRoomNamespace.to(roomId).emit('actionResult', {
                        valid: false,
                        message: "Le joueur " + winner[1] + " a gagné",
                        winner: winner[1],
                        case: "victory",
                        actionType: "validateRound"
                    });
                    return;
                }

                if (gameState.game.numberTour === 101){
                    WaitingRoomNamespace.to(roomId).emit('actionResult', {
                        valid: false,
                        message: "Egalité",
                        case: "draw",
                        actionType: "validateRound"
                    });
                }

                let possibleMoves = gameState.game.getPossibleMoves(gameState.game.playerPosition[`player${gameState.game.currentPlayer}`]);

                WaitingRoomNamespace.to(roomId).emit('actionResult', {
                    valid: true,
                    message: "Tour validé",
                    possibleMoves: possibleMoves,
                    numberTour: gameState.game.numberTour,
                    playerPosition: gameState.game.playerPosition,
                    currentPlayer: gameState.game.currentPlayer,
                    nbWallsPlayer1: gameState.game.nbWallsPlayer1,
                    nbWallsPlayer2: gameState.game.nbWallsPlayer2,
                    actionType: "validateRound"
                });
                } else {
                    console.log("Valid Turn : Ce n'est pas votre tour");
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Ce n'est pas votre tour",
                        case: "notYourTurn",
                        actionType: "validateRound"
                    });
                }
        });
    }
}


module.exports = {createSocket};
module.exports.rooms = rooms;