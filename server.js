import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Ajustes para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve a pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Serve a pasta "src" pros módulos JS no navegador
app.use('/src', express.static(path.join(__dirname, 'src')));

const players = {};

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  // Cria jogador no servidor com posição inicial
  players[socket.id] = {
    x: 0,
    y: 4,
    z: 0,
  };

  // Envia lista de jogadores já existentes para o novo jogador
  socket.emit('initPlayers', players);

  // Avisa os outros que um novo jogador chegou
  socket.broadcast.emit('newPlayer', { id: socket.id, pos: players[socket.id] });

  // Recebe movimento do jogador e transmite para os outros
  socket.on('playerMove', (pos) => {
    if (players[socket.id]) {
      players[socket.id] = pos;
      socket.broadcast.emit('updatePlayer', { id: socket.id, pos });
    }
  });

  // Quando jogador desconecta
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    delete players[socket.id];
    socket.broadcast.emit('removePlayer', socket.id);
  });
});

// Inicia o servidor
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
