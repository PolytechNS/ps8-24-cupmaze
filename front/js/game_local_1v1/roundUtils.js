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
    document.getElementById("button-save-game").style.display = "flex";
}


/**
 * Fonction permettant de pouvoir afficher la pop-up pour l'écran anti-triche
 * On va donc cacher la grille derrière pour éviter la triche
 */
function setUpNewRound(currentPlayer,nbWallsPlayer1,nbWallsPlayer2,numberTour){
    document.getElementById("button-validate-action").style.display = "none";
    document.getElementById("button-undo-action").style.display = "none"
    document.getElementById("button-save-game").style.display = "none";
    document.getElementById("popup-ready-message").innerHTML = "C'est à vous de jouer : Joueur " +currentPlayer;
    document.getElementById("popup").style.display = 'flex';
    document.getElementById("grid").style.display = 'none';
    document.getElementById("display-player-1").style.display = "none";
    document.getElementById("display-player-1").innerHTML = "Joueur 1 : ";
    document.getElementById("display-player-1-walls").style.display = "none";
    document.getElementById("display-player-1-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer1;
    document.getElementById("display-player-2").style.display = "none";
    document.getElementById("display-player-2").innerHTML = "Joueur 2 : ";
    document.getElementById("display-player-2-walls").style.display = "none";
    document.getElementById("display-player-2-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer2;
    document.getElementById("display-player-1-number-actions").innerHTML = "Nombre d'actions restantes : 1";
    document.getElementById("display-player-1-number-actions").style.display = "none";
    document.getElementById("display-player-2-number-actions").innerHTML = "Nombre d'actions restantes : 1";
    document.getElementById("display-player-2-number-actions").style.display = "none";
    document.getElementById("display-number-tour").innerHTML = "Tour numéro : "+numberTour;
    document.getElementById("display-number-tour").style.display = "none";
    document.getElementById("player1Image").style.display = "none";
    document.getElementById("player2Image").style.display = "none";
}