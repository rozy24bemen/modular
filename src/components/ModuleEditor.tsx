import { Square, Circle, Triangle, Zap, MessageSquare, ArrowRightLeft, Move } from 'lucide-react';
import type { Module, Shape, BehaviorType } from '../App';

interface ModuleEditorProps {
  selectedModule: Module | null;
  onUpdateModule: (module: Module) => void;
}

export function ModuleEditor({ selectedModule, onUpdateModule }: ModuleEditorProps) {
  if (!selectedModule) {
    return (
      <div className="w-80 bg-slate-800 border-l border-slate-700 p-6 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap size={32} className="text-slate-500" />
          </div>
          <p>Selecciona un módulo</p>
          <p className="text-xs mt-1">o crea uno nuevo en el canvas</p>
        </div>
      </div>
    );
  }

  const handleShapeChange = (shape: Shape) => {
    onUpdateModule({ ...selectedModule, shape });
  };

  const handleSizeChange = (size: number) => {
    onUpdateModule({ ...selectedModule, size });
  };

  const handleColorChange = (color: string) => {
    onUpdateModule({ ...selectedModule, color });
  };

  const handleBehaviorChange = (behavior: BehaviorType) => {
    onUpdateModule({ ...selectedModule, behavior });
  };

  const shapes: { type: Shape; icon: any; label: string }[] = [
    { type: 'square', icon: Square, label: 'Cuadrado' },
    { type: 'circle', icon: Circle, label: 'Círculo' },
    { type: 'triangle', icon: Triangle, label: 'Triángulo' },
  ];

  const behaviors: { type: BehaviorType; icon: any; label: string; description: string }[] = [
    { type: 'none', icon: null, label: 'Ninguno', description: 'Sin comportamiento' },
    { type: 'teleport', icon: ArrowRightLeft, label: 'Teletransporte', description: 'Transporta a otra sala' },
    { type: 'button', icon: Zap, label: 'Botón', description: 'Activa al hacer click' },
    { type: 'platform', icon: Move, label: 'Plataforma', description: 'Se mueve en el espacio' },
    { type: 'message', icon: MessageSquare, label: 'Mensaje', description: 'Muestra un texto' },
  ];

  const colorPresets = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b', '#1e293b', '#ffffff',
  ];

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-white flex items-center gap-2">
          <Zap size={18} className="text-purple-400" />
          Editor de Módulo
        </h2>
        <p className="text-slate-400 text-xs mt-1">ID: {selectedModule.id}</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Geometría */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">Forma</label>
          <div className="grid grid-cols-3 gap-2">
            {shapes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => handleShapeChange(type)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedModule.shape === type
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Icon size={24} className="mx-auto mb-1" />
                <p className="text-xs">{label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dimensiones */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">
            Dimensiones
          </label>
          
          {selectedModule.isDraft ? (
            <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
              <p className="text-slate-300 text-sm mb-1">Ancho × Alto</p>
              <p className="text-white text-lg font-mono">
                {Math.round(selectedModule.width)} × {Math.round(selectedModule.height)} px
              </p>
              <p className="text-slate-400 text-xs mt-2">
                💡 Usa los controles del canvas para redimensionar
              </p>
            </div>
          ) : (
            <>
              <label className="text-slate-400 text-xs mb-1 block">Tamaño base: {selectedModule.size}px</label>
              <input
                type="range"
                min="20"
                max="100"
                value={selectedModule.size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>20px</span>
                <span>100px</span>
              </div>
            </>
          )}
        </div>

        {/* Color */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">Color</label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-full aspect-square rounded-lg border-2 transition-all ${
                  selectedModule.color === color
                    ? 'border-white scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="color"
              value={selectedModule.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-10 rounded border border-slate-600 bg-slate-700 cursor-pointer"
            />
            <input
              type="text"
              value={selectedModule.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Comportamiento */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">Comportamiento</label>
          <div className="space-y-2">
            {behaviors.map(({ type, icon: Icon, label, description }) => (
              <button
                key={type}
                onClick={() => handleBehaviorChange(type)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  selectedModule.behavior === type
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {Icon && <Icon size={18} className="mt-0.5 flex-shrink-0" />}
                  {!Icon && <div className="w-[18px]" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{description}</p>
                  </div>
                  {selectedModule.behavior === type && (
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Behavior-specific options */}
          {selectedModule.behavior === 'message' && (
            <div className="mt-3">
              <label className="text-slate-300 text-xs mb-1 block">Texto del mensaje</label>
              <textarea
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm resize-none"
                rows={3}
                placeholder="Escribe el mensaje..."
                defaultValue={selectedModule.behaviorData?.message || ''}
              />
            </div>
          )}

          {selectedModule.behavior === 'teleport' && (
            <div className="mt-3">
              <label className="text-slate-300 text-xs mb-1 block">Sala de destino</label>
              <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm">
                <option>Plaza Central</option>
                <option>Zona Creativa</option>
                <option>Sala de Juegos</option>
                <option>Mi Sala</option>
              </select>
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="text-slate-300 text-sm mb-2 block">Vista previa</label>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              {selectedModule.shape === 'square' && (
                <rect
                  x={60 - (selectedModule.width || selectedModule.size) / 2}
                  y={60 - (selectedModule.height || selectedModule.size) / 2}
                  width={selectedModule.width || selectedModule.size}
                  height={selectedModule.height || selectedModule.size}
                  fill={selectedModule.color}
                />
              )}
              {selectedModule.shape === 'circle' && (
                <ellipse
                  cx={60}
                  cy={60}
                  rx={(selectedModule.width || selectedModule.size) / 2}
                  ry={(selectedModule.height || selectedModule.size) / 2}
                  fill={selectedModule.color}
                />
              )}
              {selectedModule.shape === 'triangle' && (
                <path
                  d={`M 60,${60 - (selectedModule.height || selectedModule.size) / 2} L ${60 + (selectedModule.width || selectedModule.size) / 2},${60 + (selectedModule.height || selectedModule.size) / 2} L ${60 - (selectedModule.width || selectedModule.size) / 2},${60 + (selectedModule.height || selectedModule.size) / 2} Z`}
                  fill={selectedModule.color}
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
