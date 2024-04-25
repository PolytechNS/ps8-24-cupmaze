//barFriends[0].style.width = "100%";
let barFriends = document.getElementsByClassName("progress-friends");
let barGamesPlayed = document.getElementsByClassName("progress-gamesPlayed");
let barGamesWon = document.getElementsByClassName("progress-gamesWin");
let printElo = document.getElementById("league-elo");

let myUsername = document.cookie.split('; ').find(row => row.startsWith('Nameaccount')).split('=')[1].toString();

const params = {
    username: myUsername
};

let queryString = new URLSearchParams(params).toString();


var baseUrl = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrl = 'http://localhost:8000';
} else {
    baseUrl = 'http://cupmaze.ps8.academy';
}

fetch(baseUrl+"/api/getStats?$"+queryString, {
    method: "GET",
})
    .then(async response => {
        if (!response.ok) {
            alert("ERROR"+response.status);
        }else{
            const data = await response.json();
            console.log(data);

            let elo = data.elo;
            printElo.innerText = "Ligue " + findLeague(elo)[0] + "\nElo " + elo;
            document.getElementById("elo-medal").src = findLeague(elo)[1];
            document.getElementById("elo-medal").style.width = "100px";

            let friends = data.friendsList.length;
            let data_to_put = friends % 5;
            barFriends[0].style.width = data_to_put * 20 + "%";
            let lvl = Math.floor(friends / 5); // Calcul du niveau d'amis en divisant le nombre d'amis par 5
            document.getElementById("level-friends-add").innerText = "Niveau actuel: " + lvl.toString() +"\nProgression " + (data_to_put).toString() + " /5";
            document.getElementById("friends-medal").src = getMedal(lvl);


            let gamesWin = data.gamesWin;
            data_to_put = gamesWin % 5;
            lvl = Math.floor(gamesWin / 5); // Calcul du niveau de parties gagnées en divisant le nombre de parties gagnées par 5
            barGamesWon[0].style.width = data_to_put * 20 + "%";
            document.getElementById("level-games-win").innerText = "Niveau actuel: " + lvl.toString() +"\nProgression " + (data_to_put).toString() + " /5";
            document.getElementById("games-win-medal").src = getMedal(lvl);

            let gamesPlayed = data.gamesWin + data.gamesLoose;
            data_to_put = gamesPlayed % 5;
            lvl = Math.floor(gamesPlayed / 5); // Calcul du niveau de parties jouées en divisant le nombre de parties jouées par 5
            barGamesPlayed[0].style.width = data_to_put * 20 + "%";
            document.getElementById("level-games-played").innerText = "Niveau actuel: " + lvl.toString() +"\nProgression " + (data_to_put).toString() + " /5";
            document.getElementById("games-played-medal").src = getMedal(lvl);

        }
    })
    .catch(error => {
        console.error('Erreur:', error);
    });



let buttonBack = document.getElementById("back");
buttonBack.onclick = function() {
    window.location.href = baseUrl +'/mainMenu.html';
}


function findLeague(elo){
    if(elo < 400){
        return ["Bronze", "img/rank_bronze.png"];
    }else if(elo < 600){
        return ["Silver", "img/rank_silver.png"];
    }else if(elo < 800){
        return ["Gold", "img/rank_gold.png"];
    }else if(elo < 1000){
        return ["Platinum", "img/rank_platinum.png"];
    }else if(elo < 1200){
        return ["Diamond", "img/rank_diamond.png"];
    }else if(elo < 1400){
        return ["Master", "img/rank_master.png"];
    }else{
        return ["Challenger", "img/rank_challenger.png"];
    }
}


function getMedal(lvl_rank){
    if(lvl_rank ===0){
        return "img/rank0_logo.png";
    } else if (lvl_rank === 1){
        return "img/rank1_logo.png";
    } else if (lvl_rank === 2){
        return "img/rank2_logo.png";
    } else if (lvl_rank === 3){
        return "img/rank3_logo.png";
    } else if (lvl_rank === 4 || lvl_rank > 4){
        return "img/rank4_logo.png";
    }
}