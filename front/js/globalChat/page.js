let username = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();


let socketGlobalChat = io("/api/globalChat");
socketGlobalChat.emit("setupGlobalChat");
socketGlobalChat.on("setupGlobalChat", (messages) => {
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
    socketGlobalChat.emit("sendMessage", inputMessage.value, username);
});

socketGlobalChat.on("sendMessage", (messages) => {
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

window.addEventListener('beforeunload', () => {
    socketGlobalChat.disconnect();
});



var baseUrl = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000';
} else {
    baseUrl = 'http://cupmaze.ps8.academy';
}

let buttonBack = document.getElementById("back");
buttonBack.addEventListener("click", function() {
    window.location.href = "/mainMenu.html";
});