import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

import { World } from './game/world.js';
import { RoomManager } from './game/roomManager.js';
import { Room } from './game/room.js';
import { Door } from './game/door.js';
import { DungeonGenerator } from './game/dungeonGenerator.js';

import { Player } from './game/player.js';
import { Wall } from './game/wall.js';
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
const generator = new DungeonGenerator(roomManager);

generator.generateDungeon(8);

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