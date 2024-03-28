//barFriends[0].style.width = "100%";
let barFriends = document.getElementsByClassName("progress-friends");
let barGamesPlayed = document.getElementsByClassName("progress-gamesPlayed");
let barGamesWon = document.getElementsByClassName("progress-gamesWin");

let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();

const params = {
    username: myUsername
};

const queryString = new URLSearchParams(params).toString();

fetch("http://localhost:8000/api/getStats?$"+queryString, {
    method: "GET",
})
    .then(async response => {
        if (!response.ok) {
            alert("ERROR"+response.status);
        }else{
            const data = await response.json();
            console.log(data);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
    });