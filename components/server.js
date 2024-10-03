const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001;

// Store active games
const activeGames = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('createGame', () => {
    const gameId = Math.random().toString(36).substring(7);
    activeGames.set(gameId, { players: [socket.id], gameState: {} });
    socket.join(gameId);
    socket.emit('gameCreated', gameId);
  });

  socket.on('joinGame', (gameId) => {
    const game = activeGames.get(gameId);
    if (game && game.players.length < 2) {
      game.players.push(socket.id);
      socket.join(gameId);
      io.to(gameId).emit('gameJoined', { gameId, players: game.players });
      if (game.players.length === 2) {
        io.to(gameId).emit('gameStart', { wordToGuess: 'ALIVE' });
      }
    } else {
      socket.emit('gameError', 'Game not found or already full');
    }
  });

  socket.on('makeGuess', ({ gameId, guess, row }) => {
    const game = activeGames.get(gameId);
    if (game) {
      io.to(gameId).emit('guessResult', { guess, row });
    }
  });

  socket.on('gameOver', ({ gameId, result }) => {
    io.to(gameId).emit('gameEnded', result);
    activeGames.delete(gameId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Handle player disconnection (e.g., notify other player, end game)
  });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));