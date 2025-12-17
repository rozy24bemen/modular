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
  const [justFinishedInteraction, setJustFinishedInteraction] = useState(false);

  const clientToSVGCoords = (clientX: number, clientY: number, svgElement: SVGSVGElement) => {
    const pt = svgElement.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgElement.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  };

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle = null) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Use the same SVG selector as handleMouseMove to ensure consistency
    const svg = document.querySelector('.world-canvas-container svg') as SVGSVGElement;
    if (!svg) return;
    
    if (handle) {
      // Resizing
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      // Dragging - calculate offset from module center using SVG coords
      setIsDragging(true);
      const svgCoords = clientToSVGCoords(e.clientX, e.clientY, svg);
      if (svgCoords) {
        // Use current visual position (tempPosition if exists, otherwise draftModule)
        const currentX = tempPosition?.x ?? draftModule.x;
        const currentY = tempPosition?.y ?? draftModule.y;
        console.log('🎯 DRAG START:', {
          clientX: e.clientX,
          clientY: e.clientY,
          svgX: svgCoords.x,
          svgY: svgCoords.y,
          moduleX: currentX,
          moduleY: currentY,
          offsetX: svgCoords.x - currentX,
          offsetY: svgCoords.y - currentY,
        });
        setDragStart({
          x: svgCoords.x - currentX,  // Store offset from current visual center
          y: svgCoords.y - currentY,
        });
      }
    }
    
    // Store initial module with current visual position
    const currentX = tempPosition?.x ?? draftModule.x;
    const currentY = tempPosition?.y ?? draftModule.y;
    setInitialModule({ ...draftModule, x: currentX, y: currentY });
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Get SVG element for coordinate conversion
        const svg = document.querySelector('.world-canvas-container svg') as SVGSVGElement;
        if (!svg) return;

        // Convert client coords to SVG coords
        const svgCoords = clientToSVGCoords(e.clientX, e.clientY, svg);
        if (!svgCoords) return;

        // Apply the offset stored in dragStart (distance from center)
        const newX = svgCoords.x - dragStart.x;
        const newY = svgCoords.y - dragStart.y;

        console.log('🚀 DRAG MOVE:', {
          clientX: e.clientX,
          clientY: e.clientY,
          svgX: svgCoords.x,
          svgY: svgCoords.y,
          offsetX: dragStart.x,
          offsetY: dragStart.y,
          newX,
          newY,
        });

        const currentWidth = tempPosition?.width ?? draftModule.width;
        const currentHeight = tempPosition?.height ?? draftModule.height;

        // Update local state immediately for smooth visual feedback
        setTempPosition({
          x: newX,
          y: newY,
          width: currentWidth,
          height: currentHeight,
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

    const handleMouseUp = (e: MouseEvent) => {
      const wasInteracting = isDragging || isResizing;
      
      // On mouse up, commit changes to parent
      if (tempPosition) {
        console.log('✅ DRAG END - Final position:', {
          finalX: tempPosition.x,
          finalY: tempPosition.y,
          finalWidth: tempPosition.width,
          finalHeight: tempPosition.height,
        });
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
      
      // If we were interacting, prevent the next click event on canvas
      if (wasInteracting) {
        setJustFinishedInteraction(true);
        
        // Add a one-time click blocker IMMEDIATELY (no setTimeout)
        const blockNextClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
          document.removeEventListener('click', blockNextClick, true);
          setTimeout(() => setJustFinishedInteraction(false), 100);
        };
        
        // Install blocker immediately in capture phase
        document.addEventListener('click', blockNextClick, true);
      }
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

  // Check if module is within world bounds (0-800, 0-600)
  const isWithinBounds = 
    displayX - halfWidth >= 0 &&
    displayX + halfWidth <= canvasWidth &&
    displayY - halfHeight >= 0 &&
    displayY + halfHeight <= canvasHeight;

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

      {/* Confirm button - single green checkmark */}
      <foreignObject
        x={displayX - 30}
        y={displayY + halfHeight + 20}
        width="60"
        height="60"
      >
        <div className="flex justify-center">
          <button
            onClick={isWithinBounds ? onConfirm : undefined}
            disabled={!isWithinBounds}
            className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isWithinBounds 
                ? 'bg-green-600 hover:bg-green-700 hover:scale-110 cursor-pointer' 
                : 'bg-red-600 opacity-50 cursor-not-allowed'
            }`}
            title={isWithinBounds ? "Confirmar (Enter) | Click derecho para cancelar" : "Módulo fuera de límites - Muévelo dentro de la sala"}
          >
            {isWithinBounds ? <Check size={24} /> : <X size={24} />}
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
