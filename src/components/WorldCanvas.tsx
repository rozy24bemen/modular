import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Mode, Module, Avatar } from '../App';
import { DraftModuleEditor } from './DraftModuleEditor';

interface WorldCanvasProps {
  mode: Mode;
  playerAvatar: Avatar;
  otherAvatars: Avatar[];
  modules: Module[];
  draftModule: Module | null;
  selectedModule: Module | null;
  onSelectModule: (module: Module | null) => void;
  onAddModule: (x: number, y: number) => void;
  onMoveAvatar: (x: number, y: number) => void;
  onCheckRoomTransition: (x: number, y: number) => void;
  onUpdateModule: (module: Module) => void;
  onConfirmModule: () => void;
  onCancelModule: () => void;
}

export function WorldCanvas({
  mode,
  playerAvatar,
  otherAvatars,
  modules,
  draftModule,
  selectedModule,
  onSelectModule,
  onAddModule,
  onMoveAvatar,
  onCheckRoomTransition,
  onUpdateModule,
  onConfirmModule,
  onCancelModule,
}: WorldCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1); // Zoom level: 1 = normal, 2 = 2x zoom in, 0.5 = 2x zoom out
  const [viewBoxOffset, setViewBoxOffset] = useState({ x: 0, y: 0 }); // Offset for panning
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedModule, setLastClickedModule] = useState<string | null>(null);
  
  // Fixed world dimensions for consistent multiplayer experience
  const WORLD_WIDTH = 800;
  const WORLD_HEIGHT = 600;

  // Helper function to convert client coordinates to SVG coordinates (handles scaling/responsive)
  const clientToSVGCoords = (clientX: number, clientY: number): { x: number, y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;

    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    
    const svgPoint = point.matrixTransform(ctm.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

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

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Convert client coordinates to SVG coordinates (handles responsive scaling)
    const coords = clientToSVGCoords(e.clientX, e.clientY);
    if (!coords) return;

    const { x, y } = coords;
    const currentTime = Date.now();
    const isDoubleClick = currentTime - lastClickTime < 300;

    if (mode === 'build') {
      // Double-click anywhere with draft module - confirm if within bounds
      if (isDoubleClick && draftModule) {
        const halfWidth = draftModule.width / 2;
        const halfHeight = draftModule.height / 2;
        const isWithinBounds = 
          draftModule.x - halfWidth >= 0 &&
          draftModule.x + halfWidth <= WORLD_WIDTH &&
          draftModule.y - halfHeight >= 0 &&
          draftModule.y + halfHeight <= WORLD_HEIGHT;
        
        if (isWithinBounds) {
          onConfirmModule();
        }
        setLastClickTime(currentTime);
        return;
      }

      // Single click with draft module - move it to clicked position
      if (draftModule && !isDoubleClick) {
        onUpdateModule({ ...draftModule, x, y });
        setLastClickTime(currentTime);
        return;
      }

      // Ctrl+Click to select existing module
      if (e.ctrlKey || e.metaKey) {
        const clickedModule = modules.find(m => {
          const distance = Math.sqrt(Math.pow(x - m.x, 2) + Math.pow(y - m.y, 2));
          return distance < Math.max(m.width, m.height) / 2 + 10;
        });

        if (clickedModule) {
          onSelectModule(clickedModule);
          setLastClickedModule(clickedModule.id);
        }
      } else {
        // Regular click creates new module (not double click)
        if (!isDoubleClick) {
          onAddModule(x, y);
          setLastClickedModule(null);
        }
      }
      setLastClickTime(currentTime);
    } else {
      // Explore mode - click to move to position
      setTargetPosition({ x, y });
    }
  };

  const handleContextMenu = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault(); // Prevent default context menu
    
    // Right click cancels draft module
    if (draftModule) {
      onCancelModule();
      console.log('❌ Draft cancelled (right click)');
    }
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    
    const svg = svgRef.current;
    if (!svg) return;

    // Get mouse position in SVG coordinates before zoom
    const beforeZoom = clientToSVGCoords(e.clientX, e.clientY);
    if (!beforeZoom) return;

    // Calculate new zoom level (deltaY < 0 = zoom in, > 0 = zoom out)
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.5, Math.min(3, zoom * zoomFactor)); // Clamp between 0.5x and 3x
    
    if (newZoom === zoom) return; // Already at limit

    // Calculate viewBox dimensions based on zoom
    const newWidth = WORLD_WIDTH / newZoom;
    const newHeight = WORLD_HEIGHT / newZoom;

    // Adjust offset to keep mouse position constant
    // Calculate where the mouse should be after zoom
    const mouseXRatio = beforeZoom.x / WORLD_WIDTH;
    const mouseYRatio = beforeZoom.y / WORLD_HEIGHT;
    
    const newOffsetX = beforeZoom.x - (newWidth * mouseXRatio);
    const newOffsetY = beforeZoom.y - (newHeight * mouseYRatio);

    setZoom(newZoom);
    setViewBoxOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Middle mouse button (button 1)
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    // Convert pixel movement to viewBox units (accounting for zoom)
    const viewBoxDx = -dx / zoom;
    const viewBoxDy = -dy / zoom;

    setViewBoxOffset({
      x: viewBoxOffset.x + viewBoxDx,
      y: viewBoxOffset.y + viewBoxDy,
    });

    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1) {
      setIsPanning(false);
    }
  };

  const renderModule = (module: Module) => {
    const isSelected = selectedModule?.id === module.id;
    const halfWidth = module.width / 2;
    const halfHeight = module.height / 2;
    
    let path = '';
    switch (module.shape) {
      case 'square':
        return (
          <rect
            key={module.id}
            x={module.x - halfWidth}
            y={module.y - halfHeight}
            width={module.width}
            height={module.height}
            fill={module.color}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={isSelected ? 3 : 1}
            className="transition-all cursor-pointer"
          />
        );
      case 'circle':
        return (
          <ellipse
            key={module.id}
            cx={module.x}
            cy={module.y}
            rx={halfWidth}
            ry={halfHeight}
            fill={module.color}
            stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
            strokeWidth={isSelected ? 3 : 1}
            className="transition-all cursor-pointer"
          />
        );
      case 'triangle':
        path = `M ${module.x},${module.y - halfHeight} L ${module.x + halfWidth},${module.y + halfHeight} L ${module.x - halfWidth},${module.y + halfHeight} Z`;
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
      className="w-full h-full bg-slate-800 relative cursor-crosshair"
      style={{
        backgroundImage: `
          linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      <svg 
        ref={svgRef}
        className="w-full h-full" 
        style={{ cursor: isPanning ? 'grabbing' : 'crosshair' }}
        viewBox={`${viewBoxOffset.x} ${viewBoxOffset.y} ${WORLD_WIDTH / zoom} ${WORLD_HEIGHT / zoom}`} 
        preserveAspectRatio="xMidYMid meet"
        onClick={handleCanvasClick}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPanning(false)}
      >
        {/* Room boundaries with visible borders */}
        <rect
          x={20}
          y={20}
          width={WORLD_WIDTH - 40}
          height={WORLD_HEIGHT - 40}
          fill="none"
          stroke="rgba(139, 92, 246, 0.3)"
          strokeWidth={2}
          strokeDasharray="10 5"
        />
        
        {/* Edge indicators for room transitions */}
        <g opacity={0.5}>
          {/* Top edge */}
          <rect x={20} y={10} width={WORLD_WIDTH - 40} height={10} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={WORLD_WIDTH / 2} y={17} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10">↑</text>
          
          {/* Bottom edge */}
          <rect x={20} y={WORLD_HEIGHT - 20} width={WORLD_WIDTH - 40} height={10} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={WORLD_WIDTH / 2} y={WORLD_HEIGHT - 13} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10">↓</text>
          
          {/* Left edge */}
          <rect x={10} y={20} width={10} height={WORLD_HEIGHT - 40} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={15} y={WORLD_HEIGHT / 2} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10" transform={`rotate(-90 15 ${WORLD_HEIGHT / 2})`}>←</text>
          
          {/* Right edge */}
          <rect x={WORLD_WIDTH - 20} y={20} width={10} height={WORLD_HEIGHT - 40} fill="rgba(139, 92, 246, 0.2)" rx={2} />
          <text x={WORLD_WIDTH - 15} y={WORLD_HEIGHT / 2} textAnchor="middle" fill="rgba(255, 255, 255, 0.6)" fontSize="10" transform={`rotate(-90 ${WORLD_WIDTH - 15} ${WORLD_HEIGHT / 2})`}>→</text>
        </g>
        
        {/* Render confirmed modules */}
        {modules.map(renderModule)}
        
        {/* Render draft module with editor controls */}
        {draftModule && (
          <DraftModuleEditor
            draftModule={draftModule}
            onUpdate={onUpdateModule}
            onConfirm={onConfirmModule}
            onCancel={onCancelModule}
            canvasWidth={WORLD_WIDTH}
            canvasHeight={WORLD_HEIGHT}
          />
        )}
        
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


    </div>
  );
}