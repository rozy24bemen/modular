import { useState, useEffect } from 'react';
import { WorldCanvas } from './components/WorldCanvas';
import { ModuleEditor } from './components/ModuleEditor';
import { ChatPanel } from './components/ChatPanel';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { NavigationPanel } from './components/NavigationPanel';
import { Toolbar } from './components/Toolbar';
import { Hammer, Users } from 'lucide-react';

export type Mode = 'explore' | 'build';
export type Shape = 'square' | 'circle' | 'triangle';
export type BehaviorType = 'none' | 'teleport' | 'button' | 'platform' | 'message';

export interface Module {
  id: string;
  x: number;
  y: number;
  shape: Shape;
  size: number;
  color: string;
  behavior: BehaviorType;
  behaviorData?: any;
}

export interface Avatar {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  headShape: Shape;
  isPlayer?: boolean;
  chatBubble?: {
    message: string;
    timestamp: number;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface RoomCoords {
  x: number;
  y: number;
}

export default function App() {
  const [mode, setMode] = useState<Mode>('explore');
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  
  // World coordinates
  const [currentCoords, setCurrentCoords] = useState<RoomCoords>({ x: 0, y: 0 });
  
  // Player avatar
  const [playerAvatar, setPlayerAvatar] = useState<Avatar>({
    id: 'player',
    name: 'Tú',
    x: 400,
    y: 300,
    color: '#3b82f6',
    headShape: 'circle',
    isPlayer: true,
  });

  // Other avatars in the room
  const [otherAvatars, setOtherAvatars] = useState<Avatar[]>([
    {
      id: 'user1',
      name: 'Player1',
      x: 300,
      y: 200,
      color: '#ef4444',
      headShape: 'square',
    },
    {
      id: 'user2',
      name: 'Builder99',
      x: 500,
      y: 400,
      color: '#10b981',
      headShape: 'triangle',
    },
  ]);

  // Modules placed in the world (stored per room coords)
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      x: 200,
      y: 200,
      shape: 'square',
      size: 50,
      color: '#8b5cf6',
      behavior: 'button',
    },
    {
      id: '2',
      x: 600,
      y: 300,
      shape: 'circle',
      size: 40,
      color: '#f59e0b',
      behavior: 'teleport',
    },
  ]);

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Player1',
      message: '¡Hola! Bienvenido a la plaza',
      timestamp: Date.now() - 60000,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Builder99',
      message: 'Mira lo que construí!',
      timestamp: Date.now() - 30000,
    },
  ]);

  // Initialize responsive positions on mount
  useEffect(() => {
    const canvas = document.querySelector('.world-canvas-container');
    if (canvas) {
      const centerX = canvas.clientWidth / 2;
      const centerY = canvas.clientHeight / 2;
      
      // Center player avatar
      setPlayerAvatar(prev => ({ ...prev, x: centerX, y: centerY }));
      
      // Position other avatars relative to center
      setOtherAvatars([
        {
          id: 'user1',
          name: 'Player1',
          x: centerX - 100,
          y: centerY - 100,
          color: '#ef4444',
          headShape: 'square',
        },
        {
          id: 'user2',
          name: 'Builder99',
          x: centerX + 100,
          y: centerY + 100,
          color: '#10b981',
          headShape: 'triangle',
        },
      ]);
      
      // Position modules relative to center
      setModules([
        {
          id: '1',
          x: centerX - 200,
          y: centerY - 100,
          shape: 'square',
          size: 50,
          color: '#8b5cf6',
          behavior: 'button',
        },
        {
          id: '2',
          x: centerX + 200,
          y: centerY,
          shape: 'circle',
          size: 40,
          color: '#f59e0b',
          behavior: 'teleport',
        },
      ]);
    }
  }, []);

  // Clear chat bubbles after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Clear player bubble
      if (playerAvatar.chatBubble && now - playerAvatar.chatBubble.timestamp > 5000) {
        setPlayerAvatar(prev => ({ ...prev, chatBubble: undefined }));
      }
      
      // Clear other avatars bubbles
      setOtherAvatars(prev => prev.map(avatar => {
        if (avatar.chatBubble && now - avatar.chatBubble.timestamp > 5000) {
          return { ...avatar, chatBubble: undefined };
        }
        return avatar;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [playerAvatar.chatBubble]);

  const getRoomName = (coords: RoomCoords): string => {
    if (coords.x === 0 && coords.y === 0) return 'Plaza Central';
    if (coords.x === 1 && coords.y === 0) return 'Zona Creativa';
    if (coords.x === -1 && coords.y === 0) return 'Sala de Juegos';
    if (coords.x === 0 && coords.y === 1) return 'Jardín Sur';
    if (coords.x === 0 && coords.y === -1) return 'Montañas Norte';
    return `Sala (${coords.x}, ${coords.y})`;
  };

  const handleModeToggle = () => {
    setMode(mode === 'explore' ? 'build' : 'explore');
    setSelectedModule(null);
  };

  const handleAddModule = (x: number, y: number) => {
    const newModule: Module = {
      id: Date.now().toString(),
      x,
      y,
      shape: 'square',
      size: 40,
      color: '#3b82f6',
      behavior: 'none',
    };
    setModules([...modules, newModule]);
    setSelectedModule(newModule);
  };

  const handleUpdateModule = (updatedModule: Module) => {
    setModules(modules.map(m => m.id === updatedModule.id ? updatedModule : m));
    setSelectedModule(updatedModule);
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    setSelectedModule(null);
  };

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'player',
      userName: playerAvatar.name,
      message,
      timestamp: Date.now(),
    };
    setChatMessages([...chatMessages, newMessage]);
    
    // Add chat bubble to player avatar
    setPlayerAvatar({
      ...playerAvatar,
      chatBubble: {
        message,
        timestamp: Date.now(),
      },
    });

    // Simulate other players responding
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const responder = otherAvatars[Math.floor(Math.random() * otherAvatars.length)];
        const responses = ['jaja!', '¡Genial!', 'Me gusta 👍', '¿En serio?', 'Wow'];
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: responder.id,
          userName: responder.name,
          message: response,
          timestamp: Date.now(),
        };
        setChatMessages(prev => [...prev, responseMsg]);
        
        setOtherAvatars(prev => prev.map(a => 
          a.id === responder.id 
            ? { ...a, chatBubble: { message: response, timestamp: Date.now() } }
            : a
        ));
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleMoveAvatar = (x: number, y: number) => {
    setPlayerAvatar({ ...playerAvatar, x, y });
  };

  const handleCheckRoomTransition = (x: number, y: number) => {
    // Get dynamic canvas size
    const canvas = document.querySelector('.world-canvas-container');
    if (!canvas) return;
    
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const edgeThreshold = 20; // Match the visual border

    let newCoords = { ...currentCoords };
    let newX = x;
    let newY = y;
    let shouldTransition = false;

    // Right edge
    if (x > canvasWidth - edgeThreshold) {
      newCoords.x += 1;
      newX = edgeThreshold + 10;
      shouldTransition = true;
    } 
    // Left edge
    else if (x < edgeThreshold) {
      newCoords.x -= 1;
      newX = canvasWidth - edgeThreshold - 10;
      shouldTransition = true;
    } 
    // Top edge
    else if (y < edgeThreshold) {
      newCoords.y -= 1;
      newY = canvasHeight - edgeThreshold - 10;
      shouldTransition = true;
    } 
    // Bottom edge
    else if (y > canvasHeight - edgeThreshold) {
      newCoords.y += 1;
      newY = edgeThreshold + 10;
      shouldTransition = true;
    }

    if (shouldTransition) {
      handleRoomChange(newCoords, newX, newY);
    }
  };

  const handleRoomChange = (newCoords: RoomCoords, newX: number, newY: number) => {
    setCurrentCoords(newCoords);
    setPlayerAvatar({ ...playerAvatar, x: newX, y: newY });
    
    // Get canvas dimensions for responsive positioning
    const canvas = document.querySelector('.world-canvas-container');
    const centerX = canvas ? canvas.clientWidth / 2 : 400;
    const centerY = canvas ? canvas.clientHeight / 2 : 300;
    
    // Load different content based on room
    // In a real app, this would load from a database
    if (newCoords.x === 0 && newCoords.y === 0) {
      // Plaza Central - populated
      setOtherAvatars([
        { id: 'user1', name: 'Player1', x: centerX - 100, y: centerY - 100, color: '#ef4444', headShape: 'square' },
        { id: 'user2', name: 'Builder99', x: centerX + 100, y: centerY + 100, color: '#10b981', headShape: 'triangle' },
      ]);
      setModules([
        { id: '1', x: centerX - 200, y: centerY - 100, shape: 'square', size: 50, color: '#8b5cf6', behavior: 'button' },
        { id: '2', x: centerX + 200, y: centerY, shape: 'circle', size: 40, color: '#f59e0b', behavior: 'teleport' },
      ]);
    } else if (newCoords.x === 1 && newCoords.y === 0) {
      // Zona Creativa
      setOtherAvatars([
        { id: 'user3', name: 'Artist22', x: centerX, y: centerY, color: '#a855f7', headShape: 'circle' },
      ]);
      setModules([
        { id: '3', x: centerX - 150, y: centerY - 150, shape: 'triangle', size: 60, color: '#ec4899', behavior: 'none' },
        { id: '4', x: centerX, y: centerY + 100, shape: 'square', size: 80, color: '#14b8a6', behavior: 'platform' },
      ]);
    } else {
      // Empty or new room
      setOtherAvatars([]);
      setModules([]);
    }
    
    setSelectedModule(null);
  };

  const handleNavigateToRoom = (coords: RoomCoords) => {
    // Get canvas dimensions for centering avatar
    const canvas = document.querySelector('.world-canvas-container');
    const centerX = canvas ? canvas.clientWidth / 2 : 400;
    const centerY = canvas ? canvas.clientHeight / 2 : 300;
    
    setCurrentCoords(coords);
    setPlayerAvatar({ ...playerAvatar, x: centerX, y: centerY });
    handleRoomChange(coords, centerX, centerY);
    setShowNavigation(false);
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-white">{getRoomName(currentCoords)}</h1>
            <p className="text-slate-400 text-xs">Coordenadas: ({currentCoords.x}, {currentCoords.y})</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNavigation(!showNavigation)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Users size={16} />
            Salas
          </button>
          <button
            onClick={() => setShowAvatarCustomizer(!showAvatarCustomizer)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            👤 Avatar
          </button>
          <button
            onClick={handleModeToggle}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              mode === 'build'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <Hammer size={16} />
            {mode === 'build' ? 'Modo Construcción' : 'Modo Exploración'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* World Canvas */}
        <div className="flex-1 relative world-canvas-container">
          <WorldCanvas
            mode={mode}
            playerAvatar={playerAvatar}
            otherAvatars={otherAvatars}
            modules={modules}
            selectedModule={selectedModule}
            onSelectModule={setSelectedModule}
            onAddModule={handleAddModule}
            onMoveAvatar={handleMoveAvatar}
            onCheckRoomTransition={handleCheckRoomTransition}
          />
          
          {mode === 'build' && (
            <Toolbar
              onDeleteModule={() => selectedModule && handleDeleteModule(selectedModule.id)}
              hasSelection={selectedModule !== null}
            />
          )}
        </div>

        {/* Right Sidebar - Module Editor (Build Mode) */}
        {mode === 'build' && (
          <ModuleEditor
            selectedModule={selectedModule}
            onUpdateModule={handleUpdateModule}
          />
        )}

        {/* Chat Panel */}
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Overlays */}
      {showAvatarCustomizer && (
        <AvatarCustomizer
          avatar={playerAvatar}
          onUpdate={setPlayerAvatar}
          onClose={() => setShowAvatarCustomizer(false)}
        />
      )}

      {showNavigation && (
        <NavigationPanel
          currentRoom={getRoomName(currentCoords)}
          currentCoords={currentCoords}
          onSelectRoom={handleNavigateToRoom}
          onClose={() => setShowNavigation(false)}
        />
      )}
    </div>
  );
}