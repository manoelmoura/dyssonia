import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

import { World } from './game/world.js';
import { RoomManager } from './game/roomManager.js';
import { Room } from './game/room.js';
import { Door } from './game/door.js';

import { Player } from './game/player.js';
import { Floor } from './game/floor.js';
import { Box } from './game/box.js';

import { CollisionSystem } from './game/collision.js';
import { GravitySystem } from './game/gravity.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {cors: { origin: '*' } });

const world = new World();
const collisionSystem = new CollisionSystem();
const gravitySystem = new GravitySystem();
const roomManager = new RoomManager(world, collisionSystem, gravitySystem);

const sala1 = new Room('sala1', 10, 10);
const box = new Box('box1', 3, 10, 3, 3, 1, 1.5, 0.1);
sala1.addObject(box);
const porta1a = new Door('porta1a', 2, 1, 1, 'sala2', 'porta2a');
sala1.addObject(porta1a);

const sala2 = new Room('sala2', 40, 40, world);
const porta2a = new Door('porta2a', 10, 1, 10, 'sala1', 'porta1a')
sala2.addObject(porta2a);
const porta2b = new Door('porta2b', 10, 1, 0, 'sala3', 'porta3a')
sala2.addObject(porta2b);

const sala3 = new Room('sala3', 20, 50, world);
const porta3a = new Door('porta3a', 0, 1, 20, 'sala2', 'porta2b')
sala3.addObject(porta3a);

roomManager.addRoom(sala1);
roomManager.addRoom(sala2);
roomManager.addRoom(sala3);

roomManager.switchToRoom('sala1');

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    const player = new Player(socket.id, `Player${socket.id}`);
    world.addObject(player);
    collisionSystem.addObject(player);
    gravitySystem.addObject(player);

    socket.on('input', input => {
        const player = world.getObject(socket.id);
        if (player) {
            player.handleInput(input, collisionSystem, gravitySystem)
        }
    });

    socket.on('disconnect', () => {
        world.removeObject(socket.id);
        console.log('Player disconnected:', socket.id);
    });
});

setInterval(() => {
    gravitySystem.update(1/60);
    world.update(1/60);
    collisionSystem.update();
    collisionSystem.checkDoorCollisions(roomManager);
    const state = world.getState();
    io.emit('state', state);
}, 1000 / 60);

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});