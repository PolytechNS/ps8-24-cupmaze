import {decodeJWTPayload, getCookie} from "../tokenUtils.js";

let username = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
let socket=io("/api/game");
//socket.emit("clearGames",username);
document.getElementById('button-play').addEventListener('click', function() {
    window.location.href = 'http://localhost:8000/launchGame.html';
});
document.getElementById('button-leaderboard').addEventListener('click', function() {
    window.location.href = 'http://localhost:8000/leaderboard.html';
});
document.getElementById('button-prizes').addEventListener('click', function() {
    window.location.href = 'http://localhost:8000/prizes.html';
});
document.getElementById('button-options').addEventListener('click', function() {
    //window.location.href = 'http://localhost:8000/options.html';
});
document.getElementById('searchFriends').addEventListener('click', function () {
    window.location.href = 'http://localhost:8000/searchFriends.html';
});

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
let queryString = new URLSearchParams(params).toString();
fetch("http://localhost:8000/api/getFriends?$"+queryString, {
    method: "GET",
})
    .then(async response => {
        if (!response.ok) {
            alert("ERROR"+response.status);
        }else{
            let ret = await response.json();
            console.log(ret);
            const friendsList = document.getElementById("friend-list");
            ret.forEach(friend => {
                const listItem = document.createElement("li");
                listItem.classList.add('friend');

                const nameDiv = document.createElement("div");
                nameDiv.classList.add('name');
                nameDiv.textContent = friend;
                nameDiv.onclick = function() {
                    document.getElementById("popup").style.display = "block";
                    document.getElementById("element1").innerText = "Nom d'utilisateur: "+friend;
                    document.getElementById("element2").innerText = "Elo de l'utilisateur: "+255;
                }

                const buttonChallenge = document.createElement("button");
                buttonChallenge.classList.add('challenge');
                buttonChallenge.textContent = 'Challenge!';
                buttonChallenge.onclick = function () {
                    sendChallenge(friend);
                }

                const buttonChat = document.createElement("button");
                buttonChat.classList.add('chat');
                buttonChat.textContent = 'Chat';
                buttonChat.onclick = function() {
                    if(username.localeCompare(friend) < 0 ){
                        window.location.href = 'http://localhost:8000/privateChat.html?idchat='+username+friend;
                    } else {
                        window.location.href = 'http://localhost:8000/privateChat.html?idchat='+friend+username;
                    }
                }

                listItem.appendChild(nameDiv);
                listItem.appendChild(buttonChallenge);
                listItem.appendChild(buttonChat);

                friendsList.appendChild(listItem);

            });
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
    });


let socketNotifications = io("/notifications");
socketNotifications.emit('joinRoom', username);
socketNotifications.on('friendRequestNotification', (data) => {
    //alert(`You have a friend request from ${data.sender}`);
    const popup = document.getElementById('popup-notif');
    popup.style.display = 'block';
    const message = document.getElementById('popup-notif-content');
    message.innerText = `You have a friend request from ${data.sender}`;
});

let notificationsButton = document.getElementById('notifications-button');
notificationsButton.addEventListener('click', () => {
    document.getElementById("popup").style.display = "block";

    socketNotifications.emit("getNotifications", username);
    socketNotifications.on("notifications", (notifications) => {
        console.log(notifications);
        document.getElementById("element1").innerText = notifications[0];
        //document.getElementById("element2").innerText = notifications.notifications[1];
    });
});

// On va fermer la connexion du socket lorsque l'utilisateur quitte la page principale
window.addEventListener('beforeunload', () => {
    socketNotifications.disconnect();
});

let globalChatButton = document.getElementById('button-globalChat');
globalChatButton.addEventListener('click', () => {
    window.location.href = 'http://localhost:8000/globalChat.html';
});

/* CHALLENGE */

function sendChallenge(friend) {
    let sendChallenge = {
        "senderToken": getCookie('jwt'),
        "friend": friend
    }

    socketNotifications.emit('sendChallenge', sendChallenge);
}


document.addEventListener('DOMContentLoaded', init, false);

function init() {
    console.log('connected to the notifications room');
    socketNotifications.emit('social', getCookie('jwt'));
    socketNotifications.on('receiveChallenge', (receiveChallenge) => onReceiveChallenge(receiveChallenge));
    socketNotifications.on('challengeInit', (challengeInit) => onChallengeInit(challengeInit));
}

function onReceiveChallenge(receiveChallenge) {
    // on affiche une popup pour accepter ou refuser le challenge
    console.log("receiveChallenge", receiveChallenge.token);
    const popup = document.getElementById('popup-notif');
    popup.style.display = 'block';
    popup.style.backgroundColor = 'red';
    popup.style.color = 'white';
    popup.style.border = '2px solid black';
    const message = document.getElementById('popup-notif-content');
    message.innerText = `${receiveChallenge.senderName} vous a défié !`;
    const acceptButton = document.createElement('button');
    acceptButton.innerText = 'Accepter';
    popup.appendChild(acceptButton);
    acceptButton.addEventListener('click', () => challengeDecision(receiveChallenge.senderId, receiveChallenge.senderName, receiveChallenge.token, true));
    const declineButton = document.createElement('button');
    declineButton.innerText = 'Refuser';
    popup.appendChild(declineButton);
    declineButton.addEventListener('click', () => challengeDecision(receiveChallenge.senderId, receiveChallenge.senderName, receiveChallenge.token, false));
}

function challengeDecision(senderId, senderName, senderToken, decision) {
    if (decision === true) {
        console.log('Challenge accepted');
        let challengeDecision = {
            "senderToken": getCookie('jwt'),
            "userId": decodeJWTPayload(getCookie('jwt')).id,
            "friendId": senderId,
            "friendName": senderName,
            "friendToken": senderToken,
            "decision": "accept"
        }
        socketNotifications.emit('challengeDecision', challengeDecision);
    } else {
        console.log('Challenge refused');
    }
    // on ferme la popup
    const popup = document.getElementById('popup-notif');
    popup.remove();
}

function onChallengeInit(challengeInit) {
    console.log('Challenge init', challengeInit);
    setTimeout(() => {
        localStorage.setItem('room', challengeInit.room);
        localStorage.setItem('opponentName', challengeInit.opponentName);
        localStorage.setItem('opponentId', challengeInit.opponentId);
        localStorage.setItem('player1_elo', challengeInit.player1_elo);
        localStorage.setItem('player2_elo', challengeInit.player2_elo);
        window.location.href = `/1v1game.html`;
    }, 2000);
}