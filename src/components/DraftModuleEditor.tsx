import { useState, useRef, useEffect } from 'react';
import { Check, X, Move, Maximize2 } from 'lucide-react';
import type { Module } from '../App';

interface DraftModuleEditorProps {
  draftModule: Module;
  onUpdate: (module: Module) => void;
  onConfirm: () => void;
  onCancel: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br' | 'l' | 'r' | 't' | 'b' | null;

export function DraftModuleEditor({
  draftModule,
  onUpdate,
  onConfirm,
  onCancel,
  canvasWidth,
  canvasHeight,
}: DraftModuleEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialModule, setInitialModule] = useState(draftModule);
  // Local state for smooth dragging without parent re-render lag
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle = null) => {
    e.stopPropagation();
    
    // Get canvas bounding rect for proper coordinate conversion
    const canvas = (e.target as SVGElement).ownerSVGElement;
    const rect = canvas?.getBoundingClientRect();
    
    if (handle) {
      // Resizing
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      // Dragging - calculate offset from module center
      setIsDragging(true);
      if (rect) {
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        setDragStart({
          x: canvasX - draftModule.x,  // Store offset from center
          y: canvasY - draftModule.y,
        });
      }
    }
    
    setInitialModule(draftModule);
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Get canvas coordinates
        const canvas = document.querySelector('.world-canvas-container svg');
        const rect = canvas?.getBoundingClientRect();
        if (!rect) return;

        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        // Apply the offset stored in dragStart (distance from center)
        const newX = canvasX - dragStart.x;
        const newY = canvasY - dragStart.y;

        // Clamp to canvas bounds
        const clampedX = Math.max(draftModule.width / 2, Math.min(canvasWidth - draftModule.width / 2, newX));
        const clampedY = Math.max(draftModule.height / 2, Math.min(canvasHeight - draftModule.height / 2, newY));

        // Update local state immediately for smooth visual feedback
        setTempPosition({
          x: clampedX,
          y: clampedY,
          width: draftModule.width,
          height: draftModule.height,
        });
      } else if (isResizing && resizeHandle) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        let newWidth = initialModule.width;
        let newHeight = initialModule.height;

        // Calculate new dimensions based on handle
        // Center stays fixed, so we expand/contract equally on both sides
        switch (resizeHandle) {
          case 'r': // Right - expand width
            newWidth = Math.max(20, initialModule.width + dx * 2);
            break;
          case 'l': // Left - expand width
            newWidth = Math.max(20, initialModule.width - dx * 2);
            break;
          case 't': // Top - expand height
            newHeight = Math.max(20, initialModule.height - dy * 2);
            break;
          case 'b': // Bottom - expand height
            newHeight = Math.max(20, initialModule.height + dy * 2);
            break;
          case 'tr': // Top-right
            newWidth = Math.max(20, initialModule.width + dx * 2);
            newHeight = Math.max(20, initialModule.height - dy * 2);
            break;
          case 'tl': // Top-left
            newWidth = Math.max(20, initialModule.width - dx * 2);
            newHeight = Math.max(20, initialModule.height - dy * 2);
            break;
          case 'br': // Bottom-right
            newWidth = Math.max(20, initialModule.width + dx * 2);
            newHeight = Math.max(20, initialModule.height + dy * 2);
            break;
          case 'bl': // Bottom-left
            newWidth = Math.max(20, initialModule.width - dx * 2);
            newHeight = Math.max(20, initialModule.height + dy * 2);
            break;
        }

        // Center stays at initialModule.x, initialModule.y
        // Update local state immediately for smooth visual feedback
        setTempPosition({
          x: initialModule.x,
          y: initialModule.y,
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      // On mouse up, commit changes to parent
      if (tempPosition) {
        onUpdate({
          ...draftModule,
          x: tempPosition.x,
          y: tempPosition.y,
          width: tempPosition.width,
          height: tempPosition.height,
        });
        setTempPosition(null);
      }
      
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle, dragStart, initialModule, draftModule, onUpdate, canvasWidth, canvasHeight, tempPosition]);

  const handleSize = 8;
  
  // Use tempPosition for smooth dragging, fallback to draftModule
  const displayX = tempPosition?.x ?? draftModule.x;
  const displayY = tempPosition?.y ?? draftModule.y;
  const displayWidth = tempPosition?.width ?? draftModule.width;
  const displayHeight = tempPosition?.height ?? draftModule.height;
  
  const halfWidth = displayWidth / 2;
  const halfHeight = displayHeight / 2;

  return (
    <g>
      {/* Draft module with dashed border */}
      <g opacity={0.8}>
        {draftModule.shape === 'square' && (
          <rect
            x={displayX - halfWidth}
            y={displayY - halfHeight}
            width={displayWidth}
            height={displayHeight}
            fill={draftModule.color}
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
        {draftModule.shape === 'circle' && (
          <ellipse
            cx={displayX}
            cy={displayY}
            rx={halfWidth}
            ry={halfHeight}
            fill={draftModule.color}
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
        {draftModule.shape === 'triangle' && (
          <path
            d={`M ${displayX},${displayY - halfHeight} 
                L ${displayX + halfWidth},${displayY + halfHeight} 
                L ${displayX - halfWidth},${displayY + halfHeight} Z`}
            fill={draftModule.color}
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </g>

      {/* Drag handle (center) */}
      <g
        onMouseDown={(e) => handleMouseDown(e)}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <circle
          cx={displayX}
          cy={displayY}
          r="12"
          fill="rgba(59, 130, 246, 0.9)"
          stroke="#fff"
          strokeWidth="2"
        />
        <Move size={14} x={displayX - 7} y={displayY - 7} color="#fff" />
      </g>

      {/* Resize handles */}
      {/* Corners */}
      <ResizeHandleComponent
        x={displayX - halfWidth - handleSize}
        y={displayY - halfHeight - handleSize}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'tl')}
        cursor="nw-resize"
      />
      <ResizeHandleComponent
        x={displayX + halfWidth}
        y={displayY - halfHeight - handleSize}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'tr')}
        cursor="ne-resize"
      />
      <ResizeHandleComponent
        x={displayX - halfWidth - handleSize}
        y={displayY + halfHeight}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'bl')}
        cursor="sw-resize"
      />
      <ResizeHandleComponent
        x={displayX + halfWidth}
        y={displayY + halfHeight}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'br')}
        cursor="se-resize"
      />

      {/* Edges */}
      <ResizeHandleComponent
        x={displayX + halfWidth}
        y={displayY - handleSize / 2}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'r')}
        cursor="ew-resize"
      />
      <ResizeHandleComponent
        x={displayX - halfWidth - handleSize}
        y={displayY - handleSize / 2}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'l')}
        cursor="ew-resize"
      />
      <ResizeHandleComponent
        x={displayX - handleSize / 2}
        y={displayY - halfHeight - handleSize}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 't')}
        cursor="ns-resize"
      />
      <ResizeHandleComponent
        x={displayX - handleSize / 2}
        y={displayY + halfHeight}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'b')}
        cursor="ns-resize"
      />

      {/* Control panel */}
      <foreignObject
        x={displayX - 100}
        y={displayY + halfHeight + 20}
        width="200"
        height="60"
      >
        <div className="flex gap-2 justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          >
            <Check size={16} />
            Confirmar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          >
            <X size={16} />
            Cancelar
          </button>
        </div>
      </foreignObject>

      {/* Size indicator */}
      <foreignObject
        x={draftModule.x - 60}
        y={draftModule.y - halfHeight - 30}
        width="120"
        height="20"
      >
        <div className="text-xs text-white bg-black/70 px-2 py-1 rounded text-center">
          {Math.round(draftModule.width)} × {Math.round(draftModule.height)}
        </div>
      </foreignObject>
    </g>
  );
}

function ResizeHandleComponent({
  x,
  y,
  size,
  onMouseDown,
  cursor,
}: {
  x: number;
  y: number;
  size: number;
  onMouseDown: (e: React.MouseEvent) => void;
  cursor: string;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={size}
      height={size}
      fill="#3b82f6"
      stroke="#fff"
      strokeWidth="1"
      onMouseDown={onMouseDown}
      style={{ cursor }}
      className="hover:fill-blue-400"
    />
  );
}
