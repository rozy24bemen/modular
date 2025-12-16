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

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle = null) => {
    e.stopPropagation();
    
    if (handle) {
      // Resizing
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      // Dragging
      setIsDragging(true);
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
    setInitialModule(draftModule);
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (isDragging) {
        // Move module
        onUpdate({
          ...draftModule,
          x: Math.max(draftModule.width / 2, Math.min(canvasWidth - draftModule.width / 2, initialModule.x + dx)),
          y: Math.max(draftModule.height / 2, Math.min(canvasHeight - draftModule.height / 2, initialModule.y + dy)),
        });
      } else if (isResizing && resizeHandle) {
        let newWidth = initialModule.width;
        let newHeight = initialModule.height;
        let newX = initialModule.x;
        let newY = initialModule.y;

        // Calculate new dimensions based on handle
        switch (resizeHandle) {
          case 'r': // Right
            newWidth = Math.max(20, initialModule.width + dx * 2);
            break;
          case 'l': // Left
            newWidth = Math.max(20, initialModule.width - dx * 2);
            break;
          case 't': // Top
            newHeight = Math.max(20, initialModule.height - dy * 2);
            break;
          case 'b': // Bottom
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

        onUpdate({
          ...draftModule,
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        });
      }
    };

    const handleMouseUp = () => {
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
  }, [isDragging, isResizing, resizeHandle, dragStart, initialModule, draftModule, onUpdate, canvasWidth, canvasHeight]);

  const handleSize = 8;
  const halfWidth = draftModule.width / 2;
  const halfHeight = draftModule.height / 2;

  return (
    <g>
      {/* Draft module with dashed border */}
      <g opacity={0.8}>
        {draftModule.shape === 'square' && (
          <rect
            x={draftModule.x - halfWidth}
            y={draftModule.y - halfHeight}
            width={draftModule.width}
            height={draftModule.height}
            fill={draftModule.color}
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
        {draftModule.shape === 'circle' && (
          <ellipse
            cx={draftModule.x}
            cy={draftModule.y}
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
            d={`M ${draftModule.x},${draftModule.y - halfHeight} 
                L ${draftModule.x + halfWidth},${draftModule.y + halfHeight} 
                L ${draftModule.x - halfWidth},${draftModule.y + halfHeight} Z`}
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
          cx={draftModule.x}
          cy={draftModule.y}
          r="12"
          fill="rgba(59, 130, 246, 0.9)"
          stroke="#fff"
          strokeWidth="2"
        />
        <Move size={14} x={draftModule.x - 7} y={draftModule.y - 7} color="#fff" />
      </g>

      {/* Resize handles */}
      {/* Corners */}
      <ResizeHandleComponent
        x={draftModule.x - halfWidth - handleSize}
        y={draftModule.y - halfHeight - handleSize}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'tl')}
        cursor="nw-resize"
      />
      <ResizeHandleComponent
        x={draftModule.x + halfWidth}
        y={draftModule.y - halfHeight - handleSize}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'tr')}
        cursor="ne-resize"
      />
      <ResizeHandleComponent
        x={draftModule.x - halfWidth - handleSize}
        y={draftModule.y + halfHeight}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'bl')}
        cursor="sw-resize"
      />
      <ResizeHandleComponent
        x={draftModule.x + halfWidth}
        y={draftModule.y + halfHeight}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'br')}
        cursor="se-resize"
      />

      {/* Edges */}
      <ResizeHandleComponent
        x={draftModule.x + halfWidth}
        y={draftModule.y - handleSize / 2}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'r')}
        cursor="ew-resize"
      />
      <ResizeHandleComponent
        x={draftModule.x - halfWidth - handleSize}
        y={draftModule.y - handleSize / 2}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'l')}
        cursor="ew-resize"
      />
      <ResizeHandleComponent
        x={draftModule.x - handleSize / 2}
        y={draftModule.y - halfHeight - handleSize}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 't')}
        cursor="ns-resize"
      />
      <ResizeHandleComponent
        x={draftModule.x - handleSize / 2}
        y={draftModule.y + halfHeight}
        size={handleSize}
        onMouseDown={(e) => handleMouseDown(e, 'b')}
        cursor="ns-resize"
      />

      {/* Control panel */}
      <foreignObject
        x={draftModule.x - 100}
        y={draftModule.y + halfHeight + 20}
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
