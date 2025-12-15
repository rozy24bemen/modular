import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active players per room
const rooms = new Map();

// Helper to get or create room
function getRoom(roomKey) {
  if (!rooms.has(roomKey)) {
    rooms.set(roomKey, {
      players: new Map(),
      modules: []
    });
  }
  return rooms.get(roomKey);
}

// Helper to create room key from coordinates
function getRoomKey(x, y) {
  return `${x},${y}`;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  let currentRoom = null;
  let playerData = null;

  // Player joins a room
  socket.on('join-room', (data) => {
    const { coords, avatar } = data;
    const roomKey = getRoomKey(coords.x, coords.y);
    
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      const prevRoom = getRoom(currentRoom);
      prevRoom.players.delete(socket.id);
      
      // Notify others in previous room
      socket.to(currentRoom).emit('player-left', {
        playerId: socket.id
      });
    }
    
    // Join new room
    currentRoom = roomKey;
    socket.join(roomKey);
    
    const room = getRoom(roomKey);
    playerData = {
      id: socket.id,
      ...avatar,
      coords
    };
    room.players.set(socket.id, playerData);
    
    // Send current room state to the new player
    const otherPlayers = Array.from(room.players.values()).filter(p => p.id !== socket.id);
    socket.emit('room-state', {
      players: otherPlayers,
      modules: room.modules
    });
    
    // Notify others in the room about new player
    socket.to(roomKey).emit('player-joined', playerData);
    
    console.log(`Player ${socket.id} joined room ${roomKey}`);
  });

  // Player moves
  socket.on('player-move', (data) => {
    if (!currentRoom) return;
    
    const room = getRoom(currentRoom);
    const player = room.players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      
      // Broadcast to others in room
      socket.to(currentRoom).emit('player-moved', {
        playerId: socket.id,
        x: data.x,
        y: data.y
      });
    }
  });

  // Chat message
  socket.on('chat-message', (data) => {
    if (!currentRoom) return;
    
    const room = getRoom(currentRoom);
    const player = room.players.get(socket.id);
    
    if (player) {
      const message = {
        id: Date.now().toString(),
        userId: socket.id,
        userName: player.name,
        message: data.message,
        timestamp: Date.now()
      };
      
      // Update player's chat bubble
      player.chatBubble = {
        message: data.message,
        timestamp: Date.now()
      };
      
      // Broadcast to everyone in room (including sender)
      io.to(currentRoom).emit('chat-message', message);
      
      // Broadcast chat bubble update
      socket.to(currentRoom).emit('player-chat-bubble', {
        playerId: socket.id,
        chatBubble: player.chatBubble
      });
    }
  });

  // Module created
  socket.on('module-create', (module) => {
    if (!currentRoom) return;
    
    const room = getRoom(currentRoom);
    room.modules.push(module);
    
    // Broadcast to others in room
    socket.to(currentRoom).emit('module-created', module);
  });

  // Module updated
  socket.on('module-update', (module) => {
    if (!currentRoom) return;
    
    const room = getRoom(currentRoom);
    const index = room.modules.findIndex(m => m.id === module.id);
    if (index !== -1) {
      room.modules[index] = module;
    }
    
    // Broadcast to others in room
    socket.to(currentRoom).emit('module-updated', module);
  });

  // Module deleted
  socket.on('module-delete', (moduleId) => {
    if (!currentRoom) return;
    
    const room = getRoom(currentRoom);
    room.modules = room.modules.filter(m => m.id !== moduleId);
    
    // Broadcast to others in room
    socket.to(currentRoom).emit('module-deleted', moduleId);
  });

  // Avatar customization
  socket.on('avatar-update', (avatar) => {
    if (!currentRoom) return;
    
    const room = getRoom(currentRoom);
    const player = room.players.get(socket.id);
    if (player) {
      Object.assign(player, avatar);
      
      // Broadcast to others in room
      socket.to(currentRoom).emit('player-avatar-updated', {
        playerId: socket.id,
        avatar
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (currentRoom) {
      const room = getRoom(currentRoom);
      room.players.delete(socket.id);
      
      // Notify others in room
      socket.to(currentRoom).emit('player-left', {
        playerId: socket.id
      });
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Multiplayer server running on port ${PORT}`);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    players: Array.from(rooms.values()).reduce((sum, room) => sum + room.players.size, 0),
    rooms: rooms.size
  });
});
