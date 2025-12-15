import { Trash2, Copy, Move } from 'lucide-react';

interface ToolbarProps {
  onDeleteModule: () => void;
  hasSelection: boolean;
}

export function Toolbar({ onDeleteModule, hasSelection }: ToolbarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
      <div className="text-slate-400 text-sm border-r border-slate-700 pr-3">
        Herramientas
      </div>
      
      <button
        className={`p-2 rounded-lg transition-colors ${
          hasSelection
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
        }`}
        disabled={!hasSelection}
        title="Mover"
      >
        <Move size={18} />
      </button>

      <button
        className={`p-2 rounded-lg transition-colors ${
          hasSelection
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
        }`}
        disabled={!hasSelection}
        title="Duplicar"
      >
        <Copy size={18} />
      </button>

      <button
        onClick={onDeleteModule}
        className={`p-2 rounded-lg transition-colors ${
          hasSelection
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
        }`}
        disabled={!hasSelection}
        title="Eliminar"
      >
        <Trash2 size={18} />
      </button>

      <div className="border-l border-slate-700 pl-3 text-slate-400 text-xs">
        Click en el mundo para crear módulos
      </div>
    </div>
  );
}
