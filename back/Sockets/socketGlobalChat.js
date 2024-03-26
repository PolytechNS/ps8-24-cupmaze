const {addMessageGlobalChat, getGlobalChatMessages, clearGlobalChatDb} = require("../database/mongo");

function createSocket(io) {
    console.log("creating socket global chat");
    const GlobalChatNamespace = io.of('/api/globalChat');
    GlobalChatNamespace.on("connection", (socket) => {
        console.log("a user " + socket.id +" connected");

        socket.on("setupGlobalChat", async () => {
            console.log("setupGlobalChat");
            const messages = await getGlobalChatMessages();
            socket.emit("setupGlobalChat", messages);
        });

        socket.on("sendMessage", async (message, username) => {
            console.log("sendMessage socket GlobalChat", message, username);
            ban_words.forEach(word => {
                if (message.toLowerCase().includes(word)) {
                    message = "*********";
                }
            });
            const ret = await addMessageGlobalChat({account: username, value: message});
            const ret2 = await getGlobalChatMessages();
            GlobalChatNamespace.emit("sendMessage", ret2);
        });

        socket.on("clearGlobalChat", async () => {
            console.log("clearGlobalChat");
            const ret = await clearGlobalChatDb();
            const ret2 = await getGlobalChatMessages();
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