let username = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();

let socketNotifications = io("/api/globalChat");
socketNotifications.emit("setupGlobalChat");
socketNotifications.on("setupGlobalChat", (messages) => {
    if(messages.length > 0){
        const messagesContainer = document.getElementById("messages-container");
        messagesContainer.innerHTML = "";
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.textContent = message.account+ ": " + message.value
            messagesContainer.appendChild(messageElement);
        }
    } else {
        console.log("y'a pas de messages");
    }
});

let buttonSend = document.getElementById("sendButton");
buttonSend.addEventListener("click", () => {
    let inputMessage = document.getElementById("messageInput");
    //console.log("new message", inputMessage.value, username);
    socketNotifications.emit("sendMessage", inputMessage.value, username);
});

socketNotifications.on("sendMessage", (messages) => {
    //console.log("messages de la db", messages);
    const messagesContainer = document.getElementById("messages-container");
    messagesContainer.innerHTML = "";
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.textContent = message.account+ ": " + message.value
        messagesContainer.appendChild(messageElement);
    }
});

let buttonClear = document.getElementById("clearButton");
buttonClear.addEventListener("click", () => {
    console.log("clearGlobalChat");
    socketNotifications.emit("clearGlobalChat");
});