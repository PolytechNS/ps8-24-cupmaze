export {
    beginningPositionIsValid,
    getPossibleMoves
};

function beginningPositionIsValid(currentPlayer, position) {
    return (currentPlayer === 1) ? position === 0 : position === 8;
}

function getPossibleMoves(position) {
    if (position === null) { return; }
    const possibleMoves = [];
    const [line, column] = position.split("-").map((value) => parseInt(value));

    function checkMove(newLine, newColumn, possibleMoves, direction) {
        if (newLine < 0 || newLine > 8 || newColumn < 0 || newColumn > 8) {
            return;
        }
        const cell = document.getElementById(`${newLine}-${newColumn}~cell`);
        const wallId = (newLine === line) ? `wv~${line}-${Math.min(column, newColumn)}` : `wh~${Math.min(line, newLine)}-${column}`;
        const wall = document.getElementById(wallId);
        if (!wall.classList.contains("wall-laid")){
            if (cell.classList.contains("occupied")) {
                const jumpCell = findJumpCell(newLine, newColumn, direction);
                if (jumpCell) {
                    console.log(jumpCell);
                    possibleMoves.push(jumpCell);
                    jumpCell.classList.add("possible-move");
                }
            }
            else{
                possibleMoves.push(cell);
                cell.classList.add("possible-move");
            }
        }
    }

    // verifie l'axe vertical
    checkMove(line - 1, column, possibleMoves, "A");
    checkMove(line + 1, column, possibleMoves, "B");
    // verifie l'axe horizontal
    checkMove(line, column - 1, possibleMoves, "L");
    checkMove(line, column + 1, possibleMoves, "R");
    return possibleMoves;
}

function findJumpCell(line, column, direction) {
    let jumpLine=line;
    let jumpColumn=column;
    let isWall=false;
    switch (direction){
        case "A":
            jumpLine--;
            isWall=document.getElementById("wh~"+jumpLine+"-"+column).classList.contains("wall-laid");
            break;
        case "B":
            jumpLine++;
            isWall=document.getElementById("wh~"+line+"-"+column).classList.contains("wall-laid");
            break;
        case "L":
            jumpColumn--;
            isWall=document.getElementById("wv~"+line+"-"+jumpColumn).classList.contains("wall-laid");
            break;
        case "R":
            jumpColumn++;
            isWall=document.getElementById("wv~"+line+"-"+column).classList.contains("wall-laid");
            break;
        default : break;
    }
    const inBoard = jumpLine >= 0 && jumpLine <= 8 && jumpColumn >= 0 && jumpColumn <= 8;
    console.log(`direction=${direction} isWall=${isWall} cell=${jumpLine}-${jumpColumn}`)
    if (inBoard && !isWall) {
        return document.getElementById(`${jumpLine}-${jumpColumn}~cell`);
    }
    return null;
}