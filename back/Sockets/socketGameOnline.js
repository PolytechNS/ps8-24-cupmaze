const {getUser} = require("../database/mongo");
const {rooms} = require("./socketWaitingRoom.js");

function createSocket(io) {
    console.log("creating socket");
    const OnlineGameNamespace = io.of('/api/onlineGame');
    OnlineGameNamespace.on("connection", (socket) => {
        console.log("a user " + socket.id +" connected");
        socket.on("setupGame", async (token) => {
            socket.on("joinRoom", (roomName) => {
                socket.join(roomName);
            });
            console.log("setupGame", token);
        });
    });
}




module.exports = {createSocket};