
let socketNotifications;

let friendsOfUser;
let waitingListOfFriendsRequests;
let username = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();

var baseUrl = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000';
} else {
    baseUrl = 'http://cupmaze.ps8.academy';
}



function searchAccountOnDB(){
    const usernameWanted = document.getElementById("searchInput").value;
    const params = {
        username: usernameWanted
    };
    const queryString = new URLSearchParams(params).toString();
    fetch(baseUrl+"/api/searchAccount?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("Utilisateur retrouvé");
                let ret = await response.json();
                const resultDiv = document.getElementById("searchResult");
                resultDiv.innerHTML = "";
                const usernameParagraph = document.createElement("p");
                usernameParagraph.textContent = `Nom d'utilisateur : ${ret.username}`;
                resultDiv.appendChild(usernameParagraph);
                const addButton = document.createElement("button");
                addButton.textContent = "Envoyer une demande d'ami";
                addButton.addEventListener("click", () => {
                    addFriendRequest(ret.username);
                });
                resultDiv.appendChild(addButton);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}

function addFriendRequest(usernameToAdd) {
    let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
    const params = {
        usernameAdder: myUsername,
        usernameToAdd: usernameToAdd
    };

    if(usernameToAdd === myUsername){
        alert("Vous ne pouvez pas vous ajouter vous-même en ami.");
        return;
    }

    if(friendsOfUser.includes(usernameToAdd)){
        alert("Vous êtes déjà ami avec cet utilisateur.");
        return;
    }

    if(waitingListOfFriendsRequests.includes(usernameToAdd)){
        alert("Veuillez accepter la demande d'ami de cet utilisateur.");
        return;
    }

    const queryString = new URLSearchParams(params).toString();
    fetch(baseUrl+"/api/addFriend?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                if(response.status === 402){
                    alert("Vous êtes déjà ami avec cet utilisateur.");
                } else {
                    alert("ERROR "+response.status);
                }
            }else{
                console.log("Invitation d'ami bien envoyée");
                alert("Invitation d'ami bien envoyée");
                socketNotifications.emit('addFriendRequest', { sender: myUsername, receiver: usernameToAdd });
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}


function acceptFriendRequest(usernameAdder) {
    let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
    const params = {
        usernameAdder: myUsername,
        usernameToAdd: usernameAdder
    };
    const queryString = new URLSearchParams(params).toString();
    fetch(baseUrl+"/api/acceptFriendRequest?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("Ajout de l'ami validé");
                console.log("Ajout de l'ami bon");
                retrieveFriends(null);
                retrieveWaitingFriendsRequests(null);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}


function deleteFriend(usernameToDelete) {
    let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
    const params = {
        username: myUsername,
        usernameToDelete: usernameToDelete
    };
    const queryString = new URLSearchParams(params).toString();
    fetch(baseUrl+"/api/removeFriend?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("Suppression de l'ami validée");
                console.log("Suppression de l'ami bon");
                retrieveFriends(null);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}



function retrieveFriends(params){
    if(params == null){
        let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
        params = {
            username: myUsername
        };
    }

    const resultDiv = document.getElementById("friendsList");
    resultDiv.innerHTML = "";

    //On va mettre a jour notre liste d'amis
    let queryString = new URLSearchParams(params).toString();
    fetch(baseUrl+"/api/getFriends?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                let ret = await response.json();
                console.log("myFriends succes");
                console.log(ret);
                friendsOfUser = ret;
                for (friend of ret){
                    const resultDiv = document.getElementById("friendsList");
                    const usernameParagraph = document.createElement("p");
                    usernameParagraph.textContent = `Nom d'utilisateur : ${friend}`;

                    const buttonDiv = document.createElement("div");
                    buttonDiv.classList.add("buttonDiv");

                    const challengeButton = document.createElement("button");
                    const challengeIcone = document.createElement("img");
                    challengeIcone.src = "imageResources/icone_defi.png";
                    challengeIcone.style.width = "25px"; // Réduire la largeur de l'image
                    challengeIcone.style.height = "25px"; // Réduire la hauteur de l'image
                    challengeButton.appendChild(challengeIcone);
                    buttonDiv.appendChild(challengeButton);

                    challengeButton.onclick = (function(friend) {
                        return function() {
                            sendChallenge(friend);
                        };
                    })(friend);

                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Supprimer l'ami";
                    buttonDiv.appendChild(deleteButton);
                    deleteButton.onclick = (function(friend) {
                        return function() {
                            deleteFriend(friend);
                        };
                    })(friend);

                    const buttonChat = document.createElement("button");
                    buttonChat.classList.add('chat');
                    buttonChat.textContent = 'Chat';
                    buttonDiv.appendChild(buttonChat);
                    buttonChat.onclick = (function(friend) {
                        return function() {
                            if(username.localeCompare(friend) < 0 ){
                                window.location.href = baseUrl +'/privateChat.html?idchat='+username+friend;
                            } else {
                                window.location.href = baseUrl +'/privateChat.html?idchat='+friend+username;
                            }
                        };
                    })(friend);

                    resultDiv.appendChild(usernameParagraph);
                    resultDiv.appendChild(buttonDiv);
                }
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}


function retrieveWaitingFriendsRequests(params){
    if(params == null){
        let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
        params = {
            username: myUsername
        };
    }

    const resultDiv = document.getElementById("friendsRequests");
    resultDiv.innerHTML = "";

    // On va retrouver la liste des demandes qui attendent le joueur
    queryString = new URLSearchParams(params).toString();
    fetch(baseUrl+"/api/getWaitingFriendsRequests?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            } else {
                let ret = await response.json();
                console.log("myWaitingFriendsRequests succes");
                console.log(ret);
                waitingListOfFriendsRequests = ret;
                for (friendsRequest of ret){
                    const resultDiv = document.getElementById("friendsRequests");
                    const usernameParagraph = document.createElement("p");
                    usernameParagraph.textContent = `Nom d'utilisateur : ${friendsRequest.split('&')[0]}`;
                    resultDiv.appendChild(usernameParagraph);
                    const addButton = document.createElement("button");
                    addButton.textContent = "Accepter la demande";
                    addButton.addEventListener("click", () => {
                        acceptFriendRequest(friendsRequest.split('&')[0]);
                        //alert(`L'utilisateur ${friendsRequest.split('&')[0]} a été ajouté à votre liste d'amis.`);
                    });
                    resultDiv.appendChild(addButton);
                }
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}



function main(){
    let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
    const params = {
        username: myUsername
    };

    retrieveFriends(params);
    retrieveWaitingFriendsRequests(params);

    socketNotifications= io("/notifications");
    socketNotifications.emit('joinRoom', myUsername);
    window.addEventListener('beforeunload', () => {
        socketNotifications.disconnect();
    });
}

// Appeler main() lorsque le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", function() {
    main();
});


let buttonBack = document.getElementById("back");
buttonBack.addEventListener("click", function() {
    window.location.href = baseUrl + "/mainMenu.html";
});


/* CHALLENGE */

function decodeJWTPayload(token) {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function sendChallenge(friend) {
    console.log('sendChallenge', friend);
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
    socketNotifications.on('challengeRefused', (challengeRefused) => onChallengeRefused(challengeRefused));
}

function onReceiveChallenge(receiveChallenge) {
    // on affiche une popup pour accepter ou refuser le challenge
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
        const popup = document.getElementById('popup-notif');
        popup.removeChild(popup.lastChild);
        popup.removeChild(popup.lastChild);
        const message = document.getElementById('popup-notif-content');
        message.innerText = 'Défi accepté !';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 1500);
    } else {
        const popup = document.getElementById('popup-notif');
        popup.removeChild(popup.lastChild);
        popup.removeChild(popup.lastChild);
        const message = document.getElementById('popup-notif-content');
        message.innerText = 'Défi refusé !';
        let challengeDecision = {
            "senderToken": getCookie('jwt'),
            "userId": decodeJWTPayload(getCookie('jwt')).id,
            "friendId": senderId,
            "friendName": senderName,
            "friendToken": senderToken,
            "decision": "refuse"
        }
        socketNotifications.emit('challengeDecision', challengeDecision);
        setTimeout(() => {
            popup.style.display = 'none';
        }, 1500);

    }
}

function onChallengeRefused(challengeRefused) {
    console.log('Challenge refused', challengeRefused);
    const popup = document.getElementById('popup-notif');
    popup.style.display = 'block';
    popup.style.backgroundColor = 'red';
    popup.style.color = 'white';
    const message = document.getElementById('popup-notif-content');
    message.innerText = `${challengeRefused.opponentName} a refusé votre défi.`;
    setTimeout(() => {
        popup.style.display = 'none';
    }, 1500);
}

function onChallengeInit(challengeInit) {
    console.log('Challenge init', challengeInit);
    const popup = document.getElementById('popup-notif');
    popup.style.display = 'block';
    popup.style.backgroundColor = 'green';
    popup.style.color = 'white';
    const message = document.getElementById('popup-notif-content');
    message.innerText = `Défi accepté, vous allez être redirigé vers la partie en ligne.`;

    setTimeout(() => {
        localStorage.setItem('room', challengeInit.room);
        localStorage.setItem('opponentName', challengeInit.opponentName);
        localStorage.setItem('opponentId', challengeInit.opponentId);
        localStorage.setItem('player1_elo', challengeInit.player1_elo);
        localStorage.setItem('player2_elo', challengeInit.player2_elo);
        popup.style.display = 'none';
        window.location.href = `/online1v1.html`;
    }, 2000);
}

