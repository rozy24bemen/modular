import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, testConnection } from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory cache for active players per room (for real-time sync)
const activeRooms = new Map();

// Helper to get or create room in memory
function getActiveRoom(roomKey) {
  if (!activeRooms.has(roomKey)) {
    activeRooms.set(roomKey, {
      players: new Map(),
    });
  }
  return activeRooms.get(roomKey);
}

// Helper to create room key from coordinates
function getRoomKey(x, y) {
  return `${x},${y}`;
}

// Database helpers
async function getOrCreateRoom(coordX, coordY) {
  try {
    // Check if room exists
    let { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('coord_x', coordX)
      .eq('coord_y', coordY)
      .single();

    if (error && error.code === 'PGRST116') {
      // Room doesn't exist, create it
      const { data: newRoom, error: insertError } = await supabase
        .from('rooms')
        .insert({
          coord_x: coordX,
          coord_y: coordY,
          name: `Sala (${coordX}, ${coordY})`,
          is_public: true
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newRoom;
    }

    if (error) throw error;
    return room;
  } catch (error) {
    console.error('Error getting/creating room:', error);
    return null;
  }
}

async function loadRoomModules(roomId) {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('room_id', roomId);

    if (error) throw error;
    
    // Convert database format to app format
    return (data || []).map(m => ({
      id: m.id,
      x: m.x,
      y: m.y,
      shape: m.shape,
      size: m.size,
      width: m.width || m.size,   // Fallback to size for old modules
      height: m.height || m.size, // Fallback to size for old modules
      color: m.color,
      behavior: m.behavior,
      behaviorData: m.behavior_data,
      createdBy: m.creator_id  // Include creator info
    }));
  } catch (error) {
    console.error('Error loading modules:', error);
    return [];
  }
}

async function saveModule(roomId, module, creatorId = null) {
  try {
    console.log('💾 Saving module to database:', { 
      id: module.id, 
      roomId, 
      creatorId,
      width: module.width,
      height: module.height 
    });
    
    const { data, error } = await supabase
      .from('modules')
      .insert({
        id: module.id,
        room_id: roomId,
        creator_id: creatorId,
        x: module.x,
        y: module.y,
        shape: module.shape,
        size: module.size,
        width: module.width || module.size,   // Support new width field
        height: module.height || module.size, // Support new height field
        color: module.color,
        behavior: module.behavior,
        behavior_data: module.behaviorData
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Module saved successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error saving module:', error.message, error.details);
    return null;
  }
}

async function updateModule(moduleId, updates) {
  try {
    const { data, error } = await supabase
      .from('modules')
      .update({
        x: updates.x,
        y: updates.y,
        shape: updates.shape,
        size: updates.size,
        width: updates.width || updates.size,   // Support new width field
        height: updates.height || updates.size, // Support new height field
        color: updates.color,
        behavior: updates.behavior,
        behavior_data: updates.behaviorData
      })
      .eq('id', moduleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating module:', error);
    return null;
  }
}

async function deleteModule(moduleId) {
  try {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting module:', error);
    return false;
  }
}

async function saveChatMessage(roomId, userId, userName, message) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        message: message
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving chat message:', error);
    return null;
  }
}

async function getRecentChatMessages(roomId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, users(username, avatar_color)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse(); // Oldest first
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  let currentRoomKey = null;
  let currentRoomId = null;
  let playerData = null;
  let userId = null;

  // Player joins a room
  socket.on('join-room', async (data) => {
    const { coords, avatar, userId: requestUserId } = data;
    userId = requestUserId || socket.id; // Use socket.id as fallback for guests
    const roomKey = getRoomKey(coords.x, coords.y);
    
    // Leave previous room if any
    if (currentRoomKey) {
      socket.leave(currentRoomKey);
      const prevRoom = getActiveRoom(currentRoomKey);
      prevRoom.players.delete(socket.id);
      
      // Notify others in previous room
      socket.to(currentRoomKey).emit('player-left', {
        playerId: socket.id
      });
    }
    
    // Get or create room in database
    const dbRoom = await getOrCreateRoom(coords.x, coords.y);
    if (!dbRoom) {
      socket.emit('error', { message: 'Failed to load room' });
      return;
    }

    currentRoomId = dbRoom.id;
    currentRoomKey = roomKey;
    socket.join(roomKey);
    
    // Load room data from database
    const modules = await loadRoomModules(dbRoom.id);
    const chatHistory = await getRecentChatMessages(dbRoom.id);
    
    // Add player to active room
    const activeRoom = getActiveRoom(roomKey);
    // Remove client's id to prevent overwriting socket.id
    const { id: _clientId, ...avatarWithoutId } = avatar;
    playerData = {
      id: socket.id,
      ...avatarWithoutId,
      coords
    };
    activeRoom.players.set(socket.id, playerData);
    
    // Send current room state to the new player
    const otherPlayers = Array.from(activeRoom.players.values()).filter(p => p.id !== socket.id);
    socket.emit('room-state', {
      players: otherPlayers,
      modules: modules,
      chatHistory: chatHistory.map(msg => ({
        id: msg.id,
        userId: msg.user_id,
        userName: msg.users?.username || 'Unknown',
        message: msg.message,
        timestamp: new Date(msg.created_at).getTime()
      }))
    });
    
    // Notify others in the room about new player
    socket.to(roomKey).emit('player-joined', playerData);
    
    console.log(`Player ${socket.id} joined room ${roomKey} (DB: ${dbRoom.id})`);
  });

  // Player moves
  socket.on('player-move', (data) => {
    if (!currentRoomKey) return;
    
    const activeRoom = getActiveRoom(currentRoomKey);
    const player = activeRoom.players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      
      // Broadcast to others in room
      socket.to(currentRoomKey).emit('player-moved', {
        playerId: socket.id,
        x: data.x,
        y: data.y
      });
    }
  });

  // Chat message
  socket.on('chat-message', async (data) => {
    if (!currentRoomKey || !currentRoomId) return;
    
    const activeRoom = getActiveRoom(currentRoomKey);
    const player = activeRoom.players.get(socket.id);
    
    if (player) {
      const message = {
        id: Date.now().toString(),
        userId: userId,
        userName: player.name,
        message: data.message,
        timestamp: Date.now()
      };
      
      // Save to database
      await saveChatMessage(currentRoomId, userId, player.name, data.message);
      
      // Update player's chat bubble
      player.chatBubble = {
        message: data.message,
        timestamp: Date.now()
      };
      
      // Broadcast to everyone in room (including sender)
      io.to(currentRoomKey).emit('chat-message', message);
      
      // Broadcast chat bubble update
      socket.to(currentRoomKey).emit('player-chat-bubble', {
        playerId: socket.id,
        chatBubble: player.chatBubble
      });
    }
  });

  // Module created
  socket.on('module-create', async (module) => {
    console.log('🆕 Received module-create event:', { moduleId: module.id, room: currentRoomKey });
    
    if (!currentRoomKey || !currentRoomId) {
      console.error('❌ No room context for module creation');
      return;
    }
    
    // Save to database
    const saved = await saveModule(currentRoomId, module, userId);
    if (!saved) {
      console.error('❌ Failed to save module to database');
      socket.emit('error', { message: 'Failed to create module' });
      return;
    }
    
    console.log('📡 Broadcasting module-created to room:', currentRoomKey);
    // Broadcast to others in room
    socket.to(currentRoomKey).emit('module-created', module);
  });

  // Module updated
  socket.on('module-update', async (module) => {
    if (!currentRoomKey) return;
    
    // Update in database
    const updated = await updateModule(module.id, module);
    if (!updated) {
      socket.emit('error', { message: 'Failed to update module' });
      return;
    }
    
    // Broadcast to others in room
    socket.to(currentRoomKey).emit('module-updated', module);
  });

  // Module deleted
  socket.on('module-delete', async (moduleId) => {
    if (!currentRoomKey) return;
    
    // Delete from database
    const deleted = await deleteModule(moduleId);
    if (!deleted) {
      socket.emit('error', { message: 'Failed to delete module' });
      return;
    }
    
    // Broadcast to others in room
    socket.to(currentRoomKey).emit('module-deleted', moduleId);
  });

  // Avatar customization
  socket.on('avatar-update', (avatar) => {
    if (!currentRoomKey) return;
    
    const activeRoom = getActiveRoom(currentRoomKey);
    const player = activeRoom.players.get(socket.id);
    if (player) {
      Object.assign(player, avatar);
      
      // Broadcast to others in room
      socket.to(currentRoomKey).emit('player-avatar-updated', {
        playerId: socket.id,
        avatar
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (currentRoomKey) {
      const activeRoom = getActiveRoom(currentRoomKey);
      activeRoom.players.delete(socket.id);
      
      // Notify others in room
      socket.to(currentRoomKey).emit('player-left', {
        playerId: socket.id
      });
    }
  });
});

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  const totalPlayers = Array.from(activeRooms.values()).reduce((sum, room) => sum + room.players.size, 0);
  res.json({ 
    status: 'ok', 
    players: totalPlayers,
    rooms: activeRooms.size,
    database: 'supabase'
  });
});

// Verify and migrate database schema
app.post('/api/migrate', async (req, res) => {
  try {
    console.log('🔧 Running database migration...');
    
    // Check if columns exist
    const { data: columns, error: columnError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'modules' 
          AND column_name IN ('width', 'height')
        `
      });
    
    if (columnError) {
      console.error('Error checking columns:', columnError);
      // If RPC doesn't exist, try direct SQL (will fail gracefully)
    }

    // Try to add columns if they don't exist
    const migrationSQL = `
      DO $$ 
      BEGIN
        -- Add width column if not exists
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'modules' AND column_name = 'width'
        ) THEN
          ALTER TABLE modules ADD COLUMN width FLOAT;
          UPDATE modules SET width = size WHERE width IS NULL;
          ALTER TABLE modules ALTER COLUMN width SET NOT NULL;
          ALTER TABLE modules ALTER COLUMN width SET DEFAULT 60;
          RAISE NOTICE 'Added width column';
        END IF;

        -- Add height column if not exists
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'modules' AND column_name = 'height'
        ) THEN
          ALTER TABLE modules ADD COLUMN height FLOAT;
          UPDATE modules SET height = size WHERE height IS NULL;
          ALTER TABLE modules ALTER COLUMN height SET NOT NULL;
          ALTER TABLE modules ALTER COLUMN height SET DEFAULT 60;
          RAISE NOTICE 'Added height column';
        END IF;
      END $$;
    `;

    console.log('⚠️ Note: Automatic migration may not work. Please run SQL manually in Supabase dashboard.');
    console.log('📋 SQL to run:\n', migrationSQL);

    res.json({ 
      success: false,
      message: 'Please run migration manually in Supabase SQL Editor',
      sql: migrationSQL
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'Run the migration SQL manually in Supabase Dashboard > SQL Editor'
    });
  }
});

// Check if migration is needed
app.get('/api/check-migration', async (req, res) => {
  try {
    // Try to query a module with width/height
    const { data, error } = await supabase
      .from('modules')
      .select('width, height')
      .limit(1);

    if (error) {
      // If error contains "column does not exist", migration is needed
      if (error.message.includes('column') && (error.message.includes('width') || error.message.includes('height'))) {
        return res.json({ 
          migrationNeeded: true,
          error: error.message,
          sql: `
-- Run this in Supabase SQL Editor:
ALTER TABLE modules ADD COLUMN IF NOT EXISTS width FLOAT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS height FLOAT;
UPDATE modules SET width = size, height = size WHERE width IS NULL OR height IS NULL;
ALTER TABLE modules ALTER COLUMN width SET NOT NULL, ALTER COLUMN height SET NOT NULL;
ALTER TABLE modules ALTER COLUMN width SET DEFAULT 60, ALTER COLUMN height SET DEFAULT 60;
          `
        });
      }
      throw error;
    }

    res.json({ migrationNeeded: false, message: 'Migration already applied ✅' });
  } catch (error) {
    console.error('Error checking migration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

// Create/update user profile
app.post('/api/users', async (req, res) => {
  try {
    const { id, username, email, avatar_color, avatar_shape } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id,
        username,
        email,
        avatar_color,
        avatar_shape
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get room info
app.get('/api/rooms/:x/:y', async (req, res) => {
  try {
    const { x, y } = req.params;
    const room = await getOrCreateRoom(parseInt(x), parseInt(y));
    if (!room) throw new Error('Failed to load room');
    
    const modules = await loadRoomModules(room.id);
    res.json({ ...room, modules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static frontend files (built React app)
const distPath = path.resolve(__dirname, '..', 'dist');
console.log('📂 Static files path:', distPath);

// Serve static files with proper MIME types
app.use(express.static(distPath, {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.warn('⚠️  Starting without database connection');
  }
  
  httpServer.listen(PORT, () => {
    console.log(`🚀 Unified server running on port ${PORT}`);
    console.log(`🗄️  Database: ${connected ? 'Connected' : 'Disconnected'}`);
    console.log(`📱 Frontend: Serving from ${distPath}`);
    console.log(`🔌 Socket.io: Ready for connections`);
  });
}

startServer();
