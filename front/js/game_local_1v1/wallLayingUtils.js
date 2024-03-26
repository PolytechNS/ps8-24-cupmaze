export {isWallPlacementValid,updateNumberWallsDisplay}
/*
fonction pour verifier que le mur est sur un placement valide
 */
function isWallPlacementValid(firstWall, secondWall, space) {
    const isLaid = firstWall.classList.contains("wall-laid") || secondWall.classList.contains("wall-laid") || space.classList.contains("wall-laid");
    return !isLaid;
}

function updateNumberWallsDisplay(currentPlayer,nbWallsPlayer1,nbWallsPlayer2){
    document.getElementById("display-player-"+currentPlayer+"-walls").innerHTML = "Nombre de murs restants : "+(currentPlayer===1? nbWallsPlayer1:nbWallsPlayer2);
}