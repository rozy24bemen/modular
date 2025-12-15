import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Mode, Module, Avatar } from '../App';

interface WorldCanvasProps {
  mode: Mode;
  playerAvatar: Avatar;
  otherAvatars: Avatar[];
  modules: Module[];
  selectedModule: Module | null;
  onSelectModule: (module: Module | null) => void;
  onAddModule: (x: number, y: number) => void;
  onMoveAvatar: (x: number, y: number) => void;
  onCheckRoomTransition: (x: number, y: number) => void;
}

export function WorldCanvas({
  mode,
  playerAvatar,
  otherAvatars,
  modules,
  selectedModule,
  onSelectModule,
  onAddModule,
  onMoveAvatar,
  onCheckRoomTransition,
}: WorldCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Update canvas size on resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Keyboard movement
  useEffect(() => {
    if (mode !== 'explore') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode]);

  // Movement loop for both WASD and click-to-move
  useEffect(() => {
    if (mode !== 'explore') return;

    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;
      const speed = 4;

      // WASD movement
      if (keys.has('w') || keys.has('arrowup')) dy -= speed;
      if (keys.has('s') || keys.has('arrowdown')) dy += speed;
      if (keys.has('a') || keys.has('arrowleft')) dx -= speed;
      if (keys.has('d') || keys.has('arrowright')) dx += speed;

      // Click-to-move
      if (targetPosition && keys.size === 0) {
        const distX = targetPosition.x - playerAvatar.x;
        const distY = targetPosition.y - playerAvatar.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance > 5) {
          // Normalize and apply speed
          dx = (distX / distance) * speed;
          dy = (distY / distance) * speed;
        } else {
          // Reached target
          setTargetPosition(null);
        }
      }

      if (dx !== 0 || dy !== 0) {
        const newX = playerAvatar.x + dx;
        const newY = playerAvatar.y + dy;
        onMoveAvatar(newX, newY);
        onCheckRoomTransition(newX, newY);
      }
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(interval);
  }, [mode, keys, playerAvatar, targetPosition, onMoveAvatar, onCheckRoomTransition]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'build') {
      // Check if clicking on existing module
      const clickedModule = modules.find(m => {
        const distance = Math.sqrt(Math.pow(x - m.x, 2) + Math.pow(y - m.y, 2));
        return distance < m.size / 2 + 10;
      });

      if (clickedModule) {
        onSelectModule(clickedModule);
      } else {
        onAddModule(x, y);
      }
    } else {
      // Explore mode - click to move to position
      setTargetPosition({ x, y });
    }
  };

  const renderModule = (module: Module) => {
    const isSelected = selectedModule?.id === module.id;
    
    let path = '';
    switch (module.shape) {
      case 'square':
        const half = module.size / 2;
        return (
          <rect
            key={module.id}
            x={module.x - half}
            y={module.y - half}
            width={module.size}
            height={module.size}
            fill={module.color}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={isSelected ? 3 : 1}
            className="transition-all cursor-pointer"
          />
        );
      case 'circle':
        return (
          <circle
            key={module.id}
            cx={module.x}
            cy={module.y}
            r={module.size / 2}
            fill={module.color}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={isSelected ? 3 : 1}
            className="transition-all cursor-pointer"
          />
        );
      case 'triangle':
        const size = module.size;
        const height = (Math.sqrt(3) / 2) * size;
        path = `M ${module.x},${module.y - height / 2} L ${module.x + size / 2},${module.y + height / 2} L ${module.x - size / 2},${module.y + height / 2} Z`;
        return (
          <path
            key={module.id}
            d={path}
            fill={module.color}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={isSelected ? 3 : 1}
            className="transition-all cursor-pointer"
          />
        );
    }
  };

  const renderAvatar = (avatar: Avatar) => {
    const isHovered = hoveredAvatar === avatar.id;
    const hasChatBubble = avatar.chatBubble && (Date.now() - avatar.chatBubble.timestamp < 5000);
    
    return (
      <g
        key={avatar.id}
        onMouseEnter={() => setHoveredAvatar(avatar.id)}
        onMouseLeave={() => setHoveredAvatar(null)}
      >
        {/* Chat bubble */}
        {hasChatBubble && (
          <g>
            {/* Bubble background */}
            <rect
              x={avatar.x - 50}
              y={avatar.y - 60}
              width={100}
              height={40}
              rx={8}
              fill="white"
              stroke="#e2e8f0"
              strokeWidth={2}
            />
            {/* Bubble tail */}
            <path
              d={`M ${avatar.x - 5},${avatar.y - 20} L ${avatar.x},${avatar.y - 12} L ${avatar.x + 5},${avatar.y - 20} Z`}
              fill="white"
            />
            {/* Message text */}
            <text
              x={avatar.x}
              y={avatar.y - 35}
              textAnchor="middle"
              fill="#1e293b"
              fontSize="11"
              className="select-none"
            >
              {avatar.chatBubble.message.length > 18 
                ? avatar.chatBubble.message.substring(0, 18) + '...'
                : avatar.chatBubble.message}
            </text>
          </g>
        )}
        
        {/* Shadow */}
        <ellipse
          cx={avatar.x}
          cy={avatar.y + 20}
          rx={12}
          ry={4}
          fill="rgba(0,0,0,0.3)"
        />
        
        {/* Body */}
        <rect
          x={avatar.x - 8}
          y={avatar.y}
          width={16}
          height={20}
          rx={4}
          fill={avatar.color}
          opacity={0.8}
        />
        
        {/* Head */}
        {avatar.headShape === 'circle' && (
          <circle
            cx={avatar.x}
            cy={avatar.y - 8}
            r={10}
            fill={avatar.color}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
        {avatar.headShape === 'square' && (
          <rect
            x={avatar.x - 10}
            y={avatar.y - 18}
            width={20}
            height={20}
            rx={2}
            fill={avatar.color}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
        {avatar.headShape === 'triangle' && (
          <path
            d={`M ${avatar.x},${avatar.y - 18} L ${avatar.x + 10},${avatar.y + 2} L ${avatar.x - 10},${avatar.y + 2} Z`}
            fill={avatar.color}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
        
        {/* Name tag */}
        {(isHovered || avatar.isPlayer) && !hasChatBubble && (
          <>
            <rect
              x={avatar.x - 30}
              y={avatar.y - 40}
              width={60}
              height={18}
              rx={9}
              fill="rgba(0,0,0,0.7)"
            />
            <text
              x={avatar.x}
              y={avatar.y - 28}
              textAnchor="middle"
              fill="#fff"
              fontSize="12"
            >
              {avatar.name}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="w-full h-full bg-slate-800 relative cursor-crosshair"
      style={{
        backgroundImage: `
          linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      <svg className="w-full h-full">
        {/* Room boundaries with visible borders */}
        <rect
          x={20}
          y={20}
          width={canvasSize.width - 40}
          height={canvasSize.height - 40}
          fill="none"
          stroke="rgba(139, 92, 246, 0.3)"
          strokeWidth={2}
          strokeDasharray="10 5"
        />
        
        {/* Edge indicators for room transitions */}
        <g opacity={0.5}>
          {/* Top edge */}
          <rect x={20} y={10} width={canvasSize.width - 40} height={10} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={canvasSize.width / 2} y={17} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10">↑</text>
          
          {/* Bottom edge */}
          <rect x={20} y={canvasSize.height - 20} width={canvasSize.width - 40} height={10} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={canvasSize.width / 2} y={canvasSize.height - 13} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10">↓</text>
          
          {/* Left edge */}
          <rect x={10} y={20} width={10} height={canvasSize.height - 40} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={15} y={canvasSize.height / 2} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10" transform={`rotate(-90 15 ${canvasSize.height / 2})`}>←</text>
          
          {/* Right edge */}
          <rect x={canvasSize.width - 20} y={20} width={10} height={canvasSize.height - 40} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={canvasSize.width - 15} y={canvasSize.height / 2} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10" transform={`rotate(-90 ${canvasSize.width - 15} ${canvasSize.height / 2})`}>→</text>
        </g>
        
        {/* Render modules */}
        {modules.map(renderModule)}
        
        {/* Render other avatars */}
        {otherAvatars.map(renderAvatar)}
        
        {/* Render player avatar with animation */}
        <motion.g
          animate={{ x: playerAvatar.x, y: playerAvatar.y }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {renderAvatar({ ...playerAvatar, x: 0, y: 0 })}
        </motion.g>
      </svg>

      {/* Mode indicator */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2">
        <p className="text-slate-300 text-sm">
          {mode === 'explore' ? (
            <>🚶 Usa <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">WASD</kbd> para moverte</>
          ) : (
            <>🔨 Click para crear módulos</>
          )}
        </p>
      </div>

      {/* Mini stats */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
        <div>👥 {otherAvatars.length + 1} jugadores</div>
        <div>🧱 {modules.length} módulos</div>
      </div>
    </div>
  );
}