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
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}

function main(){
    // On va retrouver la liste des demandes qui attendent le joueur
    let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();
    const params = {
        username: myUsername
    };
    const queryString = new URLSearchParams(params).toString();
    fetch("http://localhost:8000/api/getWaitingFriendsRequests?$"+queryString, {
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                let ret = await response.json();
                console.log("myWaitingFriendsRequests succes");
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

function acceptFriendRequest(splitElement) {
    console.log("acceptFriendRequest");
}

// Appeler main() lorsque le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", function() {
    main();
});
