export {
    beginningPositionIsValid,
    getPossibleMoves
};

function beginningPositionIsValid(currentPlayer, position) {
    return (currentPlayer === 1) ? position === "0" : position === "8";
}

function getPossibleMoves(playerPosition, elements) {
    const possibleMoves = [];
    const [line, column] = playerPosition;

    function checkMove(newLine, newColumn, possibleMoves, direction) {
        if (newLine < 0 || newLine > 8 || newColumn < 0 || newColumn > 8) {
            return;
        }

        const wall = (newLine === line) ?
            findWall(newLine, Math.min(column, newColumn), "vertical", elements) :
            findWall(Math.min(line, newLine), column, "horizontal", elements);

        const cell = findCase(newLine, newColumn, elements);

        if (!wall || !wall.isLaid) {
            if (cell.isOccupied) {
                const jumpCell = findJumpCell(newLine, newColumn, direction, elements);
                if (jumpCell) {
                    possibleMoves.push(jumpCell);
                }
            } else {
                possibleMoves.push(cell);
            }
        }
    }

    checkMove(line - 1, column, possibleMoves, "A");
    checkMove(line + 1, column, possibleMoves, "B");
    checkMove(line, column - 1, possibleMoves, "L");
    checkMove(line, column + 1, possibleMoves, "R");

    return possibleMoves;
}

function findJumpCell(line, column, direction, elements) {
    let jumpLine = line;
    let jumpColumn = column;
    let isWall = false;

    switch (direction) {
        case "A":
            jumpLine--;
            isWall = findWall(jumpLine, column, "horizontal", elements)?.isLaid || false;
            break;
        case "B":
            jumpLine++;
            isWall = findWall(line, column, "horizontal", elements)?.isLaid || false;
            break;
        case "L":
            jumpColumn--;
            isWall = findWall(line, jumpColumn, "vertical", elements)?.isLaid || false;
            break;
        case "R":
            jumpColumn++;
            isWall = findWall(line, column, "vertical", elements)?.isLaid || false;
            break;
    }

    const inBoard = jumpLine >= 0 && jumpLine <= 8 && jumpColumn >= 0 && jumpColumn <= 8;

    if (inBoard && !isWall) {
        return findCase(jumpLine, jumpColumn, elements);
    }
    return null;
}

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
