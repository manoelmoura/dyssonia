import * as THREE from 'three';
import { Cubo } from './cubo.js';
import { Camera } from './camera.js';
import { Floor } from './floor.js';
import { Player } from './player.js';

const scene = new THREE.Scene();

const cameraInstance = new Camera();
const camera = cameraInstance.getCamera();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player
const player = new Player(camera);
scene.add(player.mesh);
player.enableMouseLook();

// Cubos
const cubo = new Cubo(0x00ff00, { x: 0, y: 0, z: 0 });
const cubo2 = new Cubo(0xff0000, { x: 10, y: 1, z: -10 });
scene.add(cubo.mesh);
scene.add(cubo2.mesh);

// Chão
const floor = new Floor(100, 0x808080);
scene.add(floor.mesh);

document.body.addEventListener('click', () => {
  document.body.requestPointerLock();
});


// Animação
function animate() {
  cubo.update();
  cubo2.update();
  player.move();
  player.updateCamera();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
