import { getCookie } from '../tokenUtils.js';
const socket = io.connect('/api/waitingRoom');
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
        localStorage.setItem('opponentName', matchInfo.opponentName);
        localStorage.setItem('opponentId', matchInfo.opponentId);
        window.location.href = `/1v1game.html`;
    }, 2000);
    console.log('message received');
}
