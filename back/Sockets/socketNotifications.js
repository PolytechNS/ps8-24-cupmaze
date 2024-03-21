const { Server } = require("socket.io");
const {addNotification, removeNotification, getNotifications} = require("../database/mongo");
function createSocket(io) {
    console.log("Creating socket for notifications");

    const notifications = io.of("/notifications");

    notifications.on('connection', (socket) => {
        console.log('Client connected to notifications namespace');

        socket.on('joinRoom', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their room`);
        });

        socket.on('addFriendRequest', async (data) => {
            notifications.to(data.receiver).emit('friendRequestNotification', data);
            const ret = await addNotification(data.receiver, 'You have a friend request from '+data.sender);
            console.log(`Friend request notification sent to ${data.receiver}`);
        });

        socket.on('challengeFriend', (data) => {
            notifications.to(data.receiver).emit('challengeNotification', data);
            console.log(`Challenge notification sent to ${data.receiver}`);
        });

        socket.on("getNotifications", async (username) => {
            const notifications = await getNotifications(username);
            socket.emit("notifications", notifications);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected from notifications namespace');
        });
    });
}

module.exports = {
    createSocket: createSocket
};