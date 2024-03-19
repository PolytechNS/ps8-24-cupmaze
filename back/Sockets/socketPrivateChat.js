const {addMessagePrivateChat, getPrivateChatMessages} = require("../database/mongo");

function createSocket(io) {
    console.log("creating socket private chat");
    const PrivateChatNamespace = io.of('/api/privateChat');
    PrivateChatNamespace.on("connection", (socket) => {
        console.log("a user " + socket.id +" connected");

        socket.on("setupPrivateChat", async (username1, username2) => {
            console.log("setupPrivateChat");
            let ret = await getPrivateChatMessages(username1, username2);
            socket.emit("setupPrivateChat", ret);
        });

        socket.on("sendMessage", async (message, username, to) => {
            console.log("sendMessage socket PrivateChat", message, username, to);
            ban_words.forEach(word => {
                if (message.toLowerCase().includes(word)) {
                    message = "*********";
                }
            });
            const ret = await getPrivateChatMessages(username, to);
            await addMessagePrivateChat(username, to, {account: username, value: message});
            const ret2 = await getPrivateChatMessages(username, to);
            socket.emit("sendMessage", ret2);
        });

        socket.on("disconnect", () => {
            console.log("user " + socket.id + " disconnected");
        });
    });
}