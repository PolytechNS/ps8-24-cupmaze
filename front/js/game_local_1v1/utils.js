export {
    extractWallInfo,
    findAdjacentWall,
    findAdjacentSpace,
    highlightElements,
    removeHighlight,
    updateNumberAction,
    updateDueToAction
};

function extractWallInfo(wallId) {
    const [wallType, position] = wallId.split("~");
    const wallPosition = position.split("-");
    return { wallType, wallPosition };
}

/*
    fonction pour trouver le mur adjacent
    en gros grace au nommage j'ai reussi a trouver une logique
    pour parser simplement les ID et trouver le mur adjacent
 */
function findAdjacentWall(wallType, wallPosition) {
    const row = parseInt(wallPosition[0]);
    const col = parseInt(wallPosition[1]);

    if (wallType === "wv" && row < 8) {
        return document.getElementById(`wv~${row + 1}-${col}`);
    } else if (wallType === "wh" && col < 8) {
        return document.getElementById(`wh~${row}-${col + 1}`);
    } else {
        // Si nous sommes à la limite, renvoyons le mur précédent
        if (wallType === "wv") {
            return document.getElementById(`wv~${row-1}-${col}`);
        }
        return document.getElementById(`w${wallType.charAt(1)}~${row}-${col-1}`);
    }
}

/*
    fonction pour trouver l'espace adjacent
    j'ai fait le nommage pour que ce soit simple a parser et retrouver
 */
function findAdjacentSpace(wallPosition) {
    const row = parseInt(wallPosition[0]);
    const col = parseInt(wallPosition[1]);

    const spaceId = `${row}-${col}-space`;

    if (row < 8 && col < 8) {
        var space = document.getElementById(spaceId);
        console.log(space);
        return document.getElementById(spaceId);

    } else {
        if (row === 8) {
            return document.getElementById(`${row - 1}-${col}-space`);
        }
        return document.getElementById(`${row}-${col - 1}-space`);
    }
}

function highlightElements(firstWall, secondWall, space) {
    secondWall.classList.add("wall-hovered");
    space.classList.add("space-hovered");
}

function removeHighlight(firstWall, secondWall, space) {
    firstWall.classList.remove("wall-hovered");
    secondWall.classList.remove("wall-hovered");
    space.classList.remove("space-hovered");
}


function updateNumberAction(nombreAction){
    document.getElementById("display-number-actions").innerHTML = "Nombre d'actions restantes : "+nombreAction;
}

function updateDueToAction(actionsToDo){
    actionsToDo--;
    document.getElementById("button-validate-action").style.display = "flex";
    document.getElementById("button-undo-action").style.display = "flex";
    updateNumberAction(0);
}