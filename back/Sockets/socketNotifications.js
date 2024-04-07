const { Server } = require("socket.io");
const {addNotification, removeNotification, getNotifications, decodeJWTPayload, getUserByName, getUserById,
    acceptFriendRequest
} = require("../database/mongo");
const {verify} = require("jsonwebtoken");
const {setupChallenge} = require("./socketWaitingRoom");
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

        socket.on('social', (token) => onSocial(socket, token));

        socket.on('sendChallenge', (sendChallenge) => onSendChallenge(socket, sendChallenge));
        socket.on('challengeDecision', (challengeDecision) => onChallengeDecision(socket, challengeDecision));
    });

    async function onSocial(socket, token) {
        console.log('Social request');
        if (token === null) { return; }
        if (!verify(token, 'secret')) { return; }
        let userInformation = decodeJWTPayload(token);
        console.log('User', userInformation.username, 'connected to notifications');
        socket.join(userInformation.id);
    }

    async function onSendChallenge(socket, data) {
        console.log('Challenge sent to', data.friend);
        let senderToken = data.senderToken;
        let friendName = data.friend;
        if (senderToken === null || friendName === null) {
            return;
        }
        if (!verify(senderToken, 'secret')) {
            return;
        }

        let friendInformation = decodeJWTPayload(senderToken);
        // on va chercher le friendName dans la base de données
        const userDB = await getUserByName(friendName);
        if (userDB === null) {
            return;
        }
        notifications.to(userDB._id.toString()).emit("receiveChallenge", {
            'senderId': friendInformation.id,
            'senderName': friendInformation.username,
            'token': senderToken
        });
        console.log('Challenge sent to', userDB._id.toString());
    }

    async function onChallengeDecision(socket, data) {
        console.log('Challenge decision from', data.receiver);
        let senderToken = data.senderToken;
        let userId = data.userId;
        let friendId = data.friendId;
        let friendName = data.friendName;
        if (senderToken === null || userId === null || friendId === null || friendName === null) { return; }

        if (!verify(senderToken, 'secret')) { return; }

        let userInformation = decodeJWTPayload(senderToken);
        let userDB = await getUserById(userId);
        let friendDB = await getUserById(friendId);
        console.log('friendDB', friendDB);

        notifications.to(userId).emit("challengeInit", {
            'opponentName': friendName,
            'opponentId': friendId,
            'player1_elo': userDB.elo,
            'player2_elo': friendDB.elo,
            'room': userId
        });

        notifications.to(friendId).emit("challengeInit", {
            'opponentName': userInformation.username,
            'opponentId': userId,
            'player1_elo': userDB.elo,
            'player2_elo': friendDB.elo,
            'room': userId
        });
        setupChallenge(userId, friendId);
    }

}



module.exports = {
    createSocket: createSocket
};