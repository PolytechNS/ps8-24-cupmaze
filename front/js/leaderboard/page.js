fetch("http://localhost:8000/api/getLeaderboard?$",{
    method: "GET",
})
    .then(async response => {
        if (!response.ok) {
            alert("ERROR"+response.status);
        }else{
            let ret = await response.json();
            console.log(ret);
            for(let i=0; i<ret.length; i++){
                let player = ret[i];
                let playerDiv = document.createElement("tr");

                let playerRank = document.createElement("td");
                playerRank.textContent = i+1;

                let username = document.createElement("td");
                username.textContent = player.username;

                let rank = document.createElement("td");
                rank.textContent = player.elo;

                playerDiv.appendChild(playerRank);
                playerDiv.appendChild(username);
                playerDiv.appendChild(rank);

                document.getElementById("body-leaderboard").appendChild(playerDiv);
            }
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
    });

let buttonBack = document.getElementById("button-back");
buttonBack.onclick = function() {
    window.location.href = 'http://localhost:8000/mainMenu.html';
}