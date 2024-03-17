let username = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
let socket=io("/api/game");
//socket.emit("clearGames",username);
document.getElementById('button-launch-botGame').addEventListener('click', function() {
    window.location.href = 'http://localhost:8000/botgame.html';
});
document.getElementById('button-launch-localGame').addEventListener('click', function() {
    window.location.href = 'http://localhost:8000/index.html'; //Changer le nom de index.html
});
document.getElementById('button-retrieveGame').addEventListener('click', function() {
    window.location.href = 'http://localhost:8000/botgame.html?intent=retrieveGame'; //Changer le nom de index.html
});
document.getElementById('button-1v1game').addEventListener('click', function() {
    window.location.href = 'http://localhost:8000/waiting_room.html';
});
console.log(username);
document.getElementById('nameCurrentPlayer').innerText = "Bienvenue "+username+" :";
document.getElementById('searchFriends').addEventListener('click', function () {
    window.location.href = 'http://localhost:8000/searchFriends.html';
});

const closePopupButton = document.getElementById("closePopup");
closePopupButton.onclick = function() {
    document.getElementById("popup").style.display = "none";
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
                    document.getElementById("popup-namePlayer").innerText = "Nom d'utilisateur: "+friend;
                    document.getElementById("popup-eloPlayer").innerText = "Elo de l'utilisateur: "+255;
                }

                const buttonChallenge = document.createElement("button");
                buttonChallenge.classList.add('challenge');
                buttonChallenge.textContent = 'Challenge!';

                const buttonChat = document.createElement("button");
                buttonChat.classList.add('chat');
                buttonChat.textContent = 'Chat';

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
    alert(`You have a friend request from ${data.sender}`);
});

// On va fermer la connexion du socket lorsque l'utilisateur quitte la page principale
window.addEventListener('beforeunload', () => {
    socketNotifications.disconnect();
});

