import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import db from './database/db.js';
import { AksharaKeliya } from './games/aksharaKeliya.js';
import { LankaTrivia } from './games/lankaTrivia.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active games in memory
const activeGames = new Map();
const playerSockets = new Map();

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/rooms', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms WHERE status = ?').all('waiting');
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const { gameType, hostId, username } = req.body;
  const roomId = uuidv4();
  
  db.prepare('INSERT INTO rooms (id, game_type, host_id) VALUES (?, ?, ?)').run(roomId, gameType, hostId);
  db.prepare('INSERT INTO players (id, room_id, username) VALUES (?, ?, ?)').run(hostId, roomId, username);
  
  res.json({ roomId, gameType });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ gameType, username }) => {
    const roomId = uuidv4();
    const playerId = socket.id;
    
    try {
      // Create room in database
      db.prepare('INSERT INTO rooms (id, game_type, host_id) VALUES (?, ?, ?)').run(roomId, gameType, playerId);
      
      // Delete existing player record if any (in case of reconnection)
      db.prepare('DELETE FROM players WHERE id = ?').run(playerId);
      db.prepare('INSERT INTO players (id, room_id, username) VALUES (?, ?, ?)').run(playerId, roomId, username);
      
      // Initialize game
      let game;
      if (gameType === 'aksharaKeliya') {
        game = new AksharaKeliya(roomId);
      } else if (gameType === 'lankaTrivia') {
        game = new LankaTrivia(roomId);
      }
      
      activeGames.set(roomId, game);
      playerSockets.set(playerId, { socket, roomId, username });
      
      socket.join(roomId);
      socket.emit('roomCreated', { roomId, gameType, playerId });
      io.to(roomId).emit('playerJoined', { playerId, username });
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  socket.on('joinRoom', ({ roomId, username }) => {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'Game already started' });
      return;
    }
    
    const players = db.prepare('SELECT * FROM players WHERE room_id = ?').all(roomId);
    
    if (players.length >= room.max_players) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    const playerId = socket.id;
    
    try {
      // Delete existing player record if any (in case of reconnection)
      db.prepare('DELETE FROM players WHERE id = ?').run(playerId);
      db.prepare('INSERT INTO players (id, room_id, username) VALUES (?, ?, ?)').run(playerId, roomId, username);
      
      playerSockets.set(playerId, { socket, roomId, username });
      socket.join(roomId);
      
      socket.emit('roomJoined', { roomId, gameType: room.game_type, playerId });
      io.to(roomId).emit('playerJoined', { playerId, username });
      
      // Send current players to the new player
      const allPlayers = db.prepare('SELECT * FROM players WHERE room_id = ?').all(roomId);
      socket.emit('playersList', allPlayers.map(p => ({ id: p.id, username: p.username, score: p.score })));
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('startGame', ({ roomId }) => {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    
    if (!room || room.host_id !== socket.id) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }
    
    db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run('playing', roomId);
    
    const game = activeGames.get(roomId);
    io.to(roomId).emit('gameStarted', { 
      gameState: game.getState(),
      roomId: roomId,
      gameType: room.game_type
    });
  });

  socket.on('submitWord', ({ roomId, word }) => {
    const game = activeGames.get(roomId);
    if (!game || !(game instanceof AksharaKeliya)) {
      socket.emit('error', { message: 'Invalid game' });
      return;
    }
    
    const result = game.submitWord(socket.id, word);
    
    if (result.success) {
      io.to(roomId).emit('wordFound', {
        playerId: socket.id,
        word,
        points: result.points,
        translation: result.translation,
        scores: game.playerScores
      });
    } else {
      socket.emit('wordRejected', { message: result.message });
    }
  });

  socket.on('submitAnswer', ({ roomId, answerIndex }) => {
    const game = activeGames.get(roomId);
    if (!game || !(game instanceof LankaTrivia)) {
      socket.emit('error', { message: 'Invalid game' });
      return;
    }
    
    try {
      const result = game.submitAnswer(socket.id, answerIndex);
      socket.emit('answerResult', result);
      
      // Update player score in database
      if (result.correct) {
        db.prepare('UPDATE players SET score = score + ? WHERE id = ?').run(result.points, socket.id);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      socket.emit('error', { message: 'Failed to submit answer' });
    }
  });

  socket.on('nextQuestion', ({ roomId }) => {
    const game = activeGames.get(roomId);
    if (!game || !(game instanceof LankaTrivia)) {
      return;
    }
    
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
    if (room.host_id !== socket.id) {
      return;
    }
    
    const nextQ = game.nextQuestion();
    
    if (nextQ) {
      io.to(roomId).emit('newQuestion', nextQ);
    } else {
      const results = game.getResults();
      io.to(roomId).emit('gameOver', results);
      db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run('finished', roomId);
    }
  });

  socket.on('getGameState', ({ roomId }) => {
    const game = activeGames.get(roomId);
    if (game) {
      socket.emit('gameState', game.getState());
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const playerData = playerSockets.get(socket.id);
    if (playerData) {
      const { roomId, username } = playerData;
      
      // Remove player from database
      db.prepare('DELETE FROM players WHERE id = ?').run(socket.id);
      
      // Notify other players
      io.to(roomId).emit('playerLeft', { playerId: socket.id, username });
      
      // Check if room is empty
      const remainingPlayers = db.prepare('SELECT * FROM players WHERE room_id = ?').all(roomId);
      if (remainingPlayers.length === 0) {
        db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);
        activeGames.delete(roomId);
      }
      
      playerSockets.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🎮 Server running on port ${PORT}`);
  console.log(`🌐 WebSocket server ready for connections`);
});

export default app;
