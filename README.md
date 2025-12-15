
# Modular - Mundo Virtual Multijugador 🌍

Un mundo virtual interactivo y modular con multijugador en tiempo real, construido con React, TypeScript, Vite y Socket.io.

## ✨ Características

- 🎮 **Multijugador en tiempo real** - Ve a otros jugadores moverse y chatear instantáneamente
- 🗺️ **Mundo infinito** - Navega entre habitaciones con coordenadas ilimitadas
- 💬 **Chat en vivo** - Comunícate con otros jugadores con burbujas de chat
- 🎨 **Personalización de avatares** - Formas (círculo, cuadrado, triángulo) y colores personalizables
- 🔨 **Modo construcción** - Crea y edita módulos interactivos en tiempo real
- 🚶 **Movimiento fluido** - Control con WASD o click-to-move
- 📱 **Responsive** - Se adapta a cualquier tamaño de pantalla
- 🎯 **Límites visuales claros** - Bordes y flechas que indican transiciones de habitación

## 🚀 Inicio Rápido

### Frontend

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El cliente se ejecutará en `http://localhost:3000`

### Backend (Servidor Multijugador)

```bash
# Navegar al directorio del servidor
cd server

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## 🎮 Cómo Jugar

### Modo Exploración
- **WASD** o **flechas** para moverte
- **Click** en el mundo para moverte a esa posición
- **Camina a los bordes** con las flechas púrpuras para cambiar de habitación
- **Chat** en el panel derecho para hablar con otros jugadores

### Modo Construcción
- **Click** para crear nuevos módulos
- **Click en un módulo** para seleccionarlo y editarlo
- **Panel derecho** para cambiar forma, color y comportamiento
- **Eliminar** botón para borrar módulos

## 📁 Estructura del Proyecto

```
modular/
├── src/
│   ├── components/        # Componentes React
│   │   ├── WorldCanvas.tsx       # Canvas principal del mundo
│   │   ├── ChatPanel.tsx         # Panel de chat
│   │   ├── ModuleEditor.tsx      # Editor de módulos
│   │   ├── AvatarCustomizer.tsx  # Personalizador de avatar
│   │   └── ui/                   # Componentes de UI
│   ├── hooks/
│   │   └── useMultiplayer.ts     # Hook de multijugador
│   └── App.tsx            # Componente principal
├── server/
│   ├── index.js           # Servidor Socket.io
│   └── package.json       # Dependencias del servidor
└── package.json           # Dependencias del frontend
```

## 🌐 Despliegue

### Frontend (Vercel)

El frontend ya está configurado para Vercel. Solo conecta tu repositorio de GitHub en [vercel.com](https://vercel.com)

### Backend (Railway/Render)

Ver [server/README.md](server/README.md) para instrucciones detalladas de despliegue del servidor.

Después de desplegar, actualiza el archivo `.env`:

```env
VITE_SERVER_URL=https://tu-servidor.railway.app
```

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool y dev server
- **Socket.io Client** - WebSocket client
- **Framer Motion** - Animaciones
- **Radix UI** - Componentes accesibles
- **Tailwind CSS** - Estilos

### Backend
- **Node.js** - Runtime
- **Express** - Web server
- **Socket.io** - WebSocket server
- **CORS** - Cross-origin support

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SERVER_URL=http://localhost:3001
```

Para producción, usa la URL de tu servidor desplegado.

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🎨 Créditos

Diseño original inspirado en [UI Design for Virtual World](https://www.figma.com/design/M9edunqmI1xt6pscuStbQs/UI-Design-for-Virtual-World)
  