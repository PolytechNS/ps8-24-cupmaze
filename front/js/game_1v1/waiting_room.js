
const socket = io.connect('/api/waitingRoom');

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// on recupere le token jwt stocké dans le cookie
const token = getCookie('jwt');

document.addEventListener('DOMContentLoaded', init, false);

function init() {
    console.log('connected to the waiting room');
    socket.emit('waiting_room', token);
    socket.on('matchFound', (matchInfo) => onMatchFound(matchInfo));
}

function onMatchFound(matchInfo) {
    console.log('match found', matchInfo);
    setTimeout(() => {
        localStorage.setItem('room', matchInfo.room);
        localStorage.setItem('opponent', matchInfo.opponent);
        localStorage.setItem('opponentId', matchInfo.opponentId);
        window.location.href = `/1v1game.html`;
    }, 2000);
    console.log('message received');
}

/*
socket.on('matchFound', () => {
    console.log('message received');
    window.location.href = `/1v1game.html`;
});
*/