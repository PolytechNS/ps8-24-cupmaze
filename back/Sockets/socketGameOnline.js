

function createSocket(io) {

    const OnlineGameNamespace = io.of("/api/onlineGame");
    OnlineGameNamespace.on("connection", (socket) => {
        console.log("a user " + socket.id +" connected");




    });
}

module.exports = {createSocket};