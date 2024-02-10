const AIEasy = require("../logic/ai.js");
const { Server } = require("socket.io");
const { Game } = require("../logic/Game.js");
const {findWall, findSpace} = require("../logic/utils");

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
            let newPosition = AIEasy.computeMove(msg,game);
            console.log("new Position: "+newPosition);
            gameNamespace.emit("updatedBoard", newPosition);
        });

        socket.on("layWall", (msg) => {
            console.log("Le joueur souhaite placer le mur suivant : "+msg);
            // msg is string of form: wv~X-Y A-B-space wv~M-N
            let isWallLayingPossible=game.actionsToDo>0 && game.currentPlayer===1 && game.nbWallsPlayer1>0;
            if(isWallLayingPossible){
                let walls=msg.split(" ");
                let coords;
                let line;
                let col;
                walls.forEach((wall)=>{
                    //console.log(wall);
                    coords=wall.split("~")[1];
                    if(!coords) coords=wall;
                    line=parseInt(coords.split("-")[0]);
                    col=parseInt(coords.split("-")[1]);
                    if(wall[1]==="h"){
                        //Horizontal Wall
                        findWall(line,col,"horizontal",game.elements).isLaid=true;
                    }
                    else if(wall[1]==="v"){
                        //Vertical Wall
                        findWall(line,col,"vertical",game.elements).isLaid=true;
                    }
                    else{
                        //Space
                        findSpace(line,col,game.elements).isLaid=true;
                    }
                })
                game.nbWallsPlayer1--;
            }
            gameNamespace.emit("wallLaying", isWallLayingPossible, game.nbWallsPlayer1);
        });

        socket.on("disconnect", () => {
            console.log("user disconnected");
        });
    });
}

module.exports = {
    createSocket
};