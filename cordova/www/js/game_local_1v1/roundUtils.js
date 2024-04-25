export {startNewRound, setUpNewRound}

/**
 * Event listener que l'on ajoute au bouton sur l'écran anti triche
 * Quand l'utilisateur veut jouer son tour, on va enlever l'écran anti triche, affiche la grille et le texte au dessus
 */
function startNewRound(){
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
    document.getElementById("grid").style.display = 'grid';
    document.getElementById("display-player-1").style.display = "flex";
    document.getElementById("display-player-2").style.display = "flex";
    document.getElementById("display-player-1-walls").style.display = "flex";
    document.getElementById("display-player-2-walls").style.display = "flex";
    document.getElementById("display-player-1-number-actions").style.display = "flex";
    document.getElementById("display-player-2-number-actions").style.display = "flex";
    document.getElementById("display-number-tour").style.display = "flex";
    document.getElementById("player1Image").style.display = "flex";
    document.getElementById("player2Image").style.display = "flex";
    document.getElementById("button-leave-game").style.display = "flex";
}


/**
 * Fonction permettant de pouvoir afficher la pop-up pour l'écran anti-triche
 * On va donc cacher la grille derrière pour éviter la triche
 */
function setUpNewRound(currentPlayer,nbWallsPlayer1,nbWallsPlayer2,numberTour){
    document.getElementById("button-validate-action").style.display = "none";
    document.getElementById("button-undo-action").style.display = "none"
    const leaveGameButtonStyle = document.getElementById("button-leave-game").style;
    leaveGameButtonStyle.display = "none";
    //document.getElementById("popup-ready-message").innerHTML = "C'est à vous de jouer : Joueur " +currentPlayer;
    if(currentPlayer===2) {
        leaveGameButtonStyle.background = "rgba(94,174,200, 0.7)";
        leaveGameButtonStyle.removeProperty("left");
        leaveGameButtonStyle.float = "right";
    }
    else {
        leaveGameButtonStyle.left = "0%";
        leaveGameButtonStyle.removeProperty("float");
        leaveGameButtonStyle.background = "rgba(200, 94, 94, 0.7)";
    }
    document.getElementById("popup").style.display = 'flex';
    document.getElementById("grid").style.display = 'none';
    document.getElementById("display-player-1").style.display = "none";
    document.getElementById("display-player-1").innerHTML = "Joueur 1 : ";
    document.getElementById("display-player-1-walls").style.display = "none";
    document.getElementById("display-player-1-walls").innerHTML = nbWallsPlayer1 + " murs restants";
    document.getElementById("display-player-2").style.display = "none";
    document.getElementById("display-player-2").innerHTML = "Joueur 2 : ";
    document.getElementById("display-player-2-walls").style.display = "none";
    document.getElementById("display-player-2-walls").innerHTML = nbWallsPlayer2 + " murs restants";
    document.getElementById("display-player-1-number-actions").innerHTML = "Nombre d'actions restantes : 1";
    document.getElementById("display-player-1-number-actions").style.display = "none";
    document.getElementById("display-player-2-number-actions").innerHTML = "Nombre d'actions restantes : 1";
    document.getElementById("display-player-2-number-actions").style.display = "none";
    document.getElementById("display-number-tour").innerHTML = "Tour numéro : "+numberTour + "\n" + (currentPlayer=== 1 ? "Joueur 1" : "Joueur 2");
    document.getElementById("display-number-tour").style.display = "none";
    document.getElementById("player1Image").style.display = "none";
    document.getElementById("player2Image").style.display = "none";
}