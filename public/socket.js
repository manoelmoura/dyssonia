//import { io } from '/socket.io/socket.io.js';

const socket = io();
let socketId = null;
let onStateCallback = null;

export function setupSocket() {
    socket.on('connect', () => {
        socketId = socket.id;
        console.log('Connected:', socketId);
    });

    socket.on('state', state => {
        if (onStateCallback) {
            onStateCallback(state);
        }
    });

    const keys = {};
    const input = { x: 0, z: 0 };

    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    setInterval(() => {
        const horizontal = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
        const vertical = (keys['a'] ? 1 : 0) - (keys['d'] ? 1 : 0);
        input.x = (horizontal - vertical) * 0.707;
        input.z = (horizontal + vertical) * 0.707;
        input.jump = keys[' '] || false;

        socket.emit('input', input);
    }, 1000 / 60);
}

export function onServerState(callback) {
    onStateCallback = callback;
}

export function getSocketId() {
    return socketId;
}