# Guía de Configuración - Base de Datos Supabase

## 🚀 Configuración Completa del Proyecto Multijugador

Tu proyecto ahora incluye:
- ✅ Autenticación de usuarios con Supabase
- ✅ Persistencia de mundos y módulos en base de datos
- ✅ Sistema multijugador en tiempo real con Socket.io
- ✅ Chat persistente
- ✅ Modo invitado y modo autenticado

---

## 📋 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se inicialice (toma 1-2 minutos)
4. Guarda estas credenciales:
   - `Project URL` (ejemplo: https://abcdefgh.supabase.co)
   - `anon/public key` (clave pública)
   - `service_role key` (clave privada - SOLO PARA SERVIDOR)

### 2. Ejecutar Schema SQL

1. En tu proyecto Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia todo el contenido de `supabase/schema.sql`
4. Ejecuta el script (Run)
5. Verifica que las tablas se crearon en **Table Editor**

Tablas creadas:
- `users` - Perfiles de usuario
- `rooms` - Habitaciones del mundo
- `modules` - Objetos/módulos en habitaciones
- `inventory` - Inventario de jugadores
- `achievements` - Logros desbloqueados
- `friendships` - Sistema de amigos
- `chat_messages` - Historial de chat

### 3. Configurar Variables de Entorno

#### **Frontend (.env en la raíz del proyecto)**
```env
VITE_SERVER_URL=http://localhost:3001
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

#### **Backend (server/.env)**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_KEY=tu-service-role-key-aqui
PORT=3001
NODE_ENV=development
```

⚠️ **IMPORTANTE**: 
- El `service_role key` solo debe estar en el servidor
- Nunca subas archivos `.env` a Git
- Los archivos `.env.example` son solo plantillas

### 4. Instalar Dependencias

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 5. Iniciar el Proyecto

#### Terminal 1 - Backend:
```bash
cd server
npm start
```

#### Terminal 2 - Frontend:
```bash
npm run dev
```

---

## 🎮 Características del Sistema

### Autenticación
- **Modo Invitado**: Juega sin cuenta (no se guarda progreso)
- **Registro**: Email + contraseña + username
- **Login**: Email + contraseña
- **Perfil**: Avatar personalizable, nivel, XP

### Persistencia
- **Mundos**: Se guardan automáticamente en la base de datos
- **Módulos**: Construcciones persisten entre sesiones
- **Chat**: Historial de los últimos 50 mensajes por sala
- **Posición**: Cada sala recuerda sus módulos

### Multijugador
- **Tiempo Real**: Socket.io para movimiento y chat instantáneo
- **Sincronización**: Todos los cambios se propagan en tiempo real
- **Rooms**: Sistema de coordenadas infinitas (x, y)

---

## 🔧 Desarrollo Local

### Estructura de Archivos Actualizada

```
modular/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx        # Context de autenticación
│   ├── lib/
│   │   └── supabase.ts            # Cliente Supabase
│   ├── components/
│   │   └── AuthDialog.tsx         # UI de login/registro
│   └── hooks/
│       └── useMultiplayer.ts      # Hook Socket.io actualizado
├── server/
│   ├── config/
│   │   └── supabase.js            # Config Supabase servidor
│   ├── index-new.js               # Servidor con Supabase
│   └── .env                       # Variables de entorno (crear)
├── supabase/
│   └── schema.sql                 # Schema de base de datos
└── .env                           # Variables frontend (crear)
```

### Testing Local

1. Asegúrate de que ambos servidores estén corriendo
2. Abre `http://localhost:3000`
3. Prueba en modo invitado primero
4. Registra una cuenta
5. Crea módulos y verifica que persistan al recargar
6. Abre en otra pestaña/navegador y verifica multijugador

---

## 🚀 Despliegue a Producción

### Frontend (Vercel)

1. Conecta tu repo en [vercel.com](https://vercel.com)
2. Agrega variables de entorno en Vercel:
   - `VITE_SERVER_URL`: URL de tu servidor backend
   - `VITE_SUPABASE_URL`: URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Anon key de Supabase
3. Deploy automático

### Backend (Railway / Render)

#### Railway:
```bash
cd server
railway init
railway add
```

En Railway dashboard:
- Variables → Add Variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`
  - `PORT` (Railway lo asigna automáticamente)

#### Render:
1. Crea Web Service
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Agrega variables de entorno

### Actualizar Frontend con URL del Backend

Después de desplegar el backend, actualiza en Vercel:
```env
VITE_SERVER_URL=https://tu-servidor.railway.app
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

El schema incluye políticas RLS que:
- Permiten lectura pública de salas públicas
- Solo creadores pueden modificar sus módulos
- Usuarios solo ven su propio inventario
- Chat visible en salas públicas

### Permisos

- `anon key`: Solo permisos limitados (frontend)
- `service_role key`: Permisos completos (solo backend)

---

## 🐛 Troubleshooting

### Error: "Failed to load room"
- Verifica que el schema SQL se ejecutó correctamente
- Revisa las variables de entorno del backend
- Confirma la conexión a Supabase en logs del servidor

### Error: "User not authenticated"
- Normal en modo invitado
- Los invitados tienen ID temporal tipo `guest_xxxxx`
- Registra una cuenta para funcionalidad completa

### Módulos no persisten
- Verifica que el servidor tenga `SUPABASE_SERVICE_KEY`
- Revisa logs del servidor para errores de database
- Confirma que la tabla `modules` existe

### No hay multijugador
- Asegúrate de que `VITE_SERVER_URL` apunte al servidor correcto
- Verifica que el servidor Socket.io esté corriendo
- Revisa la consola del navegador para errores de conexión

---

## 📚 Próximos Pasos

Ahora que tienes la base implementada, puedes agregar:

1. **Sistema de Inventario**: Usa la tabla `inventory`
2. **Achievements**: Usa la tabla `achievements`
3. **Sistema de Amigos**: Usa la tabla `friendships`
4. **Leaderboards**: Query top usuarios por XP
5. **Salas Privadas**: Usa el campo `is_public` en rooms
6. **Moderación**: Sistema de reportes y bans

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Revisa la consola del navegador
3. Verifica las variables de entorno
4. Confirma que Supabase esté online
5. Prueba las queries SQL directamente en Supabase

¡Tu mundo virtual multijugador está listo! 🎉
