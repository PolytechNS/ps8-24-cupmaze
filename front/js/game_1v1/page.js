 import {removePlayerCircle, addPlayerCircle} from "../game_1vbot/movePlayerUtils.js";
import {updateNumberWallsDisplay} from "../game_local_1v1/wallLayingUtils.js"
import {setVisionForPlayer} from "../game_1vbot/fog_of_war.js";
import {decodeJWTPayload, getCookie} from "../tokenUtils.js";

let socket;
let lastActionType = "";
let board;
let possibleMoves= [];
document.addEventListener("DOMContentLoaded", main,false);

let gameInformation;
let player1_name;
let player2_name;
let firstPlayer;
function searchToObject() {
    gameInformation = {
        'roomName': localStorage.getItem('room'),
        'opponentName': localStorage.getItem('opponentName'),
        'opponentId': localStorage.getItem('opponentId'),
        'player1_elo': localStorage.getItem('player1_elo'),
        'player2_elo': localStorage.getItem('player2_elo'),
    }
}

function main() {
    let reactionButton = document.getElementById("sendReaction");
    reactionButton.addEventListener("click", () => {
        let reaction = document.getElementById("popup-reaction");
        reaction.style.display = "block";
    });


    let closeReaction = document.getElementById("closePopup");
    closeReaction.addEventListener("click", () => {
        let reaction = document.getElementById("popup-reaction");
        reaction.style.display = "none";
    });


    for(let i = 1; i < 5; i++) {
        let nameEmoji = "reaction" + i;
        console.log(nameEmoji);
        let reactionEmoji = document.getElementById(nameEmoji);
        reactionEmoji.addEventListener("click", () => {
            let reaction = document.getElementById("popup-reaction");
            reaction.style.display = "none";

            const roomId = gameInformation.roomName;
            reaction = reactionEmoji.textContent;
            const usernameSender = decodeJWTPayload(getCookie("jwt")).username;
            socket.emit("reaction", { roomId, reaction, usernameSender } );
        });
    }



    socket = io("/api/waitingRoom");
    searchToObject();

    firstPlayer = gameInformation.roomName === decodeJWTPayload(getCookie("jwt")).id;
    let leaveGameButtonStyle = document.getElementById("button-leave-game").style;
    if(firstPlayer) {
        leaveGameButtonStyle.left = "0%";
        leaveGameButtonStyle.removeProperty("float");
        leaveGameButtonStyle.background = "rgba(200, 94, 94, 0.7)";
    }
    else {
        leaveGameButtonStyle.background = "rgba(94,174,200, 0.7)";
        leaveGameButtonStyle.removeProperty("left");
        leaveGameButtonStyle.float = "right";
    }


    socket.on("reaction", (reaction, usernameSender) => {
        if(usernameSender !== decodeJWTPayload(getCookie("jwt")).username) {
            let popupNotif = document.getElementById("popup-notif");
            popupNotif.style.display = "block";
            let content = document.getElementById("popup-notif-content");
            content.textContent = usernameSender + " a envoyé une réaction !";
            let reactionSend = document.getElementById("popup-reaction-send");
            reactionSend.style.fontSize= "20px";
            reactionSend.textContent = reaction;
        } else {
            let popupNotif = document.getElementById("popup-notif");
            popupNotif.style.display = "block";
            let content = document.getElementById("popup-notif-content");
            content.textContent = "Vous avez envoyé une réaction !";
            let reactionSend = document.getElementById("popup-reaction-send");
            reactionSend.style.fontSize= "20px";
            reactionSend.textContent = reaction;
        }
    });

    let closeNotif = document.getElementById("closePopup-notif");
    closeNotif.addEventListener("click", () => {
        let popupNotif = document.getElementById("popup-notif");
        popupNotif.style.display = "none";
    });


    socket.emit("setupGame", getCookie("jwt"));
    socket.emit("joinRoom", gameInformation.roomName);

    socket.on("game", (gameState) => {
        // on affiche pas la popup
        document.getElementById("popup").style.display = 'none';

        board = document.getElementById("grid");
        document.getElementById("popup-button").addEventListener("click",startNewRound);
        document.getElementById("button-validate-action").addEventListener("click",validateRound);
        document.getElementById("button-undo-action").addEventListener("click",undoAction);
        initializeTable();
        console.log(gameInformation)
        if (firstPlayer) {
            player1_name = decodeJWTPayload(getCookie("jwt")).username;
            player2_name = gameInformation.opponentName;
            //console.log(gameInformation)
            const elo_player1 = gameInformation.player1_elo;
            setVisionForPlayer(1, {player1: null, player2: null})
            setUpNewRound(1,10,10,1)
        } else {
            player2_name = decodeJWTPayload(getCookie("jwt")).username;
            player1_name = gameInformation.opponentName;
            //console.log(gameInformation)
            const elo_player2 = gameInformation.player2_elo;
            setVisionForPlayer(2, {player1: null, player2: null})
            setUpNewRound(1,10,10,1)
        }
        //setUpNewRound(player1_name,10,10,1);
        socket.on("actionResult", (action) => updateUI(action));
        socket.off("game");
    });

    let leaveGameButton = document.getElementById("button-leave-game");
    leaveGameButton.addEventListener("click", () => {
        socket.emit("leaveRoom", {
            'roomId': gameInformation.roomName,
            'tokens': getCookie("jwt")
        });
    });
}

function initializeTable() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cellId = (j+1) + "-" + (9-i);
            const cell = document.createElement("div");
            cell.id = cellId+"~cell";
            cell.classList.add("cell");
            cell.addEventListener("click", choosePositionToBegin);
            board.appendChild(cell);
            if(j !== 8) {
                const wall = document.createElement("div");
                wall.id = "wv~"+(j+1)+"-"+(9-i);
                wall.classList.add("wall-vertical")
                board.appendChild(wall);
            }
        }
        if(i === 8) break;
        for (let j = 0; j < 9; j++) {
            const wall = document.createElement("div");
            wall.id = "wh~"+(j+1)+"-"+(9-i);
            wall.classList.add("wall-horizontal");
            const spaceId = (j+1)+"-"+(9-i);
            const space = document.createElement("div");
            space.id = spaceId+"-space";
            space.classList.add("space");
            board.appendChild(wall);
            if(j !== 8) {
                board.appendChild(space);
            }
        }
    }
}

function validateRound() {
    socket.emit("validateRound", ({
        'roomId': gameInformation.roomName,
        'tokens': getCookie("jwt"),
    }));
}

/** #############################################  WALL LAYING METHODS  ############################################# **/

function extractWallInfo(wallId) {
    const wallType = wallId.split("~")[0];
    const wallPosition = wallId.split("~")[1];
    return { wallType, wallPosition };
}

function findAdjacentWall(wallType, wallPosition) {
    const colonne = parseInt(wallPosition.split("-")[0]);
    const ligne = parseInt(wallPosition.split("-")[1]);

    if (wallType === "wv" && colonne < 9) {
        return  document.getElementById(`wv~${colonne}-${ligne-1}`);
    } else if (wallType === "wh" && ligne < 9) {
        return document.getElementById(`wh~${colonne+1}-${ligne}`);
    } else {
        if (wallType === "wv") {
            return document.getElementById(`wv~${colonne}-${ligne}`);
        }
        return document.getElementById(`wh~${colonne+1}-${ligne}`);
    }
}

function findAdjacentSpace(wallPosition) {
    const colonne = parseInt(wallPosition.split("-")[0]);
    const ligne = parseInt(wallPosition.split("-")[1]);

    var space = `${colonne}-${ligne}-space`;
    if (colonne < 9  && ligne <= 9) {
        return document.getElementById(space);
    } else {
        if (ligne === 9) {
            return document.getElementById(`${colonne}-${ligne-1}-space`);
        } else {
            return document.getElementById(`${colonne-1}-${ligne}-space`);
        }
    }
}

function isWallPlacementValid(firstWall, secondWall, space) {
    const isLaid = firstWall.classList.contains("wall-laid") || secondWall.classList.contains("wall-laid") || space.classList.contains("wall-laid");
    return !isLaid;
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

function wallListener(event) {

    const firstWallToColor = event.target;

    // on parse les ID pour avoir les coordonnées des murs
    const wallId = firstWallToColor.id;
    const { wallType, wallPosition } = extractWallInfo(wallId);
    if (wallPosition[0] === "9" || wallPosition[2] === "1") {
        return;
    }
    firstWallToColor.classList.add("wall-hovered");

    // la on va chercher les mur a colorier et l'espace entre les murs a colorier
    const secondWallToColor = findAdjacentWall(wallType, wallPosition);
    const spaceToColor = findAdjacentSpace(wallPosition);

    socket.emit("wallListen" ,{
        'roomId': gameInformation.roomName,
        'tokens': getCookie("jwt"),
        'firstWall': firstWallToColor.id.split("~")[1],
        'secondWall': secondWallToColor.id.split("~")[1],
        'wallType': wallType === "wv" ? "vertical" : "horizontal"
        });
    let block;
    socket.on("res", (msg) => {
        block = msg;
        if (block === true) {
            removeHighlight(firstWallToColor, secondWallToColor, spaceToColor);
            return;
        }
        socket.off("res");
    });

    if (isWallPlacementValid(firstWallToColor, secondWallToColor, spaceToColor) === false) {
        removeHighlight(firstWallToColor, secondWallToColor, spaceToColor)
        return;
    }

    // on rajoute les classes pour colorier
    highlightElements(firstWallToColor, secondWallToColor, spaceToColor);

    firstWallToColor.addEventListener("mouseleave", () => {
        removeHighlight(firstWallToColor, secondWallToColor, spaceToColor);
    });
}

function wallLaid(event) {
    const firstWallToColor = event.target;
    const wallId = firstWallToColor.id;
    const { wallType, wallPosition } = extractWallInfo(wallId);
    const adjacentWall = findAdjacentWall(wallType, wallPosition);
    const adjacentSpace = findAdjacentSpace(wallPosition);

    if(isWallPlacementValid(firstWallToColor, adjacentWall, adjacentSpace) === false) {
        return;
    }
    socket.emit("layWall", {
        'roomId': gameInformation.roomName,
        'tokens': getCookie("jwt"),
        'firstWallToColor': firstWallToColor.id,
        'wallType': wallType,
        'wallPosition': wallPosition,
        'wallId': wallId,
        'adjacentWall': adjacentWall.id,
        'adjacentSpace': adjacentSpace.id
    });
}

/** #############################################  MOVE PLAYER METHODS  ############################################# **/


function choosePositionToBegin(event) {
    socket.emit("choosePositionToBegin", {
        'roomId': gameInformation.roomName,
        'cellId': event.target.id,
        'tokens': getCookie("jwt")
    });
}

function movePlayer(event) {
    const target = event.target;
    let cellId=target.id;
    socket.emit("movePlayer", {
        'roomId': gameInformation.roomName,
        'cellId': cellId,
        'tokens': getCookie("jwt")
    })
}


/** #############################################  UNDO METHODS  ############################################# **/

function undoAction(){
    //On re-cache les boutons
    document.getElementById("button-validate-action").style.display = "none";
    document.getElementById("button-undo-action").style.display = "none";
    //On re-donne la possiblité de sauvegarder
    //document.getElementById("button-save-game").style.display = "flex";

    //On vérifie si la dernière action est un mouvement de pion
    if(lastActionType === "position"){
        socket.emit("undoMovePosition", {
            'roomId': gameInformation.roomName,
            'tokens': getCookie("jwt")
        });
    }else{ //Si la dernière action la placement d'un mur
        socket.emit("undoWall", {
            'roomId': gameInformation.roomName,
            'tokens': getCookie("jwt")
        });
    }
}

/**UTILS **/

function updateUI(action) {
    switch (action.actionType) {
            case "positionBegin":
                positionBegin(action);
                break;
            case "validateRound":
                validate(action);
                break;
            case "movePlayer":
                move(action);
                break;
            case "layWall":
                wall(action);
                break;
            case "undoMovePosition":
                undoMovePosition(action);
                break;
            case "undoWall":
                undoWall(action);
                break;
            case "button":
                showButtonVisible()
                break
            case "leaveRoom":
                leaveGame(action);
                break;
    }
}

function positionBegin(action) {
    if (action.valid) {
        document.getElementById(action.cellId).classList.add("occupied");
        //addPlayerCircle(document.getElementById(action.cellId), action.current);
        if(firstPlayer){
            if(action.current===1) addPlayerCircle(document.getElementById(action.cellId), 1);
        }else {
            if(action.current===2) addPlayerCircle(document.getElementById(action.cellId), 2);
        }

        lastActionType = "position";
        if (action.playerPositions === null) {
            //showButtonVisible();
            return;
        }
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.removeEventListener("click", choosePositionToBegin);
            cell.addEventListener("click", movePlayer);
        });
        const walls = document.querySelectorAll(".wall-vertical,.wall-horizontal");
        walls.forEach(wall => {
            wall.addEventListener("mouseenter", wallListener);
            wall.addEventListener("click", wallLaid);
        });
    } else {
        alert(action.message);
        return;
    }
    //showButtonVisible();
}

function validate(action) {
    if (action.valid) {
        if(firstPlayer){
            setVisionForPlayer(1, action.playerPosition);
            if(action.playerPosition.player2!==null) {
                let opp_circle = document.getElementById(action.playerPosition.player2[0] + "-" + action.playerPosition.player2[1] + "~cell");
                if (parseInt(opp_circle.visibility) > 0) {
                    console.log("hide player 2");
                    removePlayerCircle(action.playerPosition.player2[0] + "-" + action.playerPosition.player2[1] + "~cell", 2);
                } else if (document.getElementsByClassName("player2-circle").length === 0){
                    console.log("show player 2")
                    addPlayerCircle(opp_circle, 2);
                }
            }
        }else {
            setVisionForPlayer(2, action.playerPosition);
            if (action.playerPosition.player1 !== null) {
                let opp_circle = document.getElementById(action.playerPosition.player1[0] + "-" + action.playerPosition.player1[1] + "~cell");
                if (parseInt(opp_circle.visibility) < 0) {
                    console.log("hide player 1")
                    removePlayerCircle(action.playerPosition.player1[0] + "-" + action.playerPosition.player1[1] + "~cell", 1);
                } else if( document.getElementsByClassName("player1-circle").length === 0){
                    console.log("show player 1")
                    addPlayerCircle(opp_circle, 1);
                }
            }
        }

        setUpNewRound(action.currentPlayer, action.nbWallsPlayer1, action.nbWallsPlayer2, action.numberTour);
    } else {
        switch (action.case) {
            case "notPlayed":
                alert(action.message);
                break;
            case "notYourTurn":
                alert(action.message);
                break;
            case "draw":
                document.getElementById("popup-ready-message").innerHTML = "Nombre de tours max atteints, égalité";
                document.getElementById("popup").style.display = 'flex';
                document.getElementById("popup-button").style.display = "none";
                break;
            case "victory":
                onVictory(action);
                break;
        }
    }
}

function showButtonVisible(){
    document.getElementById("button-validate-action").style.display = "flex";
    document.getElementById("button-undo-action").style.display = "flex";
    //document.getElementById("button-save-game").style.display = "none";
}

function move(action) {
    if (action.valid) {
        if (action.oldPosition !== null) removePlayerCircle(action.oldPosition, action.currentPlayer);
        if(firstPlayer){
            if(action.currentPlayer===1) addPlayerCircle(document.getElementById(action.cellId), 1);
            if(action.currentPlayer===2 && document.getElementById(action.cellId).visibility<=0) addPlayerCircle(document.getElementById(action.cellId), 2);
        }else {
            if(action.currentPlayer===2) addPlayerCircle(document.getElementById(action.cellId), 2);
            if(action.currentPlayer===1 && document.getElementById(action.cellId).visibility>=0) addPlayerCircle(document.getElementById(action.cellId), 1);
        }
        lastActionType = "position";
        //showButtonVisible();
    } else {
        alert(action.message);
    }
    //showButtonVisible();
}

function wall(action) {
    if (action.valid) {
        const adjacentWall = document.getElementById(action.adjacentWall);
        const adjacentSpace = document.getElementById(action.adjacentSpace);
        const firstWallToColor = document.getElementById(action.firstWallToColor);
        adjacentWall.classList.add("wall-laid", "laidBy" + action.currentPlayer);
        adjacentWall.removeEventListener("mouseenter", wallListener);
        adjacentWall.removeEventListener("click", wallLaid);
        adjacentSpace.classList.add("wall-laid", "laidBy" + action.currentPlayer);
        firstWallToColor.classList.add("wall-laid", "laidBy" + action.currentPlayer);
        firstWallToColor.removeEventListener("mouseenter", wallListener);
        firstWallToColor.removeEventListener("click", wallLaid);
        //showButtonVisible();
        updateNumberWallsDisplay(action.currentPlayer, action.nbWallsPlayer1, action.nbWallsPlayer2);
        lastActionType="wall";
    } else {
        //alert(action.message);
    }
}

function undoMovePosition(action) {
    if (action.valid){
        switch (action.case) {
            case "LastMoveCancelled":
                removePlayerCircle(action.oldPositionHtml, action.currentPlayer);
                if(action.newPositionHtml !== ""){
                    let cell = document.getElementById(action.newPositionHtml);
                    addPlayerCircle(cell, action.currentPlayer);
                }
                break;
            case "noLastMove":
                removePlayerCircle(action.cellToReset, action.currentPlayer);
                const cells = document.querySelectorAll(".cell");
                cells.forEach(cell => {
                    cell.removeEventListener("click", movePlayer);
                    cell.addEventListener("click", choosePositionToBegin);
                });
                const walls = document.querySelectorAll(".wall-vertical,.wall-horizontal");
                walls.forEach(wall => {
                    wall.removeEventListener("mouseenter", wallListener);
                    wall.removeEventListener("click", wallLaid);
                });
                break;
        }
    } else {
        alert(action.message);
    }
}

function undoWall(action) {
    if (action.valid){
        document.getElementById(action.tabIDHTML[0]).classList.remove("wall-laid","laidBy"+action.currentPlayer);
        document.getElementById(action.tabIDHTML[0]).addEventListener("mouseenter",wallListener);
        document.getElementById(action.tabIDHTML[0]).addEventListener("click",wallLaid);
        document.getElementById(action.tabIDHTML[1]).classList.remove("wall-laid","laidBy"+action.currentPlayer);
        document.getElementById(action.tabIDHTML[1]).addEventListener("mouseenter",wallListener);
        document.getElementById(action.tabIDHTML[1]).addEventListener("click",wallLaid);
        document.getElementById(action.tabIDHTML[2]).classList.remove("wall-laid","laidBy"+action.currentPlayer);
        updateNumberWallsDisplay(action.currentPlayer, action.nbWallsPlayer1, action.nbWallsPlayer2);
        lastActionType = "";
    } else {
        alert(action.message);
    }
}

 function onVictory(action) {

     let winnerText, winnerElo;

     if (gameInformation.roomName === decodeJWTPayload(getCookie("jwt")).id) {
         if (action.winner === 1) {
             winnerText = player1_name;
             winnerElo = gameInformation.player1_elo;
         } else {
             winnerText = player2_name;
             winnerElo = gameInformation.player2_elo;
         }
     } else {
         if (action.winner === 1) {
             winnerText = player1_name;
             winnerElo = gameInformation.player1_elo;
         } else {
             winnerText = player2_name;
             winnerElo = gameInformation.player2_elo;
         }
     }

     const popup = document.getElementById("popup");
     popup.style.display = 'flex';
     document.getElementById("popup-ready-message").innerHTML = "Victoire de " + winnerText + " !! Félicitations ! ";
     document.getElementById("popup-button").style.display = "none";
     setTimeout(() => {
         window.location.href = `/mainMenu.html`;
     }, 3000);
 }

 function startNewRound(){
     document.getElementById("grid").style.display = 'grid';
     document.getElementById("display-player-1").style.display = "flex";
     document.getElementById("display-player-2").style.display = "flex";
     document.getElementById("display-player-1-walls").style.display = "flex";
     document.getElementById("display-player-2-walls").style.display = "flex";
     document.getElementById("display-player-1-number-actions").style.display = "flex";
     document.getElementById("display-player-2-number-actions").style.display = "flex";
     document.getElementById("display-number-tour").style.display = "flex";
     document.getElementById("display-player-turn").style.display = "flex";
     document.getElementById("player1Image").style.display = "flex";
     document.getElementById("player2Image").style.display = "flex";
 }


 /**
  * Fonction permettant de pouvoir afficher la pop-up pour l'écran anti-triche
  * On va donc cacher la grille derrière pour éviter la triche
  */
 function setUpNewRound(currentPlayer,nbWallsPlayer1,nbWallsPlayer2,numberTour){
     document.getElementById("button-validate-action").style.display = "none";
     document.getElementById("button-undo-action").style.display = "none";
     document.getElementById("grid").style.display = 'none';
     document.getElementById("display-player-1").style.display = "none";
     document.getElementById("display-player-1").innerHTML = player1_name;
     document.getElementById("display-player-1-walls").style.display = "none";
     document.getElementById("display-player-1-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer1;
     document.getElementById("display-player-2").style.display = "none";
     document.getElementById("display-player-2").innerHTML = player2_name;
     document.getElementById("display-player-2-walls").style.display = "none";
     document.getElementById("display-player-2-walls").innerHTML = "Nombre de murs restants : "+nbWallsPlayer2;
     let elo1;
     if (firstPlayer) {
         elo1 = gameInformation.player1_elo;
     } else {
         elo1 = gameInformation.player2_elo;
     }
     document.getElementById("display-player-1-number-actions").innerHTML = "ELO : " + elo1;
     document.getElementById("display-player-1-number-actions").style.display = "none";
     let elo2;
        if (firstPlayer) {
            elo2 = gameInformation.player2_elo;
        } else {
            elo2 = gameInformation.player1_elo;
        }
     document.getElementById("display-player-2-number-actions").innerHTML = "ELO : " + elo2;
     document.getElementById("display-player-2-number-actions").style.display = "none";
     document.getElementById("display-number-tour").innerHTML = "Tour numéro : "+numberTour;
     let currentName;
     if (currentPlayer === 1) {
         currentName = player1_name;
     } else {
         currentName = player2_name;
     }
     document.getElementById("display-player-turn").innerHTML = "C'est au tour de : "+ currentName;
     document.getElementById("display-number-tour").style.display = "none";
     document.getElementById("player1Image").style.display = "none";
     document.getElementById("player2Image").style.display = "none";
     startNewRound()
 }

 function leaveGame(action){
        if (action.valid) {
            let popup = document.getElementById("popup");
            popup.style.display = 'flex';
            let winnerText;
            let leaverText;
            if (gameInformation.roomName === decodeJWTPayload(getCookie("jwt")).id) {
                if (action.winner === 1) {
                    winnerText = player1_name;
                    leaverText = player2_name;
                } else {
                    winnerText = player2_name;
                    leaverText = player1_name;
                }
            } else {
                if (action.winner === 1) {
                    winnerText = player1_name;
                    leaverText = player2_name;
                } else {
                    winnerText = player2_name;
                    leaverText = player1_name;
                }
            }
            document.getElementById("popup-ready-message").innerHTML = "Le joueur " + leaverText + " a quitté la partie.<br> Victoire de " + winnerText + " !! Félicitations ! ";
            document.getElementById("popup-button").style.display = "none";
            setTimeout(() => {
                window.location.href = `/mainMenu.html`;
            }, 3000);
        }
 }