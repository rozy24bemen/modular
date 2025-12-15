import { X, Square, Circle, Triangle, Palette } from 'lucide-react';
import type { Avatar, Shape } from '../App';

interface AvatarCustomizerProps {
  avatar: Avatar;
  onUpdate: (avatar: Avatar) => void;
  onClose: () => void;
}

export function AvatarCustomizer({ avatar, onUpdate, onClose }: AvatarCustomizerProps) {
  const shapes: { type: Shape; icon: any; label: string }[] = [
    { type: 'circle', icon: Circle, label: 'Círculo' },
    { type: 'square', icon: Square, label: 'Cuadrado' },
    { type: 'triangle', icon: Triangle, label: 'Triángulo' },
  ];

  const colorPresets = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#64748b',
  ];

  const handleShapeChange = (headShape: Shape) => {
    onUpdate({ ...avatar, headShape });
  };

  const handleColorChange = (color: string) => {
    onUpdate({ ...avatar, color });
  };

  const handleNameChange = (name: string) => {
    onUpdate({ ...avatar, name });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-white flex items-center gap-2">
              <Palette size={20} className="text-purple-400" />
              Personalizar Avatar
            </h2>
            <p className="text-slate-400 text-sm mt-1">Personaliza tu apariencia en el mundo</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 flex items-center justify-center">
            <svg width="120" height="120">
              {/* Shadow */}
              <ellipse
                cx={60}
                cy={90}
                rx={18}
                ry={6}
                fill="rgba(0,0,0,0.3)"
              />
              
              {/* Body */}
              <rect
                x={48}
                y={60}
                width={24}
                height={30}
                rx={6}
                fill={avatar.color}
                opacity={0.8}
              />
              
              {/* Head */}
              {avatar.headShape === 'circle' && (
                <circle
                  cx={60}
                  cy={45}
                  r={15}
                  fill={avatar.color}
                  stroke="#fff"
                  strokeWidth={3}
                />
              )}
              {avatar.headShape === 'square' && (
                <rect
                  x={45}
                  y={30}
                  width={30}
                  height={30}
                  rx={3}
                  fill={avatar.color}
                  stroke="#fff"
                  strokeWidth={3}
                />
              )}
              {avatar.headShape === 'triangle' && (
                <path
                  d={`M 60,30 L 75,60 L 45,60 Z`}
                  fill={avatar.color}
                  stroke="#fff"
                  strokeWidth={3}
                />
              )}
            </svg>
          </div>

          {/* Name */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Nombre</label>
            <input
              type="text"
              value={avatar.name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              placeholder="Tu nombre"
            />
          </div>

          {/* Head Shape */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Forma de la cabeza</label>
            <div className="grid grid-cols-3 gap-3">
              {shapes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleShapeChange(type)}
                  className={`p-4 rounded-lg border transition-all ${
                    avatar.headShape === type
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Icon size={28} className="mx-auto mb-2" />
                  <p className="text-xs">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    avatar.color === color
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="color"
                value={avatar.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-10 rounded border border-slate-600 bg-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={avatar.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
