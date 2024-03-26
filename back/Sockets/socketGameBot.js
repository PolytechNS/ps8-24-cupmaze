const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");
const { Game } = require("../logic/Entities/Game.js");
const { getGame, createGame, clearGames} = require("../database/mongo");
const { Case } = require("../logic/Entities/Case.js");
const { findWall, findAdjacentWall, findAdjacentSpace,  removeHighlight, findSpace} = require("../logic/utils");
const { isWallPlacementValid } = require("../logic/wallLayingUtils.js");
const { Wall } = require("../logic/Entities/Wall");
const {beginningPositionIsValid} = require("../logic/movePlayerReferee");

/**
 * Cette fonction va servir pour pouvoir créer le socket qui correspond à quand on va vouloir initialiser une partie entre le bot et un joueur en local
 * Cette fonction est appelée dans le fichier "index.js" pour l'initialiser en attendant une connexion d'un client
 * @param io
 */
function createSocket(io) {

    const BotGameNamespace = io.of("/api/gameBot");
    BotGameNamespace.on("connection", (socket) => {
        console.log("a user connected");
        const game = new Game();

        socket.on("saveGame", (msg)=>{
            getGame(msg).then((savedGame) => {
                if (savedGame) {
                    console.log("Already have a saved game");
                    createGame("error already has game saved").then(() => {
                        socket.emit("goBackToMenu", false);
                    });
                    // TODO si l'utilisateur a déjà une partie sauvegardée il faut voir s'il veut l'écraser ou pas
                }
                else {
                    game.setUserEmail(msg);
                    console.log("userEmail received was : " + msg)
                    createGame(JSON.parse(JSON.stringify(game.toJSON()))).then(() => {
                        socket.emit("goBackToMenu", true);
                    });
                }
            });
        });

        socket.on("clearGames", (msg) => {
            console.log("deleting all games for user "+msg);
            clearGames(msg).then(()=>{
                console.log("cleared all games");
            })
        });

        socket.on("retrieveGame", async (msg) => {
            let savedGame = await getGame(msg);
            if (!savedGame) {
                console.log("No game found");
                // TODO si l'utilisateur n'a aucune une partie sauvegardée
            }
            else {
                let savedGameObject = JSON.parse(JSON.stringify(savedGame));
                //console.log(savedGameObject);
                console.log("Game was succesfully retrieved");
                game.assignGameContext(savedGameObject);
                console.log("Game was succesfully assigned to current game");
                console.log(game);
                socket.emit("launchSavedGame", true);
            }
        });

        socket.on("loadGame", () => {
            socket.emit("data", game.toJSON());
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });

        socket.on("isGameOver", () => {
            console.log("emit from event isGameOver socketBackend")
            let answer = game.isGameOver();
            BotGameNamespace.emit("gameOver", answer[0], answer[1]);
        });

        socket.on("newMoveHumanIsPossible", async (clickedCellId) => {

            let possibleMoves = game.getPossibleMoves(game.playerPosition.player1);
            console.log("possibleMoves", possibleMoves);
            const colonne = parseInt(clickedCellId.split("-")[0]);
            const ligne = parseInt(clickedCellId.split("-")[1]);
            let caseWanted = game.getCase(colonne, ligne);
            let isPossible = possibleMoves.includes(caseWanted);

            if (isPossible && game.actionsToDo===1) {
                let saveOldPosition = game.getPlayerCurrentPosition(1);
                let htmlOldPosition=saveOldPosition[0]+"-"+saveOldPosition[1]+"~cell";
                let htmlNewPosition=caseWanted.getPos_x()+"-"+caseWanted.getPos_y()+"~cell";
                game.graph.updateNodeState(saveOldPosition[0], saveOldPosition[1], -1);
                game.graph.updateNodeState(caseWanted.getPos_x(), caseWanted.getPos_y(), 1);
                game.movePlayer(1, caseWanted, game.getPlayerCurrentPosition(1));
                if (saveOldPosition !== null) BotGameNamespace.emit("isNewMoveHumanIsPossible", isPossible, htmlOldPosition, htmlNewPosition);
                else BotGameNamespace.emit("isNewMoveHumanIsPossible", isPossible, htmlOldPosition, htmlNewPosition);
            }else{
                BotGameNamespace.emit("isNewMoveHumanIsPossible", false, null, null);
            }
        });

        socket.on("undoMovePosition", () => {
            let oldPositionHTML=game.playerPosition["player1"][0]+"-"+game.playerPosition["player1"][1]+"~cell";
            let newPositionHtml="";
            const lastCase = game.getCase(game.lastPlayerPosition["player1"][0], game.lastPlayerPosition["player1"][1]);
            lastCase.setIsOccupied(false);
            if(game.lastPlayerPosition["player1"]!==null){
                newPositionHtml=game.lastPlayerPosition["player1"][0]+"-"+game.lastPlayerPosition["player1"][1]+"~cell";
            }
            game.playerPosition["player1"] = game.lastPlayerPosition["player1"]
            game.actionsToDo=1;
            const currentCase = game.getCase(game.playerPosition["player1"][0], game.playerPosition["player1"][1]);
            currentCase.setIsOccupied(true);
            game.graph.updateNodeState(game.playerPosition["player1"][0], game.playerPosition["player1"][1], 0);
            BotGameNamespace.emit("undoMove", oldPositionHTML, newPositionHtml, 1, game.numberTour);
        });

        socket.on("choosePositionToBegin", (cellId) => {
            const colonne = parseInt(cellId.split("-")[0]);
            const ligne = parseInt(cellId.split("-")[1]);
            const action = game.actionsToDo;
            const currentPlayer = game.currentPlayer;
            var res = beginningPositionIsValid(game.currentPlayer, ligne);
            BotGameNamespace.emit("beginningPositionIsValid", res);

            if (action === 0) {
                BotGameNamespace.emit("checkAction", true);
            }

            game.playerPosition.player1 = [colonne, ligne];
            const caseWanted = game.getCase(colonne, ligne);
            caseWanted.setIsOccupied(true);
            game.graph.updateNodeState(colonne, ligne, currentPlayer);
            BotGameNamespace.emit("currentPlayer", currentPlayer, game.playerPosition.player1);
            game.actionsToDo--;
            game.lastActionType = "position"
            console.log("choosePositionToBegin", game.playerPosition.player1);
        });

        socket.on("validateRound", (msg) => {

            const playerPosition = game.playerPosition;
            let possibleMoves = game.getPossibleMoves(playerPosition.player2);
            const numberTour = game.numberTour;
            let currentplayer = game.currentPlayer;
            const nbWallsPlayer1 = game.nbWallsPlayer1;
            const nbWallsPlayer2 = game.nbWallsPlayer2;

            BotGameNamespace.emit("numberTour", numberTour, possibleMoves);
            let newAIPosition = AIEasy.computeMove(possibleMoves, playerPosition.player2);
            //console.log("newAIPosition", newAIPosition);
            if (!(newAIPosition instanceof Case)) {
                newAIPosition = game.getCase(newAIPosition[0], newAIPosition[1])
            }


            game.currentPlayer = 2
            game.actionsToDo = 1;
            const cellId = newAIPosition.getPos_x() + "-" + newAIPosition.getPos_y() + "~cell";
            game.graph.updateNodeState(newAIPosition[0], newAIPosition[1], 2);
            if(game.actionsToDo === 1){
                BotGameNamespace.emit("positionAI", cellId, game.currentPlayer, playerPosition);
                game.movePlayer(2, newAIPosition, game.getPlayerCurrentPosition(2));
                game.actionsToDo=0;
            }

            game.currentPlayer = 1;
            game.numberTour++;
            game.actionsToDo = 1;

            const winner = game.isGameOver(game.playerPosition);
            console.log(winner);
            console.log(winner[0]);
            if (winner[0] === true) {
                console.log("emitting GameOver")
                BotGameNamespace.emit("gameOver", winner[1]);
                return;
            }

            console.log("#####CHANGEMENT DE TOUR#####");
            BotGameNamespace.emit("numberTourAfter", numberTour);

            //game.lastPlayerPosition = game.playerPosition;

            if (numberTour > 1) {
                possibleMoves = game.getPossibleMoves(playerPosition.player1);
            }
            BotGameNamespace.emit("updateRound",
                possibleMoves, numberTour,
                playerPosition, currentplayer,
                nbWallsPlayer1, nbWallsPlayer2);
        });


        socket.on("wallLaid",(firstWallToColor, wallType, wallPosition, wallId) => {
            if (game.actionsToDo === 0) {
                BotGameNamespace.emit("laidWall", null, true, true);
                return;
            }
            let adjacentWallId = null;
            let adjacentSpaceId = null;

            const colonne = parseInt(wallPosition[0]);
            const ligne = parseInt(wallPosition[2]);
            console.log("colonne", colonne, "ligne", ligne);
            let wallInclinaison;
            if (firstWallToColor === null) { return;}

            if (wallType === "wv") { wallInclinaison = "vertical"; }
            else { wallInclinaison = "horizontal"; }

            const wall = findWall(colonne,ligne, wallInclinaison, game.elements);
            const adjacentWall =
                (wallInclinaison === "vertical")
                    ? findWall(colonne, ligne-1, wallInclinaison, game.elements)
                    : findWall(colonne+1, ligne, wallInclinaison, game.elements);
            const adjacentSpace = findSpace(colonne, ligne, game.elements);

            if (game.actionsToDo > 0 && ((game.currentPlayer === 1 && game.nbWallsPlayer1 > 0) || (game.currentPlayer === 2 && game.nbWallsPlayer2 > 0))) {
                game.layWall(wall,adjacentWall,adjacentSpace);
                game.graph.placeWall(colonne,ligne, (wallInclinaison === "vertical") ? 0 : 1)
                game.actionsToDo--;
                game.lastActionType = "wall";
                if (game.currentPlayer === 1) {
                    game.nbWallsPlayer1--;
                } else {
                    game.nbWallsPlayer2--;
                }
                if (adjacentWall === undefined || adjacentSpace === undefined) {
                    BotGameNamespace.emit("laidWall", null, null, null);
                } else {
                    adjacentWallId = wallType + "~" + adjacentWall.pos_x + "-" + adjacentWall.pos_y;
                    adjacentSpaceId = adjacentSpace.pos_x + "-" + adjacentSpace.pos_y + "-space";
                    BotGameNamespace.emit("laidWall",game.currentPlayer, game.nbWallsPlayer1, game.nbWallsPlayer2);
                }
            }
            game.lastWallLaidsIDHtml = [wallId, adjacentWallId, adjacentSpaceId];
        });

        socket.on("undoWall", () => {
            game.actionsToDo=1;
            game.nbWallsPlayer1++;
            socket.emit("idWallToUndo", game.lastWallLaidsIDHtml, 1, game.nbWallsPlayer1);
            game.undoWalls();
        });

    });
}

module.exports = {
    createSocket
};
