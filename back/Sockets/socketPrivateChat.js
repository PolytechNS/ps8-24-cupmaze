const {addMessagePrivateChat, getPrivateChatMessages} = require("../database/mongo");

function createSocket(io) {
    console.log("creating socket private chat");
    const PrivateChatNamespace = io.of('/api/privateChat');
    PrivateChatNamespace.on("connection", (socket) => {
        console.log("a user " + socket.id +" connected to a private chat namespace");

        socket.on("setupPrivateChat", async (idchat) => {
            console.log("setupPrivateChat");
            socket.join(idchat);
            let ret = await getPrivateChatMessages(idchat);
            socket.emit("setupPrivateChat", ret);
        });

        socket.on("sendMessage", async (message, usernameSender, idchat) => {
            console.log("sendMessage socket PrivateChat", message, usernameSender, idchat);
            ban_words.forEach(word => {
                if (message.toLowerCase().includes(word)) {
                    message = "*********";
                }
            });
            const ret = await getPrivateChatMessages(idchat);
            let ret3 = await addMessagePrivateChat(idchat, usernameSender, {account: usernameSender, value: message});
            const ret2 = await getPrivateChatMessages(idchat);
            PrivateChatNamespace.to(idchat).emit("sendMessage", ret2);
        });

        socket.on("disconnect", () => {
            console.log("user " + socket.id + " disconnected");
        });
    });
}

const ban_words = [
    'pd',
    'pute',
    'enculer',
    'salope',
    'connard',
    'batard',
    'bite',
    'baise',
    'baiser',
    'nique',
    'niquer',
    'nique ta mère',
    'niquer ta mère',
    'nique',
    'tocard',
    'batard',
    'fils de pute',
    'fils de chienne',
    'fils de chien',
    'fils de pétasse',
    'autiste',
    'kys',
    'fagot',
    'fiotte'
]

module.exports = {
    createSocket: createSocket
};