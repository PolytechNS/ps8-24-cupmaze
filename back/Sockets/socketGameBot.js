const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");

function createSocket(server){
    const io = new Server(server);
    io.on("connection", (socket) => {
        console.log("a user connected");

        socket.on("newMove", (msg) => {
            console.log("Player1 make a new movement, we will compute the AI's move and send it back to the client");
            let newPosition = AIEasy.computeMove(msg);
            io.emit("updatedBoard", newPosition);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}

module.exports = {
    createSocket
};