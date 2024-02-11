const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");
const { Game } = require("../logic/Game.js");
const { Case } = require("../logic/Case.js");
const { findWall, findAdjacentWall, findAdjacentSpace,  removeHighlight } = require("../logic/utils");
const { isWallPlacementValid } = require("../logic/wallLayingUtils.js");
const { Wall } = require("../logic/Wall");
const {beginningPositionIsValid} = require("../logic/movePlayerReferee");

/**
 * Cette fonction va servir pour pouvoir créer le socket qui correspond à quand on va vouloir initialiser une partie entre le bot et un joueur en local
 * Cette fonction est appelée dans le fichier "index.js" pour l'initialiser en attendant une connexion d'un client
 * @param server
 */
function createSocket(server) {
    const io = new Server(server);

    const gameNamespace = io.of("/api/game");
    gameNamespace.on("connection", (socket) => {
        console.log("a user connected");
        const game = new Game();

        socket.on("newMove", (msg) => {
            console.log("On demande à l'IA de jouer maintenant");
            let newPosition = AIEasy.computeMove(msg);
            gameNamespace.emit("updatedBoard", newPosition);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });

        socket.on("isGameOver", () => {
            console.log("On demande à l'IA si la partie est terminée");
            let answer = game.isGameOver();
            gameNamespace.emit("gameOver", answer[0], answer[1]);
        });

        socket.on("newMoveHumanIsPossible", async (positionY, positionX) => {
            let possibleMoves = await game.getPossibleMoves(game.getPlayerCurrentPosition(1));
            console.log("possibleMoves", possibleMoves);
            let caseWanted = await game.getCase(positionY, positionX);
            console.log("caseWanted", caseWanted);
            let isPossible = possibleMoves.includes(caseWanted);
            if (isPossible) {
                let saveOldPosition = game.getPlayerCurrentPosition(1);
                let htmlOldPosition=saveOldPosition[0]+"-"+saveOldPosition[1]+"~cell";
                let htmlNewPosition=caseWanted.getPos_x()+"-"+caseWanted.getPos_y()+"~cell";
                game.movePlayer(1, caseWanted, game.getPlayerCurrentPosition(1));
                if (saveOldPosition !== null) gameNamespace.emit("isNewMoveHumanIsPossible", isPossible, htmlOldPosition, htmlNewPosition);
                else gameNamespace.emit("isNewMoveHumanIsPossible", isPossible, htmlOldPosition, htmlNewPosition);
            }
        });

        socket.on("undoMovePosition", () => {
            let oldPositionHTML=game.playerPosition["player1"][0]+"-"+game.playerPosition["player1"][1]+"~cell";
            let newPositionHtml="";
            if(game.lastPlayerPosition["player1"]!==null){
                newPositionHtml=game.lastPlayerPosition["player1"][0]+"-"+game.lastPlayerPosition["player1"][1]+"~cell";
            }
            game.playerPosition["player1"] = game.getPlayerLastPosition(1);
            game.actionsToDo=1;
            gameNamespace.emit("undoMove", oldPositionHTML, newPositionHtml, 1, game.numberTour);
        });

        socket.on("choosePositionToBegin", (cellId) => {
            console.log("choosePositionToBegin", cellId);
            const x = parseInt(cellId.split("-")[0]);
            const y = parseInt(cellId.split("-")[1]);
            const action = game.actionsToDo;
            const currentPlayer = game.currentPlayer;
            console.log("currentPlayer", currentPlayer);
            console.log("action", x);
            var res = beginningPositionIsValid(game.currentPlayer, x);
            console.log("res", res);
            gameNamespace.emit("beginningPositionIsValid", res);

            if (action === 0) {
                gameNamespace.emit("checkAction", true);
            }

            game.playerPosition.player1 = [x, y];
            gameNamespace.emit("currentPlayer", currentPlayer, game.playerPosition.player1);
            game.actionsToDo--;
            game.lastActionType = "position"
        });

        socket.on("validateRound", (msg) => {
            const playerPosition = game.playerPosition;

            let possibleMoves = game.getPossibleMoves(playerPosition.player2);
            const numberTour = game.numberTour;
            let currentplayer = game.currentPlayer;
            const nbWallsPlayer1 = game.nbWallsPlayer1;
            const nbWallsPlayer2 = game.nbWallsPlayer2;

            gameNamespace.emit("numberTour", numberTour, possibleMoves);
            let newAIPosition = AIEasy.computeMove(possibleMoves, playerPosition.player2);
            if (newAIPosition instanceof Case) {
                newAIPosition = [newAIPosition.getPos_x(), newAIPosition.getPos_y()]
            }
            game.currentPlayer = 2
            game.actionsToDo = 1;
            const cellId = newAIPosition[0] + "-" + newAIPosition[1] + "~cell";
            if(game.actionsToDo === 1){
                gameNamespace.emit("positionAI", cellId, game.currentPlayer, playerPosition);
                game.playerPosition.player2 = newAIPosition;
                game.actionsToDo=0;
            }

            // on verifie si la partie est finie
            const winner = game.isGameOver(game.playerPosition);
            if (winner !== 0) {
                gameNamespace.emit("gameOver", winner);
                return;
            }

            game.currentPlayer = 1;
            game.numberTour++;
            game.actionsToDo = 1;

            console.log("#####CHANGEMENT DE TOUR#####");
            gameNamespace.emit("numberTourAfter", numberTour);

            //game.lastPlayerPosition = game.playerPosition;

            if (numberTour > 1) {
                console.log("playerPosition", playerPosition);
                possibleMoves = game.getPossibleMoves(playerPosition.player1);
            }
            console.log("updateRound");
            gameNamespace.emit("updateRound",
                possibleMoves, numberTour,
                playerPosition, currentplayer,
                nbWallsPlayer1, nbWallsPlayer2);
        });

        socket.on("wallListener", (firstWallToColor, wallType, wallPosition) => {
            console.log("wallListener", firstWallToColor, wallType, wallPosition);
            const x = parseInt(wallPosition[0]);
            const y = parseInt(wallPosition[1]);
            let wallInclinaison;
            console.log("wallType", wallType);
            if (firstWallToColor === null) {
                console.log("vide");
                return;
            }
            if (wallType === "wv") { wallInclinaison = "vertical"; }
            else { wallInclinaison = "horizontal"; }
            const wall = findWall(x,y, wallInclinaison, game.elements);
            console.log("wall", wall);
            let adjacentWall = findAdjacentWall(wall, game.elements);
            console.log("wall", adjacentWall);
            let adjacentSpace = findAdjacentSpace(wall, game.elements);
            console.log("space", adjacentSpace);

            if (isWallPlacementValid(wallType, wallPosition, game.elements) === false) {
                removeHighlight(firstWallToColor, adjacentWall, adjacentSpace);
                gameNamespace.emit("highlightElements", null, null);
                return;
            }

            //highlightElements(firstWallToColor, adjacentWall, space);

            adjacentSpaceId = adjacentSpace.pos_x + "-" + adjacentSpace.pos_y + "-space";
            adjacentWallId = wallType + "~" + adjacentWall.pos_x + "-" + adjacentWall.pos_y;
            gameNamespace.emit("highlightElements", adjacentWall, adjacentSpace, adjacentWallId, adjacentSpaceId);
        });
    });
}

module.exports = {
    createSocket
};
