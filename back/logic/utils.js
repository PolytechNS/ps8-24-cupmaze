export {
    findAdjacentWall,
    findAdjacentSpace,
    updateNumberAction,
    findCase,
    findWall,
    findSpace
};


/*
inutile puisque un wall est un objet

function extractWallInfo(wallId) {

}
*/
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
    const line = wall.pos_x;
    const column = wall.pos_y;
    const inclinaison = wall.inclinaison;
    if (inclinaison === "vertical" && line < 8) {
        return findWall(line + 1, column, inclinaison, elements);
    } else if (inclinaison === "horizontal" && column < 8) {
        return findWall(line, column + 1, inclinaison, elements);
    } else {
        if (inclinaison === "vertical") {
            return findWall(line - 1, column, inclinaison, elements);
        }
        return findWall(line, column - 1, inclinaison, elements);
    }
}

function findAdjacentSpace(wallPosition, elements) {
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

function updateNumberAction(nombreAction){

}