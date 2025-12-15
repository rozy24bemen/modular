# Modular - Servidor Multijugador

Servidor de multijugador para el mundo virtual modular usando Socket.io.

## Instalación Local

```bash
cd server
npm install
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## Desplegar en Railway

Railway es perfecto para este servidor Node.js:

1. Crea una cuenta en [Railway.app](https://railway.app)
2. Instala Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

3. Haz login:
   ```bash
   railway login
   ```

4. Desde el directorio `server/`:
   ```bash
   railway init
   railway up
   ```

5. Copia la URL que te da Railway y actualiza `.env` en el frontend:
   ```
   VITE_SERVER_URL=https://tu-servidor.railway.app
   ```

## Variables de Entorno

El servidor usa el puerto definido en `process.env.PORT` o 3001 por defecto.

## Endpoints

- `GET /` - Health check, devuelve status del servidor y número de jugadores

## Eventos Socket.io

### Cliente → Servidor

- `join-room` - Unirse a una habitación
- `player-move` - Movimiento del jugador
- `chat-message` - Mensaje de chat
- `module-create` - Crear módulo
- `module-update` - Actualizar módulo
- `module-delete` - Eliminar módulo
- `avatar-update` - Actualizar avatar

### Servidor → Cliente

- `room-state` - Estado inicial de la habitación
- `player-joined` - Nuevo jugador en la habitación
- `player-left` - Jugador salió de la habitación
- `player-moved` - Jugador se movió
- `chat-message` - Mensaje de chat recibido
- `player-chat-bubble` - Burbuja de chat de jugador
- `module-created` - Módulo creado
- `module-updated` - Módulo actualizado
- `module-deleted` - Módulo eliminado
- `player-avatar-updated` - Avatar de jugador actualizado

## Arquitectura

El servidor mantiene:
- Un mapa de habitaciones (por coordenadas x,y)
- Cada habitación contiene:
  - Jugadores conectados
  - Módulos creados
- Los jugadores se aíslan por habitación
- Sincronización en tiempo real de todos los eventos
