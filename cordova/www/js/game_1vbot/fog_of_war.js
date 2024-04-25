export {
    setVisionForPlayer,
    calculateVisibility
}
const INFINITY = 9999;
function calculateVisibility(playerPositions) {
    let position1Column ;
    let position1Line ;
    if (playerPositions.player1!==null) {
        position1Column = parseInt(playerPositions.player1[0]);
        position1Line = parseInt(playerPositions.player1[1]);
    }

    let position2Column ;
    let position2Line ;
    if (playerPositions.player2!==null) {
        position2Column = parseInt(playerPositions.player2[0]);
        position2Line = parseInt(playerPositions.player2[1]);
    }

    const cells = document.querySelectorAll(".cell");
    const wallsByOne = document.querySelectorAll(".laidBy1");
    const wallsByTwo = document.querySelectorAll(".laidBy2");

    cells.forEach(function(cell)
        {
            const cellColumn = parseInt(cell.id[0]);
            const cellLine = parseInt(cell.id[2]);

            //set initial visibility
            if(cellLine<5) cell.visibility="-1";
            else if (cellLine===5) cell.visibility="0";
            else cell.visibility="1";


            let newVisibility=parseInt(cell.visibility);

            //calculate visibility around players

            //Player 1 Position
            if ((cellColumn===position1Column && (cellLine===position1Line+1 || cellLine===position1Line-1))
                || (cellLine===position1Line && (cellColumn===position1Column+1 || cellColumn===position1Column-1))
                || (cellColumn===position1Column && cellLine===position1Line))
                newVisibility--;

            //Player 2 Position
            if ((cellColumn===position2Column && (cellLine===position2Line+1 || cellLine===position2Line-1))
                || (cellLine===position2Line && (cellColumn===position2Column+1 || cellColumn===position2Column-1))
                || (cellColumn===position2Column &&cellLine===position2Line))
                newVisibility++;

            cell.visibility=""+newVisibility;
        }
    )

    //calculate according to walls
    //Player 1 walls
    wallsByOne.forEach(wall=>{
            wallVision(wall,-1)
        }
    )
    //Player 2 walls
    wallsByTwo.forEach(wall=>{
        wallVision(wall,1);
    });

}

function wallVision(wall,visionSign){
    /*
            |  AAL  |  AAR  |
    |  ALL  |  AL   |   AR  |  ARR  |
    |  BLL  |  BL   |   BR  |  BRR  |
            |  BBL  |  BBR  |
     */
    if(wall.id.includes("space")){
        console.log("add fog to : "+wall.id);
        const wallColumn = parseInt(wall.id.match(/\d+/g)[0]);
        const wallLine = parseInt(wall.id.match(/\d+/g)[1]);

        let cellAL = document.getElementById(wallColumn + "-" + wallLine + "~cell");
        let cellBL = document.getElementById(wallColumn + "-" + (wallLine -1 ) + "~cell");
        let cellAR = document.getElementById("" + (wallColumn + 1) + "-" + wallLine + "~cell");
        let cellBR = document.getElementById((wallColumn + 1 ) + "-" + (wallLine - 1) + "~cell");

        let cellAAL = document.getElementById("" + wallColumn + "-" + (wallLine + 1) + "~cell");
        let cellAAR = document.getElementById("" + (wallColumn + 1) + "-" + (wallLine + 1) + "~cell");
        let cellBBL = document.getElementById("" + wallColumn+ "-" + (wallLine - 2) + "~cell");
        let cellBBR = document.getElementById((wallColumn + 1) + "-" + (wallLine - 2) + "~cell");

        let cellALL = document.getElementById("" + (wallColumn - 1) + "-" + wallLine + "~cell");
        let cellARR = document.getElementById("" + (wallColumn + 2) + "-" + wallLine + "~cell");
        let cellBLL = document.getElementById("" + (wallColumn - 1) + "-" + (wallLine -1) + "~cell");
        let cellBRR = document.getElementById((wallColumn + 2) + "-" + (wallLine - 1) + "~cell");
        const plusTwoCells = [cellAL, cellBL, cellAR, cellBR];
        const plusOneCell = [cellAAL, cellAAR, cellBBL, cellBBR, cellALL, cellARR, cellBLL, cellBRR];

        plusTwoCells.forEach(cell => {
            if (cell) cell.visibility = "" + (parseInt(cell.visibility) + 2 * visionSign);
        })
        plusOneCell.forEach(cell => {
            if (cell) cell.visibility = "" + (parseInt(cell.visibility) + 1 * visionSign);
        })
    }
}

function setVisionForPlayer(currentPlayer,playerPositions){
    calculateVisibility(playerPositions);
    const cells = document.querySelectorAll(".cell");
    console.log(" ########### ROUND BREAK ###########")
    cells.forEach(function(cell)
        {
            if((parseInt(cell.visibility)>0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)<0)){
                applyFogOfWar(cell);
            }
            if((parseInt(cell.visibility)<=0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)>=0)){
                removeFogOfWar(cell);
            }
        }
    )
}

function applyFogOfWar(cell){
    cell.style.backgroundColor="lime";
    if(!document.getElementById("fog~"+cell.id.split("~")[0])){
        let fogImage = document.createElement("img");
        fogImage.id = "fog~" + cell.id.split("~")[0];
        fogImage.src = "img/fog.png";
        fogImage.alt = "brouillard de guerre";
        fogImage.classList.add("fog");
        cell.appendChild(fogImage);
    }
}

function removeFogOfWar(cell){
    cell.style.backgroundColor="darkseagreen";
    let fogImage =document.getElementById("fog~"+cell.id.split("~")[0]);
    if(fogImage) {
        cell.removeChild(fogImage)
    }
}