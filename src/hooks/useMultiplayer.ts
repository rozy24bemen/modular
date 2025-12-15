import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Avatar, Module, ChatMessage, RoomCoords } from '../App';

// Change this to your deployed server URL
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface UseMultiplayerProps {
  playerAvatar: Avatar;
  currentCoords: RoomCoords;
  onPlayersUpdate: (players: Avatar[]) => void;
  onModulesUpdate: (updater: Module[] | ((prev: Module[]) => Module[])) => void;
  onChatMessage: (message: ChatMessage) => void;
}

export function useMultiplayer({
  playerAvatar,
  currentCoords,
  onPlayersUpdate,
  onModulesUpdate,
  onChatMessage,
}: UseMultiplayerProps) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const otherPlayersRef = useRef<Map<string, Avatar>>(new Map());

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ Connected to multiplayer server');
      setIsConnected(true);
      
      // Join the current room
      socket.emit('join-room', {
        coords: currentCoords,
        avatar: playerAvatar,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    // Room state when joining
    socket.on('room-state', (data: { players: Avatar[], modules: Module[] }) => {
      console.log('📦 Received room state:', data);
      
      // Update other players
      otherPlayersRef.current.clear();
      data.players.forEach(player => {
        otherPlayersRef.current.set(player.id, player);
      });
      onPlayersUpdate(Array.from(otherPlayersRef.current.values()));
      
      // Update modules
      onModulesUpdate(data.modules);
    });

    // New player joined
    socket.on('player-joined', (player: Avatar) => {
      console.log('👋 Player joined:', player.name);
      otherPlayersRef.current.set(player.id, player);
      onPlayersUpdate(Array.from(otherPlayersRef.current.values()));
    });

    // Player left
    socket.on('player-left', (data: { playerId: string }) => {
      console.log('👋 Player left:', data.playerId);
      otherPlayersRef.current.delete(data.playerId);
      onPlayersUpdate(Array.from(otherPlayersRef.current.values()));
    });

    // Player moved
    socket.on('player-moved', (data: { playerId: string, x: number, y: number }) => {
      const player = otherPlayersRef.current.get(data.playerId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        otherPlayersRef.current.set(data.playerId, player);
        onPlayersUpdate(Array.from(otherPlayersRef.current.values()));
      }
    });

    // Chat message received
    socket.on('chat-message', (message: ChatMessage) => {
      onChatMessage(message);
    });

    // Player chat bubble
    socket.on('player-chat-bubble', (data: { playerId: string, chatBubble: any }) => {
      const player = otherPlayersRef.current.get(data.playerId);
      if (player) {
        player.chatBubble = data.chatBubble;
        otherPlayersRef.current.set(data.playerId, player);
        onPlayersUpdate(Array.from(otherPlayersRef.current.values()));
      }
    });

    // Module created
    socket.on('module-created', (module: Module) => {
      console.log('🧱 Module created:', module.id);
      onModulesUpdate((prev) => [...prev, module]);
    });

    // Module updated
    socket.on('module-updated', (module: Module) => {
      console.log('🔧 Module updated:', module.id);
      onModulesUpdate((prev) => prev.map(m => m.id === module.id ? module : m));
    });

    // Module deleted
    socket.on('module-deleted', (moduleId: string) => {
      console.log('🗑️ Module deleted:', moduleId);
      onModulesUpdate((prev) => prev.filter(m => m.id !== moduleId));
    });

    // Avatar updated
    socket.on('player-avatar-updated', (data: { playerId: string, avatar: Partial<Avatar> }) => {
      const player = otherPlayersRef.current.get(data.playerId);
      if (player) {
        Object.assign(player, data.avatar);
        otherPlayersRef.current.set(data.playerId, player);
        onPlayersUpdate(Array.from(otherPlayersRef.current.values()));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update room when coordinates change
  useEffect(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', {
        coords: currentCoords,
        avatar: playerAvatar,
      });
      
      // Clear other players when changing rooms
      otherPlayersRef.current.clear();
      onPlayersUpdate([]);
    }
  }, [currentCoords.x, currentCoords.y]);

  // Emit player movement
  const emitMove = (x: number, y: number) => {
    socketRef.current?.emit('player-move', { x, y });
  };

  // Emit chat message
  const emitChat = (message: string) => {
    socketRef.current?.emit('chat-message', { message });
  };

  // Emit module creation
  const emitModuleCreate = (module: Module) => {
    socketRef.current?.emit('module-create', module);
  };

  // Emit module update
  const emitModuleUpdate = (module: Module) => {
    socketRef.current?.emit('module-update', module);
  };

  // Emit module deletion
  const emitModuleDelete = (moduleId: string) => {
    socketRef.current?.emit('module-delete', moduleId);
  };

  // Emit avatar update
  const emitAvatarUpdate = (avatar: Avatar) => {
    socketRef.current?.emit('avatar-update', avatar);
  };

  return {
    isConnected,
    emitMove,
    emitChat,
    emitModuleCreate,
    emitModuleUpdate,
    emitModuleDelete,
    emitAvatarUpdate,
  };
}
