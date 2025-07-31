import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { Camera } from './camera.js';
import { Player } from './player.js';
import { Floor } from './floor.js';
import { Box } from './box.js';
import { setupSocket, getSocketId, onServerState } from './socket.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
scene.add(ambientLight);

// Remove a DirectionalLight e usa SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 1, 10);
spotLight.target.position.set(0, 0, 0); // Para onde a luz aponta

// Configurações do cone
spotLight.angle = Math.PI / 6; // Ângulo do cone (30 graus)
spotLight.penumbra = 0.3; // Suavidade da borda (0-1)
spotLight.decay = 2; // Como a luz diminui com distância
spotLight.distance = 50; // Distância máxima da luz

// Sombras
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 0.1;
spotLight.shadow.camera.far = 50;
spotLight.shadow.camera.fov = 30;

scene.add(spotLight);
scene.add(spotLight.target); // Importante adicionar o target também!

// Helpers para visualizar
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const shadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(shadowHelper);


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
                gameObject = new Player(obj.id, obj.sizeX, obj.sizeY, obj.sizeZ, color);
                
                if (obj.id === getSocketId()) {
                    localPlayer = gameObject;
                    cameraObj = new Camera(gameObject.getMesh());
                }
            } else if (obj.type === 'floor') {
                gameObject = new Floor(obj.id, obj.sizeX, obj.sizeY, obj.sizeZ, 0xccaacc); // Classe visual do floor
            } else if (obj.type === 'box') {
                gameObject = new Box(obj.id, obj.sizeX, obj.sizeY, obj.sizeZ, 0x742724);
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

