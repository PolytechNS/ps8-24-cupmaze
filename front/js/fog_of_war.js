export {
    setVisionForPlayer
}
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

}

function wallVision(wall,visionSign){
    const hORv = wall.id.split("~")[0]
    const wallLine = parseInt(wall.id.match(/\d+/g)[0]);
    const wallColumn = parseInt(wall.id.match(/\d+/g)[1]);


    if(!wall.id.includes("space")) {
        //contact with horizontal wall
        if (hORv === "wh") {
            let cellAbove = document.getElementById(wallLine + "-" + wallColumn + "~cell");
            let cellBelow = document.getElementById((wallLine + 1) + "-" + wallColumn + "~cell");

            if (cellAbove) cellAbove.visibility = "" + (parseInt(cellAbove.visibility) + 2*visionSign);
            if (cellBelow) cellBelow.visibility = "" + (parseInt(cellBelow.visibility) + 2*visionSign);

            if(wall.classList.contains("firstWall")){
                let cellLeftAbove = document.getElementById(""+wallLine+"-"+(wallColumn-1)+"~cell");
                if(cellLeftAbove) cellLeftAbove.visibility=""+ (parseInt(cellLeftAbove.visibility)+1*visionSign);

                let cellLeftBelow = document.getElementById(""+(wallLine+1)+"-"+(wallColumn-1)+"~cell");
                if(cellLeftBelow) cellLeftBelow.visibility=""+ (parseInt(cellLeftBelow.visibility)+1*visionSign);
            }
            else{
                let cellRightAbove = document.getElementById(""+wallLine+"-"+(wallColumn+1)+"~cell");
                if(cellRightAbove) cellRightAbove.visibility=""+ (parseInt(cellRightAbove.visibility)+1*visionSign);

                let cellRightBelow = document.getElementById(""+(wallLine+1)+"-"+(wallColumn+1)+"~cell");
                if(cellRightBelow) cellRightBelow.visibility=""+ (parseInt(cellRightBelow.visibility)+1*visionSign);
            }

            let cellDoubleAbove = document.getElementById((wallLine - 1) + "-" + wallColumn + "~cell");
            let cellDoubleBelow = document.getElementById((wallLine + 2) + "-" + wallColumn + "~cell");

            if (cellDoubleAbove) cellDoubleAbove.visibility = "" + (parseInt(cellDoubleAbove.visibility) + 1*visionSign);
            if (cellDoubleBelow) cellDoubleBelow.visibility = "" + (parseInt(cellDoubleBelow.visibility) + 1*visionSign);
        }

        //contact with vertical wall
        if(hORv==="wv"){
            let cellLeft = document.getElementById(""+wallLine+"-"+wallColumn+"~cell");
            let cellRight = document.getElementById(""+wallLine+"-"+(wallColumn+1)+"~cell");

            if(cellLeft) cellLeft.visibility =""+(parseInt(cellLeft.visibility)+2*visionSign);
            if(cellRight) cellRight.visibility =""+(parseInt(cellRight.visibility)+2*visionSign);

            if(wall.classList.contains("firstWall")){
                let cellAboveLeft = document.getElementById(""+(wallLine-1)+"-"+wallColumn+"~cell");
                if(cellAboveLeft) cellAboveLeft.visibility=""+ (parseInt(cellAboveLeft.visibility)+1*visionSign);

                let cellAboveRight = document.getElementById(""+(wallLine-1)+"-"+(wallColumn+1)+"~cell");
                if(cellAboveRight) cellAboveRight.visibility=""+ (parseInt(cellAboveRight.visibility)+1*visionSign);
            }
            else{
                let cellBelowLeft = document.getElementById(""+(wallLine+1)+"-"+wallColumn+"~cell");
                if(cellBelowLeft) cellBelowLeft.visibility=""+ (parseInt(cellBelowLeft.visibility)+1*visionSign);

                let cellBelowRight = document.getElementById(""+(wallLine+1)+"-"+(wallColumn+1)+"~cell");
                if(cellBelowRight) cellBelowRight.visibility=""+ (parseInt(cellBelowRight.visibility)+1*visionSign);
            }

            let cellDoubleLeft = document.getElementById(""+wallLine+"-"+(wallColumn-1)+"~cell");
            let cellDoubleRight = document.getElementById(""+wallLine+"-"+(wallColumn+2)+"~cell");

            if(cellDoubleLeft) cellDoubleLeft.visibility =""+ (parseInt(cellDoubleLeft.visibility)+1*visionSign);
            if(cellDoubleRight) cellDoubleRight.visibility =""+ (parseInt(cellDoubleRight.visibility)+1*visionSign);
        }
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

            if((parseInt(cell.visibility)>0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)<0)){
                cell.style.backgroundColor="lime";
                if(!document.getElementById("fog~"+cell.id.split("~")[0])){
                    let fogImage = document.createElement("img");
                    fogImage.id = "fog~" + cell.id.split("~")[0];
                    fogImage.src = "imageResources/fog.png";
                    fogImage.alt = "brouillard de guerre";
                    fogImage.classList.add("fog");
                    cell.appendChild(fogImage);

                    //hide player if on cell
                    if (currentPlayer === 1 && playerPositions.player2 === cell.id) {
                        player2circle.style.display = 'none';
                    }
                    if (currentPlayer === 2 && playerPositions.player1 === cell.id) {
                        player1circle.style.display = 'none';
                    }
                }
            }
            if((parseInt(cell.visibility)<=0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)>=0)){
                cell.style.backgroundColor="darkseagreen";
                let fogImage =document.getElementById("fog~"+cell.id.split("~")[0]);
                if(fogImage) {
                    cell.removeChild(fogImage)
                }

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