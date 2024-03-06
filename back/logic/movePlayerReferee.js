const utils = require("./utils");

function beginningPositionIsValid(currentPlayer, position) {
    return (currentPlayer === 1) ? position === 1 : position === 9;
}

function getPossibleMoves(playerPosition, elements) {
    const possibleMoves = [];
    if (playerPosition === null) { return null; }
    const column = playerPosition[1];
    const line = playerPosition[0];


    function checkMove(newLine, newColumn, possibleMoves, direction) {
        console.log("newLine", newLine);
        console.log("newColumn", newColumn);
        if (newLine < 1 || newLine > 9 || newColumn < 1 || newColumn > 9) {
            return;
        }

        const wall = (newLine === line) ?
            utils.findWall(newLine, Math.min(column, newColumn), "vertical", elements) :
            utils.findWall(Math.min(line, newLine), column, "horizontal", elements);


        const cell = utils.findCase(newLine, newColumn, elements);
        console.log("cell", cell);
        if (!wall || !wall.isLaid) {
            if (cell.isOccupied) {
                console.log("cell.isOccupied", cell.isOccupied);
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
            isWall = utils.findWall(jumpLine, column, "horizontal", elements)?.isLaid || false;
            break;
        case "B":
            jumpLine++;
            isWall = utils.findWall(line, column, "horizontal", elements)?.isLaid || false;
            break;
        case "L":
            jumpColumn--;
            isWall = utils.findWall(line, jumpColumn, "vertical", elements)?.isLaid || false;
            break;
        case "R":
            jumpColumn++;
            isWall = utils.findWall(line, column, "vertical", elements)?.isLaid || false;
            break;
    }

    const inBoard = jumpLine >= 0 && jumpLine <= 8 && jumpColumn >= 0 && jumpColumn <= 8;

    if (inBoard && !isWall) {
        return utils.findCase(jumpLine, jumpColumn, elements);
    }
    return null;
}

module.exports = { beginningPositionIsValid, getPossibleMoves };