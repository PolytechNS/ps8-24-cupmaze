let socketNotifications;

function searchAccountOnDB(){
    const usernameWanted = document.getElementById("searchInput").value;
    const params = {
        username: usernameWanted
    };
    const queryString = new URLSearchParams(params).toString();
    fetch("http://localhost:8000/api/searchAccount?$"+queryString, {
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
                    alert(`L'utilisateur ${ret.username} a reçu une demande d'ami.`);
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
    const queryString = new URLSearchParams(params).toString();
    fetch("http://localhost:8000/api/addFriend?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                console.log("Invitation d'ami bien envoyée");
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
    fetch("http://localhost:8000/api/acceptFriendRequest?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("Ajout de l'ami validé");
                console.log("Ajout de l'ami bon");
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
    fetch("http://localhost:8000/api/removeFriend?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                alert("Suppression de l'ami validée");
                console.log("Suppression de l'ami bon");
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}



function retrieveFriends(params){
    //On va mettre a jour notre liste d'amis
    let queryString = new URLSearchParams(params).toString();
    fetch("http://localhost:8000/api/getFriends?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                let ret = await response.json();
                console.log("myFriends succes");
                console.log(ret);
                for (friend of ret){
                    const resultDiv = document.getElementById("friendsList");
                    const usernameParagraph = document.createElement("p");
                    usernameParagraph.textContent = `Nom d'utilisateur : ${friend}`;
                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Supprimer l'ami";
                    deleteButton.addEventListener("click", () => {
                        deleteFriend(friend);
                        alert(`L'utilisateur ${friend} a été supprimé de votre liste d'amis.`);
                    });
                    resultDiv.appendChild(usernameParagraph);
                    resultDiv.appendChild(deleteButton);
                }
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}


function retrieveWaitingFriendsRequests(params){
    // On va retrouver la liste des demandes qui attendent le joueur
    queryString = new URLSearchParams(params).toString();
    fetch("http://localhost:8000/api/getWaitingFriendsRequests?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                let ret = await response.json();
                console.log("myWaitingFriendsRequests succes");
                console.log(ret);
                for (friendsRequest of ret){
                    const resultDiv = document.getElementById("friendsRequests");
                    const usernameParagraph = document.createElement("p");
                    usernameParagraph.textContent = `Nom d'utilisateur : ${friendsRequest.split('&')[0]}`;
                    resultDiv.appendChild(usernameParagraph);
                    const addButton = document.createElement("button");
                    addButton.textContent = "Accepter la demande";
                    addButton.addEventListener("click", () => {
                        acceptFriendRequest(friendsRequest.split('&')[0]);
                        alert(`L'utilisateur ${friendsRequest.split('&')[0]} a été ajouté à votre liste d'amis.`);
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
