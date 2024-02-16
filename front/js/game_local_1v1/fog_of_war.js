
export {
    setVisionForPlayer
}
const INFINITY = 9999;
function calculateVisibility(playerPositions) {
    let position1Line ;
    let position1Column ;
    if (playerPositions.player1) {
        position1Line = parseInt(playerPositions.player1[0]);
        position1Column = parseInt(playerPositions.player1[2]);
    }

    let position2Line ;
    let position2Column ;
    if (playerPositions.player2) {
        position2Line = parseInt(playerPositions.player2[0]);
        position2Column = parseInt(playerPositions.player2[2]);
    }

    const cells = document.querySelectorAll(".cell");
    const wallsByOne = document.querySelectorAll(".laidBy1");
    const wallsByTwo = document.querySelectorAll(".laidBy2");

    cells.forEach(function(cell)
        {
            const cellLine = parseInt(cell.id[0]);
            const cellColumn = parseInt(cell.id[2]);

            //set initial visibility
            if(cellLine<4) cell.visibility="-1";
            else if (cellLine===4) cell.visibility="0";
            else cell.visibility="1";


            let newVisibility=parseInt(cell.visibility);

            //calculate visibility around players

            //Player 1 Position
            if ((cellLine===position1Line && (cellColumn===position1Column+1 || cellColumn===position1Column-1))
                || (cellColumn===position1Column && (cellLine===position1Line+1 || cellLine===position1Line-1))
                || (cellLine===position1Line && cellColumn===position1Column))
                newVisibility--;

            //Player 2 Position
            if ((cellLine===position2Line && (cellColumn===position2Column+1 || cellColumn===position2Column-1))
                || (cellColumn===position2Column && (cellLine===position2Line+1 || cellLine===position2Line-1))
                || (cellLine===position2Line &&cellColumn===position2Column))
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

    for(let i=0; i!==8; i++){
        for(let j=0; j!==8; j++){
            let cell = document.getElementById(j+"-"+i+"~cell");
            console.log(cell.visibility);
        }
    }

}

function wallVision(wall,visionSign){
    /*
            |  AAL  |  AAR  |
    |  ALL  |  AL   |   AR  |  ARR  |
    |  BLL  |  BL   |   BR  |  BRR  |
            |  BBL  |  BBR  |
     */
    if(wall.id.includes("space")){
        const wallLine = parseInt(wall.id.match(/\d+/g)[0]);
        const wallColumn = parseInt(wall.id.match(/\d+/g)[1]);

        let cellAL = document.getElementById(wallLine + "-" + wallColumn + "~cell");
        let cellBL = document.getElementById((wallLine + 1) + "-" + wallColumn + "~cell");
        let cellAR = document.getElementById("" + wallLine + "-" + (wallColumn + 1) + "~cell");
        let cellBR = document.getElementById((wallLine + 1) + "-" + (wallColumn + 1) + "~cell");

        let cellAAL = document.getElementById("" + (wallLine - 1) + "-" + wallColumn + "~cell");
        let cellAAR = document.getElementById("" + (wallLine - 1) + "-" + (wallColumn + 1) + "~cell");
        let cellBBL = document.getElementById("" + (wallLine + 2) + "-" + wallColumn + "~cell");
        let cellBBR = document.getElementById((wallLine + 2) + "-" + (wallColumn + 1) + "~cell");

        let cellALL = document.getElementById("" + wallLine + "-" + (wallColumn - 1) + "~cell");
        let cellARR = document.getElementById("" + wallLine + "-" + (wallColumn + 2) + "~cell");
        let cellBLL = document.getElementById("" + (wallLine + 1) + "-" + (wallColumn - 1) + "~cell");
        let cellBRR = document.getElementById((wallLine + 1) + "-" + (wallColumn + 2) + "~cell");

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
            let player1circle = document.getElementById("player" + 1 + "-circle");
            let player2circle = document.getElementById("player" + 2 + "-circle");
            if(cell.id===playerPositions["player"+currentPlayer]){
                cell.visibility=""+(INFINITY*(currentPlayer===1? -1:1));
                document.getElementById("player" + currentPlayer + "-circle").style.display="block";
            }
            if((parseInt(cell.visibility)>0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)<0)){
                applyFogOfWar(cell);
                //hide player if on cell
                if (currentPlayer === 1 && playerPositions.player2 === cell.id) {
                    player2circle.style.display = 'none';
                }
                if (currentPlayer === 2 && playerPositions.player1 === cell.id) {
                    player1circle.style.display = 'none';
                }
            }
            if((parseInt(cell.visibility)<=0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)>=0)){
                removeFogOfWar(cell);

                //show player if on cell
                if(currentPlayer === 1 && playerPositions.player2 === cell.id) {
                    player2circle.style.display="block";
                }
                if(currentPlayer === 2 && playerPositions.player1 === cell.id) {
                    player1circle.style.display="block";
                }
            }
        }
    )
}

function applyFogOfWar(cell){
    cell.style.backgroundColor="lime";
    if(!document.getElementById("fog~"+cell.id.split("~")[0])){
        let fogImage = document.createElement("img");
        fogImage.id = "fog~" + cell.id.split("~")[0];
        fogImage.src = "imageResources/fog.png";
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