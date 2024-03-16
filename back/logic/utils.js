const {Wall} = require("./Wall");
const {Case} = require("./Case");
const {Space} = require("./Space");

function findWall(pos_x, pos_y, inclinaison, elements) {
    return elements.find((element) =>
        element instanceof Wall &&
        element.pos_x === pos_x &&
        element.pos_y === pos_y &&
        element.inclinaison === inclinaison);
}

function findCase(pos_x, pos_y, elements) {
    return elements.find((element) =>
        element instanceof Case &&
        element.pos_x === pos_x &&
        element.pos_y === pos_y);
}

function findSpace(pos_x, pos_y, elements) {
    return elements.find((element) =>
        element instanceof Space &&
        element.pos_x === pos_x &&
        element.pos_y === pos_y);
}

function findAdjacentWall(wall, elements) {
    if (wall === undefined) { return undefined; }
    const colonne = wall.pos_x;
    const ligne = wall.pos_y;
    const inclinaison = wall.inclinaison;
    if (inclinaison === "vertical" && colonne < 9) {
        return findWall(colonne, ligne-1, inclinaison, elements);
    } else if (inclinaison === "horizontal" && ligne < 9) {
        return findWall(colonne+1, ligne, inclinaison, elements);
    } else {
        if (inclinaison === "vertical") {
            return findWall(colonne, ligne, inclinaison, elements);
        }
        return findWall(colonne+1, ligne, inclinaison, elements);
    }
}

function findAdjacentSpace(wallPosition, elements) {
    if (wallPosition === undefined) { return undefined; }
    const line = wallPosition.pos_x;
    const column = wallPosition.pos_y;
    if (line < 8 && column < 8) {
        return findSpace(line, column, elements);
    } else {
        if (line === 8) {
            return findSpace(line - 1, column, elements);
        }
        return findSpace(line, column - 1, elements);
    }
}

// fonction qui precise que les murs et l'espace sont posés
function highlightElements(firstWall, secondWall, space) {
    firstWall.setIsLaid(true);
    secondWall.setIsLaid(true);
    space.setIsLaid(true);
}


module.exports = { findWall, findCase, findSpace, findAdjacentWall, findAdjacentSpace };
