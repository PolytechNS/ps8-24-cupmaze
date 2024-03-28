const utils = require("./utils");

function beginningPositionIsValid(currentPlayer, position) {
    return (currentPlayer === 1) ? position === 1 : position === 9;
}

function getPossibleMoves(playerPosition, elements) {
    const possibleMoves = [];
    if (playerPosition === null) { return null; }
    const ligne = playerPosition[1];
    const colonne = playerPosition[0];

    function checkMove(newColonne, newLigne, possibleMoves, direction) {
        if (newColonne < 1 || newColonne > 9 || newLigne < 1 || newLigne > 9) {
            return;
        }
        const wall = wallFinder(newColonne, newLigne, colonne, ligne, direction, elements);
        const cell = utils.findCase(newColonne, newLigne, elements);
        if (!wall || !wall.isLaid) {
            if (cell.isOccupied) {
                console.log("cell is occupied", newColonne, newLigne);
                const jumpCell = findJumpCell(newColonne, newLigne, direction, elements);
                if (jumpCell) {
                    possibleMoves.push(jumpCell);
                }
            } else {
                possibleMoves.push(cell);
            }
        }
    }

    console.log("ligne : ",ligne," colonne : "+ colonne);
    checkMove(colonne, ligne + 1, possibleMoves, "A");
    checkMove(colonne, ligne - 1, possibleMoves, "B");
    checkMove(colonne - 1, ligne, possibleMoves, "L");
    checkMove(colonne + 1, ligne, possibleMoves, "R");
    return possibleMoves;
}

function wallFinder(newColonne, newLigne, colonne, ligne, direction, elements) {
    switch (direction) {
        case "A":
            return utils.findWall(newColonne, newLigne, "vertical", elements);
        case "B":
            return utils.findWall(colonne, ligne, "vertical", elements);
        case "L":
            return utils.findWall(colonne, ligne, "horizontal", elements);
        case "R":
            return utils.findWall(colonne, newLigne, "horizontal", elements);
    }
}

function findJumpCell(colonne, ligne, direction, elements) {
    let jumpColonne = colonne;
    let jumpLigne = ligne;
    let isWall = false;
    switch (direction) {
        case "A":
            jumpColonne--;
            console.log("A : wall to find", jumpColonne, ligne, "horizontal");
            isWall = utils.findWall(jumpColonne, ligne, "vertical", elements)?.isLaid || false;
            break;
        case "B":
            jumpColonne++;
            console.log("B : wall to find", jumpColonne, ligne, "horizontal");
            isWall = utils.findWall(colonne, ligne, "vertical", elements)?.isLaid || false;
            break;
        case "L":
            //jumpLigne--;
            console.log("L : wall to find", colonne, jumpLigne, "vertical");
            isWall = utils.findWall(colonne, jumpLigne, "horizontal", elements)?.isLaid || false;
            break;
        case "R":
            jumpLigne++;
            console.log("R : wall to find", colonne, jumpLigne, "horizontal");
            isWall = utils.findWall(colonne, jumpLigne, "horizontal", elements)?.isLaid || false;
            break;
    }
    const inBoard = jumpColonne >= 1 && jumpColonne <= 9 && jumpLigne >= 1 && jumpLigne <= 9;
    if (inBoard && !isWall) {
        return utils.findCase(jumpColonne, jumpLigne, elements);
    }
    return null;
}

module.exports = { beginningPositionIsValid, getPossibleMoves };