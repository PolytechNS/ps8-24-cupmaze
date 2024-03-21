import { getCookie } from '../tokenUtils.js';
const socket = io.connect('/api/waitingRoom');
const token = getCookie('jwt');

document.addEventListener('DOMContentLoaded', init, false);

function init() {
    console.log('connected to the waiting room');
    socket.emit('waiting_room',
        token,
        localStorage.getItem('gameType')
    );
    socket.on('matchFound', (matchInfo) => onMatchFound(matchInfo));
}

function onMatchFound(matchInfo) {
    console.log('match found', matchInfo);
    setTimeout(() => {
        localStorage.setItem('room', matchInfo.room);
        localStorage.setItem('opponentName', matchInfo.opponentName);
        localStorage.setItem('opponentId', matchInfo.opponentId);
        localStorage.setItem('player1_elo', matchInfo.player1_elo);
        localStorage.setItem('player2_elo', matchInfo.player2_elo);
        window.location.href = `/1v1game.html`;
    }, 2000);
}
