
const socket = io.connect('/api/waitingRoom');

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift
}

const token = getCookie('jwt');

console.log('token', token);

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    socket.emit('waiting_room', token);
});

socket.on('startGame', (room) => {
    console.log('message received', room);
    window.location.href = `/1v1game.html?room=${room}`;
});

