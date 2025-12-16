# 🚀 Guía Rápida de Inicio

## ⚡ 5 Pasos para Activar el Multijugador

### 1️⃣ Crear Proyecto Supabase (5 min)
```
1. Ve a https://supabase.com
2. Click en "Start your project"
3. Crea un nuevo proyecto (espera 2 minutos)
4. Ve a Settings → API
5. Copia:
   - Project URL
   - anon public key
   - service_role key (⚠️ secreto)
```

### 2️⃣ Configurar Base de Datos (2 min)
```
1. En Supabase, abre "SQL Editor"
2. Click "New query"
3. Copia TODO el contenido de: supabase/schema.sql
4. Pega y click "Run"
5. Verifica en "Table Editor" que aparezcan 7 tablas
```

### 3️⃣ Variables de Entorno (1 min)

Crea `.env` en la raíz:
```env
VITE_SERVER_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Crea `server/.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
PORT=3001
```

### 4️⃣ Instalar e Iniciar (2 min)

**Terminal 1 - Backend:**
```bash
cd server
npm install
mv index.js index-old.js
mv index-new.js index.js
npm start
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

### 5️⃣ ¡Probar! (1 min)

1. Abre `http://localhost:3000`
2. Click "Iniciar Sesión" → "Registrarse"
3. Crea una cuenta
4. ¡Construye algo!
5. Recarga la página → ¡Tu construcción persiste! ✨

---

## 🧪 Verificar que Funciona

### ✅ Checklist

- [ ] Servidor backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Puedes ver "✅ Supabase connection successful" en logs del servidor
- [ ] Puedes registrar una cuenta
- [ ] Aparece tu nombre en la esquina superior derecha
- [ ] Puedes crear un módulo (modo construcción)
- [ ] Al recargar, el módulo sigue ahí
- [ ] Abres en otra pestaña y ves tu avatar moverse

---

## 🐛 Problemas Comunes

### "Failed to load room"
```bash
# Verifica que ejecutaste el schema SQL
# Revisa los logs del servidor para errores
```

### "Connection failed"
```bash
# Verifica que las variables SUPABASE_URL y SUPABASE_SERVICE_KEY
# estén correctas en server/.env
```

### "Modules don't persist"
```bash
# Verifica que reemplazaste index.js con index-new.js
cd server
ls -la index*.js  # Debes ver index-old.js e index-new.js
```

### Socket.io no conecta
```bash
# Verifica VITE_SERVER_URL en .env
# Asegúrate que el servidor está corriendo
curl http://localhost:3001  # Debe devolver JSON
```

---

## 📱 Probar Multijugador

### En la Misma Computadora:
1. Abre `localhost:3000` en Chrome
2. Abre `localhost:3000` en Firefox (o modo incógnito)
3. Muévete en uno → deberías verte en el otro

### En Diferentes Dispositivos:
1. Encuentra tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. En tu teléfono, ve a `http://tu-ip:3000`
3. ¡Ahora puedes jugar desde el móvil!

---

## 🎨 Personalización Rápida

### Cambiar Color Inicial del Avatar
```typescript
// src/lib/supabase.ts - línea ~110
avatar_color: '#FF0000',  // Rojo en vez de azul
```

### Cambiar Nombre de la Plaza Central
```typescript
// src/App.tsx - función getRoomName
if (coords.x === 0 && coords.y === 0) return 'Mi Plaza';
```

### Añadir Más Módulos Iniciales
```sql
-- En Supabase SQL Editor:
INSERT INTO modules (room_id, x, y, shape, size, color, behavior)
VALUES (
  (SELECT id FROM rooms WHERE coord_x = 0 AND coord_y = 0),
  400, 300, 'circle', 60, '#FF6B6B', 'button'
);
```

---

## 📚 Siguiente Nivel

Una vez que funcione, lee:
- `SETUP_SUPABASE.md` - Configuración detallada
- `IMPLEMENTACION.md` - Qué se implementó
- `server/README.md` - Deployment a producción

---

## 💡 Tips

- **Usa modo construcción** (icono del martillo) para crear módulos
- **El chat persiste** - los últimos 50 mensajes se guardan
- **Las salas se crean automáticamente** al visitarlas
- **Modo invitado** funciona pero no guarda progreso
- **Registrarte** te da persistencia completa

---

¡Disfruta tu mundo virtual multijugador! 🌍✨
