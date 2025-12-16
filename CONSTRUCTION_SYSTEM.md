# 🏗️ Sistema de Construcción de Módulos Mejorado

## Descripción General

El nuevo sistema de construcción permite crear módulos con controles visuales avanzados, incluyendo redimensionamiento independiente horizontal/vertical, arrastre, selección de color, y confirmación antes de colocar permanentemente.

## Características Principales

### 1. **Modo Draft (Borrador)**
- Al hacer clic en el canvas en modo construcción, se crea un módulo en draft
- El módulo draft **NO** se sincroniza con otros jugadores hasta que lo confirmes
- Puedes editarlo libremente sin afectar a los demás

### 2. **Redimensionamiento Visual**
#### Controles de Resize:
- **8 handles (agarraderas)**: 4 esquinas + 4 bordes
- **Esquinas**: Redimensionan diagonal (ancho + alto simultáneamente)
- **Bordes laterales (izq/der)**: Redimensionan solo horizontalmente
- **Bordes superior/inferior**: Redimensionan solo verticalmente

#### Límites:
- Tamaño mínimo: 20px × 20px
- El módulo se mantiene dentro de los límites del canvas (800×600)

### 3. **Arrastre (Drag)**
- **Handle central azul**: Arrastra el módulo a cualquier posición
- El cursor cambia a "grab" cuando está sobre el handle
- Mientras arrastras, el cursor cambia a "grabbing"

### 4. **Indicadores Visuales**
- **Borde punteado blanco**: Indica que el módulo está en modo draft
- **Dimensiones en tiempo real**: Muestra "Width × Height" encima del módulo
- **Handle central azul con ícono Move**: Para arrastrar
- **Handles de esquina/borde azules**: Para redimensionar

### 5. **Confirmación/Cancelación**
#### Botones de Control (debajo del módulo):
- **✓ Confirmar (verde)**: 
  - Guarda el módulo permanentemente
  - Se sincroniza con todos los jugadores en tiempo real
  - Se guarda en Supabase con el creador (`createdBy`)
  - Ya no se puede editar con los controles de draft

- **✕ Cancelar (rojo)**:
  - Descarta el módulo sin guardarlo
  - Vuelve al modo de construcción normal

### 6. **Editor Lateral Mejorado**
- **Panel de dimensiones**:
  - Para módulos draft: Muestra dimensiones actuales (solo lectura)
  - Para módulos confirmados: Slider de tamaño tradicional
  
- **Selector de color**: 
  - 20 colores predefinidos
  - Color picker visual
  - Input de texto para código hexadecimal

- **Vista previa actualizada**:
  - Refleja las proporciones reales (width × height)
  - Para círculos: Muestra como elipses si width ≠ height

## Flujo de Trabajo

### Crear un Módulo

1. **Activar modo construcción** 🔨
   - Click en el botón de martillo en la barra superior

2. **Click en el canvas**
   - Crea un módulo draft en la posición del click
   - Se abre el editor lateral automáticamente

3. **Personalizar el módulo**:
   - **Forma**: Cuadrado, Círculo, Triángulo
   - **Color**: Selector visual o código hex
   - **Comportamiento**: Ninguno, Teletransporte, Botón, Plataforma, Mensaje

4. **Ajustar tamaño y posición**:
   - **Arrastrar**: Click en el handle central azul y mueve el mouse
   - **Redimensionar**: Click en cualquier handle de esquina/borde y arrastra
   - Las dimensiones se actualizan en tiempo real

5. **Confirmar o cancelar**:
   - **✓ Confirmar**: Guarda permanentemente (se sincroniza con todos)
   - **✕ Cancelar**: Descarta los cambios

### Editar un Módulo Existente

1. En modo construcción, click sobre un módulo confirmado
2. Se selecciona en el editor lateral
3. Puedes cambiar:
   - Forma
   - Tamaño (solo slider, no resize visual)
   - Color
   - Comportamiento

4. Los cambios se sincronizan automáticamente en tiempo real

## Datos del Módulo

### Interfaz TypeScript:
```typescript
export interface Module {
  id: string;              // UUID único
  x: number;               // Posición X (centro)
  y: number;               // Posición Y (centro)
  shape: Shape;            // 'square' | 'circle' | 'triangle'
  size: number;            // Tamaño base (para compatibilidad)
  width: number;           // Ancho independiente
  height: number;          // Alto independiente
  color: string;           // Código hexadecimal (#RRGGBB)
  behavior: BehaviorType;  // Tipo de comportamiento
  behaviorData?: any;      // Datos del comportamiento
  createdBy?: string;      // ID del usuario creador
  isDraft?: boolean;       // true = en edición, false = confirmado
}
```

### Base de Datos (Supabase):
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  creator_id UUID REFERENCES users(id),
  x FLOAT,
  y FLOAT,
  shape TEXT,
  size FLOAT,
  width FLOAT,           -- ✨ NUEVO
  height FLOAT,          -- ✨ NUEVO
  color TEXT,
  behavior TEXT,
  behavior_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Migración de Base de Datos

Si tienes módulos existentes en Supabase, ejecuta esta migración:

```bash
# En Supabase Dashboard > SQL Editor
# Ejecuta el archivo: supabase/migration_add_width_height.sql
```

O manualmente:
```sql
ALTER TABLE modules
ADD COLUMN width FLOAT,
ADD COLUMN height FLOAT;

UPDATE modules
SET width = size, height = size
WHERE width IS NULL;

ALTER TABLE modules
ALTER COLUMN width SET NOT NULL,
ALTER COLUMN height SET NOT NULL;
```

## Sincronización Multiplayer

### Eventos Socket.io:

1. **module-create**: 
   - Se emite cuando confirmas un módulo draft
   - Todos los jugadores en la sala lo reciben y lo añaden
   - Se guarda en Supabase con `createdBy`

2. **module-update**:
   - Se emite cuando editas un módulo confirmado
   - Incluye width, height, y todas las propiedades

3. **module-delete**:
   - Se emite cuando eliminas un módulo
   - Se sincroniza y elimina de Supabase

### Flujo de Sincronización:
```
Cliente 1: Crear draft → Editar → ✓ Confirmar
           ↓
Servidor:  Recibe module-create → Guarda en Supabase
           ↓
Clientes:  Reciben module-created → Añaden a su lista
```

## Componentes Nuevos

### `DraftModuleEditor.tsx`
Componente visual para editar el módulo draft:
- Renderiza el módulo con borde punteado
- 8 handles de redimensionamiento
- Handle central de arrastre
- Botones de confirmar/cancelar
- Indicador de dimensiones

**Props:**
```typescript
{
  draftModule: Module;           // Módulo en edición
  onUpdate: (module) => void;    // Callback al cambiar dimensiones/posición
  onConfirm: () => void;         // Callback al confirmar
  onCancel: () => void;          // Callback al cancelar
  canvasWidth: number;           // Ancho del canvas (para límites)
  canvasHeight: number;          // Alto del canvas (para límites)
}
```

## Mejoras de UX

### Feedback Visual:
- **Cursor contextual**: Cambia según la acción (grab, resize, pointer)
- **Borde punteado**: Distingue módulos draft de confirmados
- **Dimensiones en vivo**: Ves el tamaño mientras redimensionas
- **Preview actualizado**: El editor lateral muestra las proporciones reales

### Prevención de Errores:
- **Límites del canvas**: El módulo no puede salirse del mundo
- **Tamaño mínimo**: Previene módulos invisibles (20px mínimo)
- **Modo draft**: Evita cambios accidentales hasta confirmar

## Notas de Implementación

### Compatibilidad:
- Los módulos antiguos sin `width`/`height` se migran automáticamente:
  ```typescript
  width: module.width || module.size,
  height: module.height || module.size,
  ```

### Renderizado:
- **Cuadrados**: `<rect>` con width y height
- **Círculos**: `<ellipse>` con rx (radio X) y ry (radio Y)
- **Triángulos**: `<path>` con cálculos ajustados para width/height

### Performance:
- Los eventos de mouse solo se capturan durante drag/resize
- Se usa `useEffect` para limpiar listeners al terminar
- El estado draft no se sincroniza hasta confirmar (reduce tráfico de red)

## Próximas Mejoras Sugeridas

1. **Rotación**: Añadir handle para rotar módulos
2. **Snap to grid**: Alinear automáticamente a una cuadrícula
3. **Capas**: Sistema de z-index para superponer módulos
4. **Duplicar**: Botón para copiar un módulo existente
5. **Deshacer/Rehacer**: Historial de cambios
6. **Biblioteca**: Guardar módulos favoritos para reutilizar

---

## Solución de Problemas

### El módulo no se sincroniza
- ✓ Verifica que hayas **confirmado** el módulo (botón verde)
- ✓ Revisa la consola del navegador para errores de Socket.io
- ✓ Confirma que la migración de BD se ejecutó correctamente

### Los controles no aparecen
- ✓ Asegúrate de estar en **modo construcción** (🔨)
- ✓ Verifica que `draftModule` no sea `null` en el estado
- ✓ Revisa que WorldCanvas reciba las props correctamente

### Error "width is not defined"
- ✓ Ejecuta la migración SQL en Supabase
- ✓ Verifica que el servidor incluya width/height en saveModule
- ✓ Limpia la caché del navegador y recarga

---

¡Disfruta construyendo mundos con el nuevo sistema mejorado! 🎨✨
