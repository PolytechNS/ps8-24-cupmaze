import {decodeJWTPayload, getCookie} from "../tokenUtils.js";

let username = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
let socket=io("/api/game");

var baseUrl = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000';
} else {
    baseUrl = 'http://cupmaze.ps8.academy';
}


document.getElementById('button-play').addEventListener('click', function() {
    window.location.href = baseUrl +'/launchGame.html';
});
document.getElementById('button-leaderboard').addEventListener('click', function() {
    window.location.href = baseUrl+'/leaderboard.html';
});
document.getElementById('button-prizes').addEventListener('click', function() {
    window.location.href = baseUrl+'/prizes.html';
});

document.getElementById('button-disconnect').addEventListener('click', function () {
    window.location.href = baseUrl +'/login.html';
});
document.getElementById('logOutMsg').addEventListener('click', function () {
    window.location.href = baseUrl +'/login.html';
});
document.getElementById('searchFriends').addEventListener('click', function () {
    window.location.href = baseUrl +'/searchFriends.html';
});

document.getElementById("welcomeMsg").innerText+= " " + username + " !";

const closePopupButton = document.getElementById("closePopup");
closePopupButton.onclick = function() {
    document.getElementById("popup").style.display = "none";
}

const closePopupButtonNotif = document.getElementById("closePopup-notif");
closePopupButtonNotif.onclick = function() {
    document.getElementById("popup-notif").style.display = "none";
}

const params = {
    username: username
};
let socketNotifications = io("/notifications");
socketNotifications.emit('joinRoom', username);
socketNotifications.on('friendRequestNotification', (data) => {
    //alert(`You have a friend request from ${data.sender}`);
    const popup = document.getElementById('popup-notif');
    popup.style.display = 'block';
    const message = document.getElementById('popup-notif-content');
    message.innerText = `Vous avez une demande d'ami de ${data.sender}`;
});

let notificationsButton = document.getElementById('notifications-button');
notificationsButton.addEventListener('click', () => {
    document.getElementById("popup").style.display = "block";

    socketNotifications.emit("getNotifications", username);
    socketNotifications.on("notifications", (notifications) => {
        console.log(notifications);
        if(notifications.length === 0){
            document.getElementById("element1").innerText = "Vous n'avez pas de notifications";
        }else{
            //récupérer les 3 dernières notifications dans le tableau
            let i = 0;
            for(i = 0; notifications.length -i -1 >=0 && i < 3; i++){
                document.getElementById("element"+(i+1)).innerText = notifications[notifications.length -i -1];
            }
        }
    });
});

// On va fermer la connexion du socket lorsque l'utilisateur quitte la page principale
window.addEventListener('beforeunload', () => {
    socketNotifications.disconnect();
});

let globalChatButton = document.getElementById('button-globalChat');
globalChatButton.addEventListener('click', () => {
    window.location.href = baseUrl +'/globalChat.html';
});
