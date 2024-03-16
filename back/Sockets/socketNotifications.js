const { Server } = require("socket.io");

function createSocket(io) {
    console.log("Creating socket for notifications");

    const notifications = io.of("/notifications");

    notifications.on('connection', (socket) => {
        console.log('Client connected to notifications namespace');

        socket.on('joinRoom', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their room`);
        });

        socket.on('addFriendRequest', (data) => {
            notifications.to(data.receiver).emit('friendRequestNotification', data);
            console.log(`Friend request notification sent to ${data.receiver}`);
        });

        socket.on('challengeFriend', (data) => {
            notifications.to(data.receiver).emit('challengeNotification', data);
            console.log(`Challenge notification sent to ${data.receiver}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected from notifications namespace');
        });
    });
}

module.exports = {
    createSocket: createSocket
};