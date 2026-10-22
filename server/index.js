'use strict';

// Express static hosting + socket wiring only. Game logic lives in game.js.
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { createGame } = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const game = createGame();

app.use(express.static(path.join(__dirname, '..', 'client')));

// --- sockets ---
io.on('connection', (socket) => {
  socket.on('join', (name) => {
    game.addPlayer(socket.id, name);
    socket.emit('joined', { id: socket.id });
  });

  socket.on('direction', (dir) => {
    game.setDirection(socket.id, dir);
  });

  socket.on('dash', (active) => {
    game.setDash(socket.id, active);
  });

  socket.on('disconnect', () => {
    game.removePlayer(socket.id);
  });
});

game.start((snap) => io.emit('state', snap));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Snake server on http://localhost:${PORT}`));
