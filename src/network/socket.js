import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const otherPlayers = {}; // <- guarda os outros jogadores

export function initSocket(scene, player) {
  const socket = io();

  socket.on('connect', () => {
    console.log('Conectado com ID:', socket.id);
  });

  // Inicializa outros jogadores já existentes
  socket.on('initPlayers', (players) => {
    for (const id in players) {
      if (id === socket.id) continue;
      addOtherPlayer(id, players[id], scene);
    }
  });

  // Novo jogador entrou
  socket.on('newPlayer', ({ id, pos }) => {
    if (id !== socket.id) {
      addOtherPlayer(id, pos, scene);
    }
  });

  // Atualiza posição dos outros
  socket.on('updatePlayer', ({ id, pos }) => {
    if (otherPlayers[id]) {
      otherPlayers[id].position.set(pos.x, pos.y, pos.z);
    }
  });

  // Remove jogador
  socket.on('removePlayer', (id) => {
    if (otherPlayers[id]) {
      scene.remove(otherPlayers[id]);
      delete otherPlayers[id];
    }
  });

  // Envia a posição do jogador atual
  setInterval(() => {
    const pos = player.mesh.position;
    socket.emit('playerMove', { x: pos.x, y: pos.y, z: pos.z });
  });
}

function addOtherPlayer(id, pos, scene) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pos.x, pos.y, pos.z);
  scene.add(mesh);
  otherPlayers[id] = mesh;
}
