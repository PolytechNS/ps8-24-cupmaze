export {
    calculateVisibility,
    setVisionForPlayer
}
import {findAdjacentSpace} from "./utils.js";

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
    console.log(wallsByOne.length);
    const wallsByTwo = document.querySelectorAll(".laidBy2");
    console.log(wallsByTwo.length);


    cells.forEach(function(cell)
        {
            const cellLine = parseInt(cell.id[0]);

            if(cellLine<4) cell.visibility="-1";
            else if (cellLine===4) cell.visibility="0";
            else cell.visibility="1";

            const cellColumn = parseInt(cell.id[2]);

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
            console.log("cell "+cell.id+" visibility : "+cell.visibility);
        }
    )

    //calculate according to walls

    //Player 1 walls
    wallsByOne.forEach(function(wall)
        {
            if(!wall.id.includes("space")){
                const hORv = wall.id.split("~")[0]
                const wallLine = parseInt(wall.id.split("~")[1].split("-")[0]);
                const wallColumn = parseInt(wall.id.split("~")[1].split("-")[1]);

                //horizontal walls
                if(hORv==="wh"){
                    let cellAbove = document.getElementById(""+wallLine+"-"+wallColumn+"~cell");
                    let cellBelow = document.getElementById(""+(wallLine+1)+"-"+wallColumn+"~cell");

                    console.log(cellAbove.id+" PRE above visibility : "+cellAbove.visibility);
                    if(cellAbove) cellAbove.visibility =""+(parseInt(cellAbove.visibility)-2);
                    console.log(cellAbove.id+" above visibility : "+cellAbove.visibility);
                    if(cellBelow) cellBelow.visibility =""+(parseInt(cellBelow.visibility)-2);
                    console.log(cellBelow.id+" below visibility : "+cellBelow.visibility);

                    let cellDoubleAbove = document.getElementById(""+(wallLine-1)+"-"+wallColumn+"~cell");
                    let cellDoubleBelow = document.getElementById(""+(wallLine+2)+"-"+wallColumn+"~cell");

                    if(wall.classList.contains("firstWall")){
                        let cellLeftAbove = document.getElementById(""+wallLine+"-"+(wallColumn-1)+"~cell");
                        if(cellLeftAbove) cellLeftAbove.visibility=""+ (parseInt(cellLeftAbove.visibility)-1);

                        let cellLeftBelow = document.getElementById(""+(wallLine+1)+"-"+(wallColumn-1)+"~cell");
                        if(cellLeftBelow) cellLeftBelow.visibility=""+ (parseInt(cellLeftBelow.visibility)-1);
                    }
                    else{
                        let cellRightAbove = document.getElementById(""+wallLine+"-"+(wallColumn+1)+"~cell");
                        if(cellRightAbove) cellRightAbove.visibility=""+ (parseInt(cellRightAbove.visibility)-1);

                        let cellRightBelow = document.getElementById(""+(wallLine+1)+"-"+(wallColumn+1)+"~cell");
                        if(cellRightBelow) cellRightBelow.visibility=""+ (parseInt(cellRightBelow.visibility)-1);
                    }

                    if(cellDoubleAbove) cellDoubleAbove.visibility =""+ (parseInt(cellDoubleAbove.visibility)-1);
                    if(cellDoubleBelow) cellDoubleBelow.visibility =""+ (parseInt(cellDoubleBelow.visibility)-1);
                }

                if(hORv==="wv"){
                    let cellLeft = document.getElementById(""+wallLine+"-"+wallColumn+"~cell");
                    let cellRight = document.getElementById(""+wallLine+"-"+(wallColumn+1)+"~cell");

                    console.log(cellLeft.id+" PRE left visibility : "+cellLeft.visibility);
                    if(cellLeft) cellLeft.visibility =""+(parseInt(cellLeft.visibility)-2);
                    console.log(cellLeft.id+" left visibility : "+cellLeft.visibility);
                    if(cellRight) cellRight.visibility =""+(parseInt(cellRight.visibility)-2);
                    console.log(cellRight.id+" right visibility : "+cellRight.visibility);

                    if(wall.classList.contains("firstWall")){
                        let cellAboveLeft = document.getElementById(""+(wallLine-1)+"-"+wallColumn+"~cell");
                        if(cellAboveLeft) cellAboveLeft.visibility=""+ (parseInt(cellAboveLeft.visibility)-1);

                        let cellAboveRight = document.getElementById(""+(wallLine-1)+"-"+(wallColumn+1)+"~cell");
                        if(cellAboveRight) cellAboveRight.visibility=""+ (parseInt(cellAboveRight.visibility)-1);
                    }
                    else{
                        let cellBelowLeft = document.getElementById(""+(wallLine+1)+"-"+wallColumn+"~cell");
                        if(cellBelowLeft) cellBelowLeft.visibility=""+ (parseInt(cellBelowLeft.visibility)-1);

                        let cellBelowRight = document.getElementById(""+(wallLine+1)+"-"+(wallColumn+1)+"~cell");
                        if(cellBelowRight) cellBelowRight.visibility=""+ (parseInt(cellBelowRight.visibility)-1);
                    }

                    let cellDoubleLeft = document.getElementById(""+wallLine+"-"+(wallColumn-1)+"~cell");
                    let cellDoubleRight = document.getElementById(""+wallLine+"-"+(wallColumn+2)+"~cell");

                    if(cellDoubleLeft) cellDoubleLeft.visibility =""+ (parseInt(cellDoubleLeft.visibility)-1);
                    if(cellDoubleRight) cellDoubleRight.visibility =""+ (parseInt(cellDoubleRight.visibility)-1);
                }

            }
        }
    )

    wallsByTwo.forEach(function(wall)
        {
            const hORv = wall.id.split("~")[0]
            const wallLine = parseInt(wall.id.match(/\d+/g)[0]);
            const wallColumn = parseInt(wall.id.match(/\d+/g)[1]);


            if(!wall.id.includes("space")) {
                //contact with horizontal wall
                if (hORv === "wh") {
                    let cellAbove = document.getElementById(wallLine + "-" + wallColumn + "~cell");
                    let cellBelow = document.getElementById((wallLine + 1) + "-" + wallColumn + "~cell");

                    if (cellAbove) cellAbove.visibility = "" + (parseInt(cellAbove.visibility) + 2);
                    console.log(cellAbove.id + " above visibility : " + cellAbove.visibility);
                    if (cellBelow) cellBelow.visibility = "" + (parseInt(cellBelow.visibility) + 2);
                    console.log(cellBelow.id + " below visibility : " + cellBelow.visibility);

                    if(wall.classList.contains("firstWall")){
                        let cellLeftAbove = document.getElementById(""+wallLine+"-"+(wallColumn-1)+"~cell");
                        if(cellLeftAbove) cellLeftAbove.visibility=""+ (parseInt(cellLeftAbove.visibility)+1);

                        let cellLeftBelow = document.getElementById(""+(wallLine+1)+"-"+(wallColumn-1)+"~cell");
                        if(cellLeftBelow) cellLeftBelow.visibility=""+ (parseInt(cellLeftBelow.visibility)+1);
                    }
                    else{
                        let cellRightAbove = document.getElementById(""+wallLine+"-"+(wallColumn+1)+"~cell");
                        if(cellRightAbove) cellRightAbove.visibility=""+ (parseInt(cellRightAbove.visibility)+1);

                        let cellRightBelow = document.getElementById(""+(wallLine+1)+"-"+(wallColumn+1)+"~cell");
                        if(cellRightBelow) cellRightBelow.visibility=""+ (parseInt(cellRightBelow.visibility)+1);
                    }

                    let cellDoubleAbove = document.getElementById((wallLine - 1) + "-" + wallColumn + "~cell");
                    let cellDoubleBelow = document.getElementById((wallLine + 2) + "-" + wallColumn + "~cell");

                    if (cellDoubleAbove) cellDoubleAbove.visibility = "" + (parseInt(cellDoubleAbove.visibility) + 1);
                    if (cellDoubleBelow) cellDoubleBelow.visibility = "" + (parseInt(cellDoubleBelow.visibility) + 1);
                }

                //contact with vertical wall
                if(hORv==="wv"){
                    let cellLeft = document.getElementById(""+wallLine+"-"+wallColumn+"~cell");
                    let cellRight = document.getElementById(""+wallLine+"-"+(wallColumn+1)+"~cell");

                    console.log(cellLeft.id+" PRE left visibility : "+cellLeft.visibility);
                    if(cellLeft) cellLeft.visibility =""+(parseInt(cellLeft.visibility)+2);
                    console.log(cellLeft.id+" left visibility : "+cellLeft.visibility);
                    if(cellRight) cellRight.visibility =""+(parseInt(cellRight.visibility)+2);
                    console.log(cellRight.id+" right visibility : "+cellRight.visibility);

                    if(wall.classList.contains("firstWall")){
                        let cellAboveLeft = document.getElementById(""+(wallLine-1)+"-"+wallColumn+"~cell");
                        if(cellAboveLeft) cellAboveLeft.visibility=""+ (parseInt(cellAboveLeft.visibility)+1);

                        let cellAboveRight = document.getElementById(""+(wallLine-1)+"-"+(wallColumn+1)+"~cell");
                        if(cellAboveRight) cellAboveRight.visibility=""+ (parseInt(cellAboveRight.visibility)+1);
                    }
                    else{
                        let cellBelowLeft = document.getElementById(""+(wallLine+1)+"-"+wallColumn+"~cell");
                        if(cellBelowLeft) cellBelowLeft.visibility=""+ (parseInt(cellBelowLeft.visibility)+1);

                        let cellBelowRight = document.getElementById(""+(wallLine+1)+"-"+(wallColumn+1)+"~cell");
                        if(cellBelowRight) cellBelowRight.visibility=""+ (parseInt(cellBelowRight.visibility)+1);
                    }

                    let cellDoubleLeft = document.getElementById(""+wallLine+"-"+(wallColumn-1)+"~cell");
                    let cellDoubleRight = document.getElementById(""+wallLine+"-"+(wallColumn+2)+"~cell");

                    if(cellDoubleLeft) cellDoubleLeft.visibility =""+ (parseInt(cellDoubleLeft.visibility)+1);
                    if(cellDoubleRight) cellDoubleRight.visibility =""+ (parseInt(cellDoubleRight.visibility)+1);
                }
            }
        }
    )

}

function setVisionForPlayer(currentPlayer,playerPositions){
    calculateVisibility(playerPositions);
    const cells = document.querySelectorAll(".cell");
    console.log(" ########### ROUND BREAK ###########")
    cells.forEach(function(cell)
        {
            console.log("cell "+cell.id+" visibility : "+cell.visibility);

            let horizontalWallOfCell = document.getElementById("wh~"+cell.id.split("~")[0]);
            let verticalWallOfCell = document.getElementById("wv~"+cell.id.split("~")[0]);
            let player1circle = document.getElementById("player" + 1 + "-circle");
            let player2circle = document.getElementById("player" + 2 + "-circle");

            if((parseInt(cell.visibility)>0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)<0)){
                cell.style.backgroundColor="lime";
                let fogImage =document.createElement("img");
                fogImage.id="fog~"+cell.id.split("~")[0];
                fogImage.src = "imageResources/fog.png";
                fogImage.alt = "brouillard de guerre";
                fogImage.classList.add("fog");
                cell.appendChild(fogImage);
                /*
                //hide walls
                if(horizontalWallOfCell && horizontalWallOfCell.classList.contains("wall-laid")){
                    horizontalWallOfCell.style.backgroundColor="white";
                    if(horizontalWallOfCell.classList.contains("firstWall")){
                        findAdjacentSpace(horizontalWallOfCell.id.split("~")[1].split("-")).style.backgroundColor="white"
                    }
                }
                if(verticalWallOfCell && verticalWallOfCell.classList.contains("wall-laid")) {
                    verticalWallOfCell.style.backgroundColor = "white";
                    if(verticalWallOfCell.classList.contains("firstWall")){
                        findAdjacentSpace(verticalWallOfCell.id.split("~")[1].split("-")).style.backgroundColor="white"
                    }
                }
                 */
                //hide player if on cell
                if(currentPlayer === 1 && playerPositions.player2 === cell.id) {
                    player2circle.style.display='none';
                }
                if(currentPlayer === 2 && playerPositions.player1 === cell.id) {
                    player1circle.style.display='none';
                }
            }
            if((parseInt(cell.visibility)<=0 && currentPlayer === 1) || (currentPlayer === 2 && parseInt(cell.visibility)>=0)){
                cell.style.backgroundColor="darkseagreen";
                let fogImage =document.getElementById("fog~"+cell.id.split("~")[0]);
                if(fogImage) cell.removeChild(fogImage);
                /*
                //show walls
                if(horizontalWallOfCell && horizontalWallOfCell.classList.contains("wall-laid")) {
                    horizontalWallOfCell.style.backgroundColor="black";
                    if(horizontalWallOfCell.classList.contains("firstWall")){
                        findAdjacentSpace(horizontalWallOfCell.id.split("~")[1].split("-")).style.backgroundColor="black"
                    }
                }
                if(verticalWallOfCell && verticalWallOfCell.classList.contains("wall-laid")){
                    verticalWallOfCell.style.backgroundColor="black";
                    if(verticalWallOfCell.classList.contains("firstWall")){
                        findAdjacentSpace(verticalWallOfCell.id.split("~")[1].split("-")).style.backgroundColor="black"
                    }
                }
                 */

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