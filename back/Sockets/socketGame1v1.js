const {Server} = require("socket.io");

function createSocket(io) {
    //const io = new Server(server);
    const rooms = [];

    const OnlineGameNamespace = io.of("/api/game1v1");
    OnlineGameNamespace.on("connection", (socket) => {
        console.log("a user connected");

        socket.on("waiting_room", () => {
            console.log("user in waiting room");
            const existingRoom = rooms.find((room) => room.players.length === 1);

            if (existingRoom) {
                //Join existing room
                existingRoom.players.push(socket);
                socket.join(existingRoom.name);
                console.log('user joined existing in room', existingRoom.name);
                startGame(existingRoom);
            } else {
                //Create new room
                const roomName = `room_${Date.now()}`;
                const newRoom = {
                    name: roomName,
                    players: [socket],
                };
                console.log('user created new room');
                rooms.push(newRoom);
            }
        });

        OnlineGameNamespace.on('disconnect', () => {
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

    function startGame(room) {
        console.log('starting game');
        OnlineGameNamespace.in(room.name).emit('startGame', room.name);

    }
}

module.exports = {createSocket};