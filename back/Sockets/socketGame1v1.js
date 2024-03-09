const {Server} = require("socket.io");
const {Game} = require("../logic/Game");

function createSocket(server) {
    const io = new Server(server);
    const rooms = [];

    const gameNamespace = io.of("/api/game");
    gameNamespace.on("connection", (socket) => {
        console.log("a user connected");
        const existingRoom = rooms.find((room) => room.players.length === 1);

        if (existingRoom) {
            //Join existing room
            existingRoom.clients.push(socket);
            socket.join(existingRoom.name);
            console.log('user joined existing room');

            io.to(existingRoom.name).emit('message', 'The Game will start shortly !');
        } else {
            //Create new room
            const roomName = `room_${Date.now()}`;
            const newRoom = {
                name: roomName,
                players: [socket],
            };

            rooms.push(newRoom);
        }

        gameNamespace.on('disconnect', () => {
            console.log('player disconnected');

            //Remove player from room
            rooms.forEach((room) => {
                const index = room.clients.indexOf(socket);
                if (index !== -1) {
                    room.clients.splice(index, 1);

                    //Inform other player
                    if (room.clients.length === 1) {
                        io.to(room.name).emit('message', 'opponent disconnected');
                    }

                    //Delete room if empty
                    if (room.clients.length === 0) {
                        const roomIndex = rooms.indexOf(room);
                        rooms.splice(roomIndex, 1);
                    }
                }
            });
        });
    });

}