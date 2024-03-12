const {getUser} = require("../database/mongo");
const {rooms} = require("./socketWaitingRoom.js");
const {Game} = require("../logic/Game");

function createSocket(io) {
    console.log("creating socket");
    const game = new Game();
    const OnlineGameNamespace = io.of('/api/onlineGame');
    OnlineGameNamespace.on("connection", (socket) => {
        console.log("a user " + socket.id +" connected");
        socket.on("setupGame", async (token) => {
            console.log("setupGame", token);
            socket.on("joinRoom", (roomName) => {
                console.log("joinRoom", roomName);
                socket.join(roomName);


            });
            console.log("setupGame", token);
        });

        socket.on("disconnect", () => {
            console.log("user " + socket.id + " disconnected");
        });

        playGame(socket);
    });
}

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

module.exports = {createSocket};