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

module.exports = {
    createSocket: createSocket
};