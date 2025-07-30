import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { Camera } from './camera.js';
import { Player } from './player.js';
import { Floor } from './floor.js';
import { setupSocket, getSocketId, onServerState } from './socket.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const gameObjects = new Map();
let localPlayer = null;
let cameraObj = null;

setupSocket();

onServerState(state => {
    state.forEach(obj => {
        if (!gameObjects.has(obj.id)) {
            let gameObject;
            
            if (obj.type === 'player') {
                const color = obj.id === getSocketId() ? 0xff0000 : 0x00ff00;
                gameObject = new Player(obj.id, color);
                
                if (obj.id === getSocketId()) {
                    localPlayer = gameObject;
                    cameraObj = new Camera(gameObject.getMesh());
                }
            } else if (obj.type === 'floor') {
                gameObject = new Floor(obj.id, obj.size, 0xccaacc); // Classe visual do floor
            }
            
            if (gameObject) {
                scene.add(gameObject.getMesh());
                gameObjects.set(obj.id, gameObject);
            }
        }
        
        gameObjects.get(obj.id).setPosition(obj.position);
    });
    
    // Remover objetos desconectados
    for (const [id, obj] of gameObjects) {
        if (!state.find(o => o.id === id)) {
            scene.remove(obj.getMesh());
            gameObjects.delete(id);
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    if (cameraObj) {
        cameraObj.update();
        renderer.render(scene, cameraObj.getCamera());
    }
}
animate();

