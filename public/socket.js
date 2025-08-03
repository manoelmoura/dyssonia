//import { io } from '/socket.io/socket.io.js';

const socket = io();
let socketId = null;
let onStateCallback = null;

// Keys acessível para export
const keys = {};

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

    const input = { x: 0, z: 0 };

    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    setInterval(() => {
        let horizontal, vertical;
        
        // Verifica se está em primeira pessoa para ajustar controles
        if (window.cameraObj && window.cameraObj.isFirstPersonMode && window.cameraObj.isFirstPersonMode()) {
            // Primeira pessoa: movimento relativo à direção da câmera
            const forward = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0); // S = frente, W = trás (MANTENDO ORIGINAL)
            const strafe = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);   // D = direita, A = esquerda
            
            // Usa a rotação da câmera (mouseX) para calcular direção
            // Compensando o offset isométrico
            const rotation = (window.cameraObj.mouseX || 0) + Math.PI/4;
            
            // Converte movimento local para movimento mundial
            const worldForward = Math.sin(rotation) * forward;
            const worldStrafeX = Math.cos(rotation) * strafe;
            const worldRight = Math.cos(rotation) * forward;
            const worldStrafeZ = -Math.sin(rotation) * strafe;
            
            // Combina os movimentos
            horizontal = worldForward + worldStrafeX;
            vertical = worldRight + worldStrafeZ;
        } else {
            // Terceira pessoa: controles originais
            horizontal = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);
            vertical = (keys['a'] ? 1 : 0) - (keys['d'] ? 1 : 0);
        }
        
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

export { keys };