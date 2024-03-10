// create a room for waiting
// waiting room is a room where players wait for the game to start

// au chargement de la page, on emet un socket pour dire qu'on est dans la waiting room

const socket = io('/api/game1v1');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    socket.emit('waiting_room');
});

socket.on('startGame', (room) => {
    console.log('message received', room);
    window.location.href = `/1v1game.html?room=${room}`;
});