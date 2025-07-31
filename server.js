import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { World } from './game/world.js';
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

const floor = new Floor('floor1', 0, -1, 0, 30, 1, 30);
world.addObject(floor);
collisionSystem.addObject(floor);
//gravitySystem.addObject(floor);

const box = new Box('box1', 3, 10, 3, 3, 1, 1.5, 0.1);
world.addObject(box);
collisionSystem.addObject(box);
gravitySystem.addObject(box);

const box2 = new Box('box2', 5, 50, -3, 1, 2, 2, 0.9);
world.addObject(box2);
collisionSystem.addObject(box2);
gravitySystem.addObject(box2);

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
            player.velocity.x = (input.x || 0) * player.speed;
            player.velocity.z = (input.z || 0) * player.speed;

            if (input.jump && isPlayerGrounded(player)) {
                gravitySystem.makeObjectJump(player, 8);
            }
            
        }
    });

    function isPlayerGrounded(player) {
        const collisions = collisionSystem.getCollisionsFor(player);
        
        for (const obj of collisions) {
            // Verifica se o objeto está abaixo do centro do player
            const heightDifference = player.position.y - obj.position.y;
            const minDistance = (player.sizeY + obj.sizeY) / 2;
            
            // Se estão colidindo e o objeto está embaixo
            if (heightDifference > 0 && heightDifference <= minDistance) {
                return true;
            }
        }
        return false;
    }

    socket.on('disconnect', () => {
        world.removeObject(socket.id);
        console.log('Player disconnected:', socket.id);
    });
});

setInterval(() => {
    gravitySystem.update(1/60);
    world.update(1/60);
    collisionSystem.update();
    const state = world.getState();
    io.emit('state', state);
}, 1000 / 60);

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});