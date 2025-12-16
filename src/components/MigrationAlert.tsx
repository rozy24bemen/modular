import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export function MigrationAlert() {
  const [show, setShow] = useState(false);
  const [sql, setSql] = useState('');

  useEffect(() => {
    const checkMigration = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL || window.location.origin}/api/check-migration`);
        const data = await response.json();
        
        if (data.migrationNeeded) {
          setShow(true);
          setSql(data.sql);
          console.error('⚠️ MIGRATION NEEDED:', data.sql);
        } else {
          console.log('✅ Database migration: OK');
        }
      } catch (error) {
        console.error('Error checking migration:', error);
      }
    };

    checkMigration();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
      <div className="bg-yellow-600 border-2 border-yellow-500 rounded-lg shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-100 flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1 text-yellow-50">
            <h3 className="font-bold text-lg mb-1">⚠️ Migración de Base de Datos Requerida</h3>
            <p className="text-sm mb-3">
              Los módulos NO se guardarán hasta que ejecutes esta migración SQL en Supabase.
            </p>
            <div className="bg-black/30 rounded p-3 text-xs font-mono overflow-x-auto mb-3">
              <pre className="text-yellow-100 whitespace-pre">{sql}</pre>
            </div>
            <ol className="text-sm space-y-1 mb-3">
              <li>1. Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener" className="underline font-bold">Supabase Dashboard</a></li>
              <li>2. Selecciona tu proyecto</li>
              <li>3. SQL Editor → New Query</li>
              <li>4. Copia el SQL de arriba y ejecútalo</li>
              <li>5. Recarga esta página</li>
            </ol>
            <p className="text-xs italic">
              Esto solo se necesita hacer una vez. Añade columnas width/height a la tabla modules.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-yellow-100 hover:text-white flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
