

function createSocket(io) {

    const OnlineGameNamespace = io.of('/api/onlineGame');
    OnlineGameNamespace.on("connection", (socket) => {
        console.log("a user " + socket.id +" connected");

        // on récupère le token de chaque joueur quand ils se connectent
        const token = socket.handshake.query.token;
        console.log("token", token);



    });
}

module.exports = {createSocket};