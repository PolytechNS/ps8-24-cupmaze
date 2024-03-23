const jwt = require('jsonwebtoken');
const {getUser, decodeJWTPayload, getUserByName, getUserById, updateStats} = require("../database/mongo");
const matchmaking = require("./matchmaking.js");
const {Game} = require("../logic/Entities/Game");
const {beginningPositionIsValid} = require("../logic/movePlayerReferee");
const {findWall, findSpace} = require("../logic/utils");

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

            socket.on("waiting_room", async (playerToken, gameType) => {
                console.log("user " + socket.id + " is in the waiting room");
                const userDB = await getUser(jwt.verify(playerToken, 'secret').email);
                if (!userDB) { return; }
                const user = decodeJWTPayload(playerToken);
                currentRoomId = user.id;
                await initMatchmaking(socket, playerToken, gameType);
            });

            socket.on("disconnect", () => {
                console.log("user " + socket.id + " disconnected from waiting room " + currentRoomId);
                if (currentRoomId === null) { return; }
                console.log("WaitingRoomSocket: removing " + currentRoomId + " from waiting room");
                matchmaking.remove(currentRoomId);
            });

            socket.on("reaction", (data) => {
                const { roomId, reaction, usernameSender} = data;
                console.log("reaction", roomId, reaction, usernameSender);
                WaitingRoomNamespace.to(roomId).emit("reaction", reaction, usernameSender);
            });


            socket.on('setupGame', token =>
                socket.on('joinRoom', (room) =>
                    initRoom(socket, token, room)));


            playGame(socket);
        });

    // cherche a associer un joueur a une room
    async function initMatchmaking(socket, token, gameType) {
        const userDB = await getUser(jwt.verify(token, 'secret').email);
        if (!userDB) { return; }
        let user = decodeJWTPayload(token);
        socket.join(user.id);
        console.log("user " + user.username + " joined waiting room " + user.id);
        let match = await matchmaking.joinWaitingRoom(user.id, user.username, gameType);
        if (!match) { return; }
        const matchDB = await getUserByName(match.username);
        console.log("match found " + match.elo + " vs " + user.username);
        console.log("elo " + matchDB.elo + " vs " + userDB.elo);
        WaitingRoomNamespace.to(user.id).emit('matchFound', {
            'opponentName': match.username,
            'opponentId': match.id,
            'player1_elo': userDB.elo,
            'player2_elo': matchDB.elo,
            'room' : user.id
        });
        WaitingRoomNamespace.to(match.id).emit('matchFound', {
            'opponentName': user.username,
            'opponentId': user.id,
            'player1_elo': matchDB.elo,
            'player2_elo': userDB.elo,
            'room' : user.id
        });
        playersWithRooms[user.id] = {
            'player1': user.id,
            'player2': match.id,
            'gameMode': gameType
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
                gameState.game.actionsToDo--;
                gameState.game.lastActionType = "position";
                WaitingRoomNamespace.to(roomId).emit('actionResult', {
                    valid: true,
                    message: "Position choisie",
                    current: gameState.game.currentPlayer,
                    playerPositions: gameState.game.playerPosition.player2,
                    cellId: cellId,
                    actionType: "positionBegin"
                });
            } else {
                console.log("Begin : Ce n'est pas votre tour");
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

        socket.on("layWall", (data) => {
            console.log("layWall", data);
            let roomId = data.roomId; // room id
            let token = data.tokens; // token
            let gameState = GameState[roomId];
            let user = decodeJWTPayload(token);
            if (!gameState || !roomId) { return; }

            let firstWallToColor = data.firstWallToColor;
            console.log(data.adjacentWall);
            let wallType = data.wallType;
            let wallPosition = data.wallPosition;
            let wallId = data.wallId;

            if (gameState.game.currentPlayer === 1 && user.id === roomId ||
                gameState.game.currentPlayer === 2 && user.id !== roomId) {

                if (gameState.game.actionsToDo === 0) {
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Vous avez deja joué",
                        case: "noMoreActions",
                        actionType: "layWall"
                    });
                    return;
                }

                if (gameState.game.currentPlayer === 1) {
                    if (gameState.game.nbWallsPlayer1 === 0) {
                        socket.emit('actionResult', {
                            valid: false,
                            message: "Vous n'avez plus de mur",
                            case: "noMoreWalls",
                            actionType: "layWall"
                        });
                        return;
                    }
                } else {
                    if (gameState.game.nbWallsPlayer2 === 0) {
                        socket.emit('actionResult', {
                            valid: false,
                            message: "Vous n'avez plus de mur",
                            case: "noMoreWalls",
                            actionType: "layWall"
                        });
                        return;
                    }
                }

                const colonne = parseInt(wallPosition[0]);
                const ligne = parseInt(wallPosition[2]);

                let wallInclinaison;
                if (firstWallToColor === null) {
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Vous devez choisir un mur",
                        case: "noWall",
                        actionType: "layWall"
                    });
                }
                if (wallType === "wv") { wallInclinaison = "vertical"; }
                else { wallInclinaison = "horizontal"; }

                const wall = findWall(colonne, ligne, wallInclinaison, gameState.game.elements);
                const adjacentWall =
                    (wallInclinaison === "vertical")
                        ? findWall(colonne, ligne-1, wallInclinaison, gameState.game.elements)
                        : findWall(colonne+1, ligne, wallInclinaison, gameState.game.elements);
                const adjacentSpace = findSpace(colonne, ligne, gameState.game.elements);

                gameState.game.layWall(wall, adjacentWall, adjacentSpace);
                gameState.game.actionsToDo--;
                gameState.game.lastActionType = "wall";
                if (gameState.game.currentPlayer === 1) {
                    gameState.game.nbWallsPlayer1--;
                } else {
                    gameState.game.nbWallsPlayer2--;
                }

                WaitingRoomNamespace.to(roomId).emit('actionResult', {
                    valid: true,
                    message: "Mur posé",
                    wallType: wallType,
                    currentPlayer: gameState.game.currentPlayer,
                    nbWallsPlayer1: gameState.game.nbWallsPlayer1,
                    nbWallsPlayer2: gameState.game.nbWallsPlayer2,
                    wallId: wallId,
                    firstWallToColor: data.firstWallToColor,
                    adjacentWall: data.adjacentWall,
                    adjacentSpace: data.adjacentSpace,
                    actionType: "layWall"
                });
                adjacentWallId = wallType + "~" + adjacentWall.getPos_x() + "-" + adjacentWall.getPos_y();
                adjacentSpaceId = adjacentSpace.getPos_x() + "-" + adjacentSpace.getPos_y() + "-space";
                gameState.game.lastWallsLaid = [wall, adjacentWall, adjacentSpace];
                gameState.game.lastWallLaidsIDHtml = [wallId, adjacentWallId, adjacentSpaceId];
            } else {
                console.log("Lay Wall : Ce n'est pas votre tour");
                socket.emit('actionResult', {
                    valid: false,
                    message: "Ce n'est pas votre tour",
                    case: "notYourTurn",
                    actionType: "layWall"
                });
            }

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
                    const eloGame = updateElo(roomId, winner[1]);
                    WaitingRoomNamespace.to(roomId).emit('actionResult', {
                        valid: false,
                        message: "Le joueur " + winner[1] + " a gagné",
                        winner: winner[1],
                        eloGame: eloGame,
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

        socket.on("undoMovePosition", (data) => {
            console.log("undoMovePosition");
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
                        message: "Vous n'avez pas encore joué",
                        case: "notPlayed",
                        actionType: "undoMovePosition"
                    });
                    return;
                }

                let oldPositionHtml = gameState.game.playerPosition[`player${gameState.game.currentPlayer}`][0]+"-"+gameState.game.playerPosition[`player${gameState.game.currentPlayer}`][1]+"~cell";
                let newPositionHtml = "";
                const lastCase = gameState.game.getCase(gameState.game.playerPosition[`player${gameState.game.currentPlayer}`][0], gameState.game.playerPosition[`player${gameState.game.currentPlayer}`][1]);
                lastCase.setIsOccupied(false);

                if (gameState.game.lastPlayerPosition[`player${gameState.game.currentPlayer}`] !== null) {
                    newPositionHtml = gameState.game.lastPlayerPosition[`player${gameState.game.currentPlayer}`][0]+"-"+gameState.game.lastPlayerPosition[`player${gameState.game.currentPlayer}`][1]+"~cell";
                } else {
                    gameState.game.actionsToDo = 1;
                    WaitingRoomNamespace.to(roomId).emit('actionResult', {
                        valid: true,
                        message: "Il n'y a pas de dernier mouvement",
                        case: "noLastMove",
                        currentPlayer: gameState.game.currentPlayer,
                        cellToReset: oldPositionHtml,
                        actionType: "undoMovePosition"
                    });
                    return;
                }

                gameState.game.playerPosition[`player${gameState.game.currentPlayer}`] = gameState.game.lastPlayerPosition[`player${gameState.game.currentPlayer}`];
                const caseUpdated = gameState.game.getCase(gameState.game.playerPosition[`player${gameState.game.currentPlayer}`][0], gameState.game.playerPosition[`player${gameState.game.currentPlayer}`][1]);
                caseUpdated.setIsOccupied(true);

                gameState.game.actionsToDo = 1;
                WaitingRoomNamespace.to(roomId).emit('actionResult', {
                    valid: true,
                    message: "Dernier mouvement annulé",
                    case: "LastMoveCancelled",
                    oldPositionHtml: oldPositionHtml,
                    newPositionHtml: newPositionHtml,
                    currentPlayer: gameState.game.currentPlayer,
                    numberTour: gameState.game.numberTour,
                    actionType: "undoMovePosition"
                });
            } else {
                socket.emit('actionResult', {
                    valid: false,
                    message: "Ce n'est pas votre tour",
                    case: "notYourTurn",
                    actionType: "undoMovePosition"
                });
            }
        });

        socket.on("undoWall", (data) => {
            console.log("undoWall");
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
                        message: "Vous n'avez pas encore joué",
                        case: "notPlayed",
                        actionType: "undoWall"
                    });
                    return;
                }

                if (gameState.game.lastActionType !== "wall") {
                    socket.emit('actionResult', {
                        valid: false,
                        message: "Il n'y a pas de dernier mur posé",
                        case: "noLastWall",
                        actionType: "undoWall"
                    });
                    return;
                }

                gameState.game.undoWalls();
                gameState.game.actionsToDo = 1;
                if (gameState.game.currentPlayer === 1) {
                    gameState.game.nbWallsPlayer1++;
                } else {
                    gameState.game.nbWallsPlayer2++;
                }
                console.log("gameState.game.lastWallLaidsIDHtml", gameState.game.lastWallLaidsIDHtml);
                WaitingRoomNamespace.to(roomId).emit('actionResult', {
                    valid: true,
                    message: "Dernier mur annulé",
                    case: "LastWallCancelled",
                    currentPlayer: gameState.game.currentPlayer,
                    numberTour: gameState.game.numberTour,
                    tabIDHTML: gameState.game.lastWallLaidsIDHtml,
                    numberWallsPlayer1: gameState.game.nbWallsPlayer1,
                    numberWallsPlayer2: gameState.game.nbWallsPlayer2,
                    actionType: "undoWall"
                });
            } else {
                socket.emit('actionResult', {
                    valid: false,
                    message: "Ce n'est pas votre tour",
                    case: "notYourTurn",
                    actionType: "undoLayWall"
                });
            }
        });
    }

    async function updateElo(roomId, winner) {
        let player1_elo = getUserById(playersWithRooms[roomId].player1).elo;
        let player2_elo = getUserById(playersWithRooms[roomId].player2).elo;

        let player1_Chance = 1 / (1 + Math.pow(10, (player2_elo - player1_elo) / 400));
        let elo_Diff;
        if (winner === 0 || winner === -1 || playersWithRooms[roomId].gameMode === undefined) {
            return 0;
        }
        if (winner === 1) {
            elo_Diff = Math.round(32 * (1 - player1_Chance));
            // on met a jour l'elo du perdant et du gagnant
            await updateStats(playersWithRooms[roomId].player1, playersWithRooms[roomId].player2, elo_Diff);
        } else {
            elo_Diff = Math.round(32 * player1_Chance);
            await updateStats(playersWithRooms[roomId].player2, playersWithRooms[roomId].player1, elo_Diff);
        }
        return elo_Diff;
    }
}

function setupChallenge(roomId, player1Id, player2Id) {
    playersWithRooms[roomId] = {
        'player1': player1Id,
        'player2': player2Id,
        'gameMode': 'friendly'
    }
}

module.exports = {createSocket, setupChallenge};
module.exports.rooms = rooms;