import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { World } from './game/world.js';
import { Player } from './game/player.js';
import { Floor } from './game/floor.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {cors: { origin: '*' } });

const world = new World();

const floor = new Floor('floor1', 0, -2, 0, 30);
world.addObject(floor);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    const player = new Player(socket.id, `Player${socket.id}`);
    world.addObject(player);

    socket.on('input', input => {
        const player = world.getObject(socket.id);
        if (player) {
            player.velocity.x = (input.x || 0) * player.speed;
            player.velocity.z = (input.z || 0) * player.speed;
            
        }
    });

    socket.on('disconnect', () => {
        world.removeObject(socket.id);
        console.log('Player disconnected:', socket.id);
    });
});

setInterval(() => {
    world.update(1);
    const state = world.getState();
    io.emit('state', state);
}, 1000 / 60);

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});