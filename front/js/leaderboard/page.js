var baseUrl = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000';
} else {
    baseUrl = 'http://cupmaze.ps8.academy';
}
fetch(baseUrl+"/api/getLeaderboard?$",{
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

                if(i+1 <=5){
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
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
    });


let buttonBack = document.getElementById("button-back");
buttonBack.onclick = function() {
    window.location.href = baseUrl+'/mainMenu.html';
}


let closePopup = document.getElementById("closePopup");
closePopup.onclick = function() {
    document.getElementById("popup").style.display = "none";
}

let buttonResearchAccount = document.getElementById("searchAccount");
buttonResearchAccount.onclick = function() {
    const username = document.getElementById("searchInput").value;
    fetch(baseUrl+"/api/getLeaderboard?$",{
        method: "GET",
    })
        .then(async response => {
            if (!response.ok) {
                alert("ERROR"+response.status);
            }else{
                let ret = await response.json();
                let found = false;
                for(let i=0; i<ret.length; i++) {
                    let player = ret[i];
                    if (player.username === username) {
                        document.getElementById("popup").style.display = "block";
                        document.getElementById("name").textContent = "Nom du joueur : "+player.username;
                        document.getElementById("classement").textContent = "Classement du joueur : "+(i+1);
                        document.getElementById("elo").textContent = "Elo du joueur : "+player.elo;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    alert("Joueur non trouvé");
                }
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}