import { useState, useEffect } from 'react';
import { WorldCanvas } from './components/WorldCanvas';
import { ModuleEditor } from './components/ModuleEditor';
import { ChatPanel } from './components/ChatPanel';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { NavigationPanel } from './components/NavigationPanel';
import { Toolbar } from './components/Toolbar';
import { AuthDialog } from './components/AuthDialog';
import { MigrationAlert } from './components/MigrationAlert';
import { Hammer, Users, Wifi, WifiOff, LogIn, LogOut } from 'lucide-react';
import { useMultiplayer } from './hooks/useMultiplayer';
import { useAuth } from './contexts/AuthContext';
import { Button } from './components/ui/button';

export type Mode = 'explore' | 'build';
export type Shape = 'square' | 'circle' | 'triangle';
export type BehaviorType = 'none' | 'teleport' | 'button' | 'platform' | 'message';

export interface Module {
  id: string;
  x: number;
  y: number;
  shape: Shape;
  size: number;
  width: number;  // Width for resizing
  height: number; // Height for resizing
  color: string;
  behavior: BehaviorType;
  behaviorData?: any;
  createdBy?: string; // User ID who created it
  isDraft?: boolean;  // True while being edited, false when confirmed
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
  const { profile, isGuest, loading, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('explore');
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // World coordinates
  const [currentCoords, setCurrentCoords] = useState<RoomCoords>({ x: 0, y: 0 });
  
  // Player avatar (initialized from profile)
  const [playerAvatar, setPlayerAvatar] = useState<Avatar>({
    id: profile?.id || 'player',
    name: profile?.username || 'Tú',
    x: 400,
    y: 300,
    color: profile?.avatar_color || '#3b82f6',
    headShape: (profile?.avatar_shape as Shape) || 'circle',
    isPlayer: true,
  });

  // Update player avatar when profile changes
  useEffect(() => {
    if (profile) {
      setPlayerAvatar(prev => ({
        ...prev,
        id: profile.id,
        name: profile.username,
        color: profile.avatar_color,
        headShape: profile.avatar_shape as Shape,
      }));
    }
  }, [profile]);

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

  // Modules placed in the world (loaded from database)
  const [modules, setModules] = useState<Module[]>([]);

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [draftModule, setDraftModule] = useState<Module | null>(null); // Module being built (not confirmed yet)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copiedModule, setCopiedModule] = useState<Module | null>(null); // Clipboard for copy/paste

  // Multiplayer hook
  const {
    isConnected,
    emitMove,
    emitChat,
    emitModuleCreate,
    emitModuleUpdate,
    emitModuleDelete,
    emitAvatarUpdate,
  } = useMultiplayer({
    playerAvatar,
    currentCoords,
    userId: profile?.id || 'guest',
    onPlayersUpdate: setOtherAvatars,
    onModulesUpdate: setModules,
    onChatMessage: (message) => {
      setChatMessages(prev => [...prev, message]);
    },
  });

  // Initialize player position
  useEffect(() => {
    // Fixed world dimensions: 800x600
    const centerX = 400;
    const centerY = 300;
    
    // Center player avatar
    setPlayerAvatar(prev => ({ ...prev, x: centerX, y: centerY }));
  }, []);

  // Migrate old modules to have width/height if they don't
  useEffect(() => {
    setModules(prevModules => 
      prevModules.map(m => ({
        ...m,
        width: m.width || m.size,
        height: m.height || m.size,
      }))
    );
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + C: Copy selected module to clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedModule && !draftModule) {
        e.preventDefault();
        setCopiedModule(selectedModule);
        console.log('📋 Module copied to clipboard');
      }

      // Ctrl/Cmd + V: Paste module from clipboard (replaces existing draft)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedModule) {
        e.preventDefault();
        const pastedModule: Module = {
          ...copiedModule,
          id: crypto.randomUUID(),
          x: copiedModule.x + 50, // Offset paste
          y: copiedModule.y + 50,
          isDraft: true,
        };
        setDraftModule(pastedModule); // Replaces existing draft if any
        console.log('📌 Module pasted, adjust position and confirm');
      }

      // Delete/Backspace: Delete selected module
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedModule && mode === 'build') {
        e.preventDefault();
        handleDeleteModule(selectedModule.id);
      }

      // Escape: Cancel draft or deselect
      if (e.key === 'Escape') {
        if (draftModule) {
          setDraftModule(null);
          console.log('❌ Draft cancelled');
        } else if (selectedModule) {
          setSelectedModule(null);
        }
      }

      // Enter: Confirm draft
      if (e.key === 'Enter' && draftModule) {
        e.preventDefault();
        handleConfirmModule();
      }

      // B: Toggle build mode
      if (e.key === 'b' && !draftModule) {
        handleModeToggle();
      }

      // ? or /: Toggle shortcuts help
      if ((e.key === '?' || e.key === '/') && !draftModule) {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModule, draftModule, modules, mode, showShortcuts, copiedModule]);

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
    setDraftModule(null); // Clear draft when switching modes
  };

  const handleAddModule = (x: number, y: number) => {
    const width = 60;
    const height = 60;
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    // Clamp position to canvas bounds to prevent out-of-bounds creation
    const clampedX = Math.max(width / 2, Math.min(canvasWidth - width / 2, x));
    const clampedY = Math.max(height / 2, Math.min(canvasHeight - height / 2, y));
    
    const newModule: Module = {
      id: crypto.randomUUID(), // Generate valid UUID
      x: clampedX,
      y: clampedY,
      shape: 'square',
      size: 40,
      width,
      height,
      color: '#3b82f6',
      behavior: 'none',
      createdBy: profile?.id || 'guest',
      isDraft: true, // Mark as draft - not confirmed yet
    };
    // Set as draft module for editing (not added to modules yet)
    setDraftModule(newModule);
    setSelectedModule(newModule);
  };

  const handleUpdateModule = (updatedModule: Module) => {
    // If it's a draft module, update the draft state
    if (updatedModule.isDraft) {
      setDraftModule(updatedModule);
      setSelectedModule(updatedModule);
    } else {
      // Otherwise update the confirmed modules
      setModules(modules.map(m => m.id === updatedModule.id ? updatedModule : m));
      setSelectedModule(updatedModule);
      
      // Emit to multiplayer server
      emitModuleUpdate(updatedModule);
    }
  };

  const handleConfirmModule = () => {
    if (!draftModule) {
      console.warn('⚠️ No draft module to confirm');
      return;
    }
    
    console.log('✅ Confirming module:', draftModule.id);
    
    // Remove draft flag and add to confirmed modules
    const confirmedModule = { ...draftModule, isDraft: false };
    setModules([...modules, confirmedModule]);
    
    // Clear draft state
    setDraftModule(null);
    setSelectedModule(null);
    
    // Emit to multiplayer server for real-time sync
    console.log('📡 Emitting module to server...');
    emitModuleCreate(confirmedModule);
  };

  const handleCancelModule = () => {
    // Simply discard the draft module
    setDraftModule(null);
    setSelectedModule(null);
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    setSelectedModule(null);
    
    // Emit to multiplayer server
    emitModuleDelete(id);
  };

  const handleSendMessage = (message: string) => {
    // Emit to multiplayer server
    emitChat(message);
    
    // Add chat bubble to player avatar
    setPlayerAvatar({
      ...playerAvatar,
      chatBubble: {
        message,
        timestamp: Date.now(),
      },
    });
  };

  const handleMoveAvatar = (x: number, y: number) => {
    setPlayerAvatar({ ...playerAvatar, x, y });
    
    // Emit to multiplayer server
    emitMove(x, y);
  };

  const handleCheckRoomTransition = (x: number, y: number) => {
    // Fixed world dimensions for multiplayer consistency
    const WORLD_WIDTH = 800;
    const WORLD_HEIGHT = 600;
    const edgeThreshold = 20; // Match the visual border

    let newCoords = { ...currentCoords };
    let newX = x;
    let newY = y;
    let shouldTransition = false;

    // Right edge
    if (x > WORLD_WIDTH - edgeThreshold) {
      newCoords.x += 1;
      newX = edgeThreshold + 10;
      shouldTransition = true;
    } 
    // Left edge
    else if (x < edgeThreshold) {
      newCoords.x -= 1;
      newX = WORLD_WIDTH - edgeThreshold - 10;
      shouldTransition = true;
    } 
    // Top edge
    else if (y < edgeThreshold) {
      newCoords.y -= 1;
      newY = WORLD_HEIGHT - edgeThreshold - 10;
      shouldTransition = true;
    } 
    // Bottom edge
    else if (y > WORLD_HEIGHT - edgeThreshold) {
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
    
    // Fixed world dimensions for multiplayer consistency
    const centerX = 400;
    const centerY = 300;
    
    // Load different content based on room
    // In a real app, this would load from a database
    if (newCoords.x === 0 && newCoords.y === 0) {
      // Plaza Central - populated
      setOtherAvatars([
        { id: 'user1', name: 'Player1', x: 300, y: 200, color: '#ef4444', headShape: 'square' },
        { id: 'user2', name: 'Builder99', x: 500, y: 400, color: '#10b981', headShape: 'triangle' },
      ]);
      setModules([
        { id: '1', x: 200, y: 200, shape: 'square', size: 50, color: '#8b5cf6', behavior: 'button' },
        { id: '2', x: 600, y: 300, shape: 'circle', size: 40, color: '#f59e0b', behavior: 'teleport' },
      ]);
    } else if (newCoords.x === 1 && newCoords.y === 0) {
      // Zona Creativa
      setOtherAvatars([
        { id: 'user3', name: 'Artist22', x: 400, y: 300, color: '#a855f7', headShape: 'circle' },
      ]);
      setModules([
        { id: '3', x: 250, y: 150, shape: 'triangle', size: 60, color: '#ec4899', behavior: 'none' },
        { id: '4', x: 400, y: 400, shape: 'square', size: 80, color: '#14b8a6', behavior: 'platform' },
      ]);
    } else {
      // Empty or new room
      setOtherAvatars([]);
      setModules([]);
    }
    
    setSelectedModule(null);
  };

  const handleNavigateToRoom = (coords: RoomCoords) => {
    // Fixed world center for multiplayer consistency
    const centerX = 400;
    const centerY = 300;
    
    setCurrentCoords(coords);
    setPlayerAvatar({ ...playerAvatar, x: centerX, y: centerY });
    handleRoomChange(coords, centerX, centerY);
    setShowNavigation(false);
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Migration Alert */}
      <MigrationAlert />
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
          {/* Connection status */}
          <div className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
            isConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
          
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
            draftModule={draftModule}
            selectedModule={selectedModule}
            onSelectModule={setSelectedModule}
            onAddModule={handleAddModule}
            onMoveAvatar={handleMoveAvatar}
            onCheckRoomTransition={handleCheckRoomTransition}
            onUpdateModule={handleUpdateModule}
            onConfirmModule={handleConfirmModule}
            onCancelModule={handleCancelModule}
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
      </div>

      {/* Chat Panel - Floating */}
      <ChatPanel
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => setShowShortcuts(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">⌨️ Atajos de Teclado</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Copiar módulo</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200">Ctrl+C</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Pegar módulo</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200">Ctrl+V</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Eliminar módulo</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200">Del / Backspace</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Confirmar módulo</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200">Enter / ✓ verde</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Cancelar módulo draft</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200">Click derecho / Esc</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Cambiar modo</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200">B</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Ver/ocultar atajos</span>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-200">?</kbd>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">Los atajos no funcionan mientras escribes en el chat</p>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-6 left-6 bg-slate-700/80 hover:bg-slate-600 text-slate-300 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-40"
        title="Ver atajos de teclado (?)"
      >
        <span className="text-lg">⌨️</span>
      </button>

      {/* Clipboard indicator */}
      {copiedModule && (
        <div className="fixed bottom-20 left-6 bg-green-600/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg z-40 flex items-center gap-2">
          <span>📋</span>
          <span>Módulo copiado - Ctrl+V para pegar</span>
          <button 
            onClick={() => setCopiedModule(null)}
            className="ml-2 hover:bg-white/20 rounded px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overlays */}
      {showAvatarCustomizer && (
        <AvatarCustomizer
          avatar={playerAvatar}
          onUpdate={(updatedAvatar) => {
            setPlayerAvatar(updatedAvatar);
            emitAvatarUpdate(updatedAvatar);
          }}
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

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

      {/* Auth Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        {isGuest ? (
          <Button
            onClick={() => setShowAuthDialog(true)}
            variant="outline"
            className="bg-slate-800/90 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700"
          >
            <LogIn size={16} className="mr-2" />
            Iniciar Sesión
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 px-3 py-2 rounded-lg text-white text-sm">
              <Users size={14} className="inline mr-1" />
              {profile?.username}
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="bg-slate-800/90 backdrop-blur-sm border-slate-600 text-white hover:bg-slate-700"
            >
              <LogOut size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}