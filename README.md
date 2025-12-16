
# Modular - Mundo Virtual Multijugador 🌍

Un mundo virtual interactivo y modular con multijugador en tiempo real, persistencia de datos y autenticación de usuarios. Construido con React, TypeScript, Vite, Socket.io y Supabase.

## ✨ Características

- 🎮 **Multijugador en tiempo real** - Ve a otros jugadores moverse y chatear instantáneamente
- 🗄️ **Persistencia completa** - Base de datos Supabase para guardar mundos, módulos y progreso
- 👤 **Sistema de autenticación** - Registro, login y modo invitado
- 🗺️ **Mundo infinito** - Navega entre habitaciones con coordenadas ilimitadas
- 💬 **Chat persistente** - Comunícate con otros jugadores, el historial se guarda
- 🎨 **Personalización de avatares** - Formas (círculo, cuadrado, triángulo) y colores personalizables
- 🔨 **Modo construcción** - Crea y edita módulos interactivos que persisten
- 🚶 **Movimiento fluido** - Control con WASD o click-to-move
- 📱 **Responsive** - Se adapta a cualquier tamaño de pantalla
- 🎯 **Límites visuales claros** - Bordes y flechas que indican transiciones de habitación

## 🚀 Inicio Rápido

### ⚠️ Configuración Requerida

Este proyecto requiere una base de datos Supabase. **Lee primero:** [SETUP_SUPABASE.md](SETUP_SUPABASE.md)

### 1. Configurar Base de Datos

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el schema SQL: `supabase/schema.sql`
3. Copia las credenciales (URL y keys)

### 2. Variables de Entorno

**Raíz del proyecto (`.env`):**
```env
VITE_SERVER_URL=http://localhost:3001
VITE_SUPABASE_URL=tu-url
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Servidor (`server/.env`):**
```env
SUPABASE_URL=tu-url
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key
PORT=3001
```

### 3. Frontend

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El cliente se ejecutará en `http://localhost:3000`

### 4. Backend (Servidor Multijugador)

## 📁 Estructura del Proyecto

```
modular/
├── src/
│   ├── components/        # Componentes React
│   │   ├── WorldCanvas.tsx       # Canvas principal del mundo
│   │   ├── ChatPanel.tsx         # Panel de chat
│   │   ├── ModuleEditor.tsx      # Editor de módulos
│   │   ├── AvatarCustomizer.tsx  # Personalizador de avatar
│   │   ├── AuthDialog.tsx        # ✨ Login/Registro
│   │   └── ui/                   # Componentes de UI
│   ├── contexts/
│   │   └── AuthContext.tsx       # ✨ Context de autenticación
│   ├── lib/
│   │   └── supabase.ts           # ✨ Cliente Supabase
│   ├── hooks/
│   │   └── useMultiplayer.ts     # Hook de multijugador
│   └── App.tsx            # Componente principal
├── server/
│   ├── config/
│   │   └── supabase.js           # ✨ Config Supabase servidor
│   ├── index.js           # ✨ Servidor Socket.io + Supabase
│   └── package.json       # Dependencias del servidor
├── supabase/
│   └── schema.sql         # ✨ Schema de base de datos
├── SETUP_SUPABASE.md      # ✨ Guía de configuración
├── IMPLEMENTACION.md      # ✨ Detalles de implementación
└── package.json           # Dependencias del frontend

✨ = Nuevo/actualizado con Supabase
```
Abre `http://localhost:3000` y:
- Juega como invitado (sin guardar progreso)
- O regístrate para guardar tu progreso

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
## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool y dev server
- **Socket.io Client** - WebSocket client
- **Supabase** - Base de datos y autenticación ✨
- **Framer Motion** - Animaciones
- **Radix UI** - Componentes accesibles
- **Tailwind CSS** - Estilos

### Backend
- **Node.js** - Runtime
- **Express** - Web server
- **Socket.io** - WebSocket server en tiempo real
- **Supabase** - PostgreSQL database ✨
## 📝 Variables de Entorno

**Frontend (`.env` en raíz):**
```env
VITE_SERVER_URL=http://localhost:3001
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Backend (`server/.env`):**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-role-key
PORT=3001
NODE_ENV=development
```

Ver `.env.example` y `server/.env.example` para plantillas completas.

⚠️ **IMPORTANTE**: Nunca subas archivos `.env` a Git. El `service_role_key` solo debe estar en el servidor.
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
  