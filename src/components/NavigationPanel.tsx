import { X, Users, Lock, Globe, Home, Sparkles, Map } from 'lucide-react';
import type { RoomCoords } from '../App';

interface Room {
  id: string;
  name: string;
  coords: RoomCoords;
  type: 'public' | 'private' | 'personal';
  players: number;
  maxPlayers: number;
  description: string;
}

interface NavigationPanelProps {
  currentRoom: string;
  currentCoords: RoomCoords;
  onSelectRoom: (coords: RoomCoords) => void;
  onClose: () => void;
}

export function NavigationPanel({ currentRoom, currentCoords, onSelectRoom, onClose }: NavigationPanelProps) {
  const rooms: Room[] = [
    {
      id: '1',
      name: 'Plaza Central',
      coords: { x: 0, y: 0 },
      type: 'public',
      players: 47,
      maxPlayers: 100,
      description: 'El hub principal donde todos se encuentran',
    },
    {
      id: '2',
      name: 'Zona Creativa',
      coords: { x: 1, y: 0 },
      type: 'public',
      players: 23,
      maxPlayers: 50,
      description: 'Espacio colaborativo para construir juntos',
    },
    {
      id: '3',
      name: 'Sala de Juegos',
      coords: { x: -1, y: 0 },
      type: 'public',
      players: 15,
      maxPlayers: 50,
      description: 'Mini-juegos creados por la comunidad',
    },
    {
      id: '4',
      name: 'Jardín Sur',
      coords: { x: 0, y: 1 },
      type: 'personal',
      players: 3,
      maxPlayers: 20,
      description: 'Espacio tranquilo al sur de la plaza',
    },
    {
      id: '5',
      name: 'Montañas Norte',
      coords: { x: 0, y: -1 },
      type: 'private',
      players: 5,
      maxPlayers: 10,
      description: 'Sala privada - Solo por invitación',
    },
  ];

  const getIcon = (type: Room['type']) => {
    switch (type) {
      case 'public':
        return <Globe size={18} className="text-blue-400" />;
      case 'private':
        return <Lock size={18} className="text-orange-400" />;
      case 'personal':
        return <Home size={18} className="text-purple-400" />;
    }
  };

  const getTypeLabel = (type: Room['type']) => {
    switch (type) {
      case 'public':
        return 'Pública';
      case 'private':
        return 'Privada';
      case 'personal':
        return 'Personal';
    }
  };

  // Generate grid map
  const gridSize = 5; // 5x5 grid centered on player
  const gridCells = [];
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      const cellCoords = { x: currentCoords.x + x, y: currentCoords.y + y };
      const room = rooms.find(r => r.coords.x === cellCoords.x && r.coords.y === cellCoords.y);
      const isCurrent = cellCoords.x === currentCoords.x && cellCoords.y === currentCoords.y;
      
      gridCells.push({
        coords: cellCoords,
        room,
        isCurrent,
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-white flex items-center gap-2">
              <Map size={20} className="text-purple-400" />
              Mapa del Mundo
            </h2>
            <p className="text-slate-400 text-sm mt-1">Navega por el mundo usando coordenadas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex gap-6">
          {/* Grid Map */}
          <div className="flex-shrink-0">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <h3 className="text-white mb-3 text-sm">Mapa de Coordenadas</h3>
              <div className="grid grid-cols-5 gap-2">
                {gridCells.map((cell, idx) => {
                  const { coords, room, isCurrent } = cell;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectRoom(coords)}
                      className={`w-16 h-16 rounded-lg border-2 transition-all relative ${
                        isCurrent
                          ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
                          : room
                          ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                      title={room ? room.name : `Sala (${coords.x}, ${coords.y})`}
                    >
                      {/* Coordinate label */}
                      <div className="absolute top-0.5 left-1 text-[8px] text-slate-500">
                        {coords.x},{coords.y}
                      </div>
                      
                      {/* Room info */}
                      {room && (
                        <div className="flex flex-col items-center justify-center h-full">
                          {getIcon(room.type)}
                          <div className="text-[9px] text-slate-300 mt-1 text-center px-1 truncate w-full">
                            {room.name.split(' ')[0]}
                          </div>
                        </div>
                      )}
                      
                      {/* Empty room */}
                      {!room && (
                        <div className="flex items-center justify-center h-full text-slate-700 text-xs">
                          ?
                        </div>
                      )}
                      
                      {/* Current position indicator */}
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span>Tu ubicación actual</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 bg-slate-700 rounded"></div>
                  <span>Sala con contenido</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 bg-slate-900 border border-slate-800 rounded"></div>
                  <span>Sala vacía</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 space-y-3">
            <h3 className="text-white text-sm mb-3">Salas Destacadas</h3>
            {rooms.map((room) => {
              const isCurrent = room.name === currentRoom;
              const isFull = room.players >= room.maxPlayers;
              
              return (
                <button
                  key={room.id}
                  onClick={() => !isCurrent && !isFull && onSelectRoom(room.coords)}
                  disabled={isCurrent || isFull}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-purple-600 border-purple-500'
                      : isFull
                      ? 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'
                      : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getIcon(room.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white">{room.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-900/50 rounded text-xs text-slate-400">
                            ({room.coords.x}, {room.coords.y})
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white">
                              Actual
                            </span>
                          )}
                          {isFull && (
                            <span className="px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-400">
                              Llena
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{room.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-500">{getTypeLabel(room.type)}</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Users size={12} />
                            {room.players}/{room.maxPlayers}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Player count indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
                        <div>
                          <div className="text-white text-center text-sm">{room.players}</div>
                          <div className="text-slate-500 text-xs text-center">online</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            
            {/* Create Room */}
            <div className="pt-3">
              <button className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white transition-all flex items-center justify-center gap-2">
                <Sparkles size={18} />
                Crear Nueva Sala
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </div>
              <span>142 jugadores en línea</span>
            </div>
            <div className="text-slate-400">
              Click en el mapa para viajar instantáneamente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}