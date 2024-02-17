/*
The gameState object has the following properties:

opponentWalls: a list containing each of your opponent's walls (for each wall, the value is a
list containing 2 elements --> a position string representing the top-left square that the wall is in contact with,
and 0 if the wall is placed horizontally or1 if it is vertical).

ownWalls: a list containing each of your walls (the same way opponentWalls are defined).

board: a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1)
as defined in the rules. The value for each cell can be : -1 if you do not see the cell, 0 if you see the cell but it is empty,
1 if you are in the cell, 2 if your opponent is in the cell

The move object has the following properties:

action: "move", "wall", or "idle" (note that "idle" can only be used when no legal action can be performed)

value (only if the action is not "idle"):
- for the "move" action: a position string
- for the "wall" action: a list containing 2 elements --> a position string representing the top-left square that the wall is
in contact with, and 0 if the wall is placed horizontally or1 if it is vertical.
 */

let gameState = {
    // a list containing each of your opponent's walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    opponentWalls: [],
    // a list containing each of your walls (for each wall, the value is a list containing 2 elements --> a position string representing the top-left square that the wall is in contact with, and 0 if the wall is placed horizontally or1 if it is vertical).
    ownWalls: [],
    //a list containing 9 lists of length 9, for which board[i][j] represents the content of the cell (i+1, j+1) as defined in the rules. The value for each cell can be : -1 if you do not see the cell, 0 if you see the cell but it is empty, 1 if you are in the cell, 2 if your opponent is in the cell
    board: [],
}

let wall1=["13",0];
let wall2=["34",1];
let wall3=["33",0];
let opponentWalls = [wall1, wall2, wall3] //pareil pour ownWalls

// exemple de board au round 1 lorsque le joueur 1 pose son pion au milieu de la première ligne
let board=[
    [-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [ 0, 0, 0, 0, 1, 0, 0, 0, 0]
];

// Exemple de move qui est de bouger un pion de la case 51 à 52 (de milieu du table en bas a la case juste au dessus)
let action1="move";
let value1="52";
let move1={action: action1, value: value1}


// Exemple de move qui est de poser un mur vertical a gauche de la cellule de position "34" (ligne 4 colonne 3)
// ce mur s'étend sur la cellule "33"
let action2="wall";
let value2=["34",1];
let move2={action: action2, value: value2}

