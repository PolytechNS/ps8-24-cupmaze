let waitingPlayers = []

async function joinWaitingRoom(id, username) {
    if (waitingPlayers.filter(player => player.id === id).length > 0) {
        console.log("user " + username + " already in the waiting room");
        return;
    }
    if (waitingPlayers.length === 0) {
        console.log(username, id + " joined the waiting room");
        waitingPlayers.push({id, username});
        return;
    }
    return waitingPlayers.pop();
}

function remove(id) {
    console.log("Matchmaking: removing " + id + " from waiting room");
    console.log("current waiting room: " + waitingPlayers);
    for (let i = 0; i < waitingPlayers.length; i++) {
        if (waitingPlayers[i].id === id) {
            console.log(waitingPlayers[i].username + " removed from waiting room");
            waitingPlayers.splice(i, 1);
            return;
        }
    }
    console.log("user not found in waiting room");
}

module.exports = {
    joinWaitingRoom: joinWaitingRoom,
    remove: remove
};