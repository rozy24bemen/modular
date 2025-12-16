# ✅ Checklist de Activación

Usa este checklist para activar tu proyecto multijugador paso a paso.

---

## 📋 Pre-requisitos

- [ ] Node.js 16+ instalado
- [ ] npm o yarn instalado
- [ ] Cuenta en Supabase (gratis)
- [ ] Editor de código (VS Code recomendado)

---

## 🗄️ Configuración de Base de Datos

### 1. Crear Proyecto Supabase
- [ ] Ir a [supabase.com](https://supabase.com)
- [ ] Crear cuenta (si no tienes)
- [ ] Click en "New Project"
- [ ] Nombre del proyecto: `modular-world` (o el que prefieras)
- [ ] Contraseña de BD: (guárdala en un lugar seguro)
- [ ] Región: Elegir la más cercana
- [ ] Click "Create new project"
- [ ] ⏰ Esperar 2-3 minutos a que se inicialice

### 2. Obtener Credenciales
- [ ] Ve a Settings → API
- [ ] Copia **Project URL** (ej: `https://abcdefgh.supabase.co`)
- [ ] Copia **anon public** key (comienza con `eyJhbGc...`)
- [ ] Copia **service_role** key (también comienza con `eyJhbGc...`)
- [ ] ⚠️ NO compartas el service_role key

### 3. Ejecutar Schema SQL
- [ ] En tu proyecto Supabase, abre **SQL Editor** (menú izquierdo)
- [ ] Click en **New query**
- [ ] Abre el archivo `supabase/schema.sql` en tu editor
- [ ] Copia TODO el contenido (Ctrl+A, Ctrl+C)
- [ ] Pega en el editor SQL de Supabase
- [ ] Click en **Run** (o F5)
- [ ] Verifica que aparezca "Success. No rows returned"

### 4. Verificar Tablas
- [ ] Ve a **Table Editor** (menú izquierdo)
- [ ] Deberías ver estas 7 tablas:
  - [ ] users
  - [ ] rooms
  - [ ] modules
  - [ ] inventory
  - [ ] achievements
  - [ ] friendships
  - [ ] chat_messages

---

## ⚙️ Configuración del Proyecto

### 1. Variables de Entorno - Frontend

- [ ] En la raíz del proyecto, crea un archivo `.env`
- [ ] Copia el contenido de `.env.example`
- [ ] Completa con tus valores:

```env
VITE_SERVER_URL=http://localhost:3001
VITE_SUPABASE_URL=https://[tu-proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc[...]
```

- [ ] Guarda el archivo

### 2. Variables de Entorno - Backend

- [ ] En la carpeta `server/`, crea un archivo `.env`
- [ ] Copia el contenido de `server/.env.example`
- [ ] Completa con tus valores:

```env
SUPABASE_URL=https://[tu-proyecto].supabase.co
SUPABASE_ANON_KEY=eyJhbGc[...]
SUPABASE_SERVICE_KEY=eyJhbGc[tu-service-key]
PORT=3001
NODE_ENV=development
```

- [ ] Guarda el archivo
- [ ] ⚠️ NUNCA subas este archivo a Git

---

## 📦 Instalación de Dependencias

### Frontend
```bash
# En la raíz del proyecto
npm install
```
- [ ] Ejecutado sin errores
- [ ] Se instaló `@supabase/supabase-js`

### Backend
```bash
cd server
npm install
```
- [ ] Ejecutado sin errores
- [ ] Se instaló `@supabase/supabase-js`
- [ ] Se instaló `dotenv`

---

## 🔄 Reemplazar Servidor

```bash
cd server
```

- [ ] Renombrar servidor antiguo:
```bash
mv index.js index-old.js
```

- [ ] Renombrar servidor nuevo:
```bash
mv index-new.js index.js
```

- [ ] Verificar:
```bash
ls index*.js
# Deberías ver: index.js e index-old.js
```

---

## 🚀 Iniciar el Proyecto

### Terminal 1 - Backend
```bash
cd server
npm start
```

**Verificar:**
- [ ] Aparece: `🚀 Multiplayer server running on port 3001`
- [ ] Aparece: `✅ Supabase connection successful`
- [ ] NO aparece: `❌ Supabase connection failed`

### Terminal 2 - Frontend
```bash
# En la raíz del proyecto
npm run dev
```

**Verificar:**
- [ ] Aparece: `Local: http://localhost:3000`
- [ ] Se abre el navegador automáticamente
- [ ] Ves la interfaz del juego

---

## 🧪 Pruebas de Funcionalidad

### 1. Modo Invitado
- [ ] La página carga correctamente
- [ ] Puedes mover el avatar con WASD
- [ ] Ves "Guest" en la esquina superior derecha
- [ ] Puedes abrir el chat (panel derecho)

### 2. Registro de Usuario
- [ ] Click en "Iniciar Sesión" (esquina superior derecha)
- [ ] Tab "Registrarse"
- [ ] Llena el formulario:
  - Username: `testuser`
  - Email: `test@example.com`
  - Password: `test123`
- [ ] Click "Crear Cuenta"
- [ ] Se cierra el diálogo
- [ ] Aparece tu username en lugar de "Guest"

### 3. Persistencia de Módulos
- [ ] Activa "Modo Construcción" (icono martillo)
- [ ] Click en el mundo para crear un módulo
- [ ] Cambia su forma/color en el panel derecho
- [ ] Recarga la página (F5)
- [ ] **El módulo sigue ahí** ✨

### 4. Chat Persistente
- [ ] Envía un mensaje en el chat
- [ ] Recarga la página (F5)
- [ ] **El mensaje sigue ahí** ✨

### 5. Multijugador
- [ ] Abre una pestaña de incógnito
- [ ] Ve a `localhost:3000`
- [ ] Mueve el avatar en una ventana
- [ ] **Deberías verlo moverse en la otra ventana** ✨

---

## 🔍 Verificación en Supabase

### Comprobar Datos Guardados

1. **Usuarios**
   - [ ] Ve a Table Editor → users
   - [ ] Ves tu usuario registrado

2. **Habitaciones**
   - [ ] Ve a Table Editor → rooms
   - [ ] Ves al menos una habitación (0, 0)

3. **Módulos**
   - [ ] Ve a Table Editor → modules
   - [ ] Ves los módulos que creaste

4. **Chat**
   - [ ] Ve a Table Editor → chat_messages
   - [ ] Ves tus mensajes guardados

---

## 🐛 Troubleshooting

### Error: "Failed to load room"

**Posible causa:** Schema SQL no se ejecutó correctamente

**Solución:**
- [ ] Ve a Supabase → Table Editor
- [ ] Verifica que existan las 7 tablas
- [ ] Si no están, re-ejecuta el schema SQL

---

### Error: "Connection failed" en logs del servidor

**Posible causa:** Variables de entorno incorrectas

**Solución:**
- [ ] Verifica que `server/.env` existe
- [ ] Verifica que `SUPABASE_URL` es correcto
- [ ] Verifica que `SUPABASE_SERVICE_KEY` es correcto (no el anon key)
- [ ] Reinicia el servidor

---

### Los módulos no persisten al recargar

**Posible causa:** No se reemplazó el servidor

**Solución:**
- [ ] Ve a `server/`
- [ ] Verifica que `index.js` es el nuevo (tiene imports de Supabase)
- [ ] Si no, ejecuta: `mv index-old.js index-backup.js && mv index-new.js index.js`
- [ ] Reinicia el servidor

---

### Socket.io no conecta

**Posible causa:** Variable `VITE_SERVER_URL` incorrecta

**Solución:**
- [ ] Verifica que `.env` existe en la raíz
- [ ] Verifica que `VITE_SERVER_URL=http://localhost:3001`
- [ ] Reinicia el servidor frontend (Ctrl+C y `npm run dev`)
- [ ] Abre DevTools → Console, busca errores

---

### Errores de TypeScript en VS Code

**Causa:** Dependencias no instaladas

**Solución:**
- [ ] Ejecuta `npm install` en la raíz
- [ ] Ejecuta `npm install` en `server/`
- [ ] Reinicia VS Code (Ctrl+Shift+P → "Reload Window")

---

## ✅ Checklist Final

Si todos estos puntos están marcados, ¡tu proyecto está funcionando!

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Conexión a Supabase exitosa
- [ ] Puedo registrar una cuenta
- [ ] Los módulos persisten
- [ ] El chat persiste
- [ ] Multijugador funciona
- [ ] Veo datos en Supabase Table Editor

---

## 🎉 ¡Listo!

Si llegaste hasta aquí y todos los checkboxes están marcados, 
¡tu mundo virtual multijugador está completamente funcional!

**Próximos pasos:**
- Lee `SETUP_SUPABASE.md` para más detalles
- Lee `DEPLOYMENT_SUPABASE.md` para deployment
- Experimenta y personaliza tu mundo

---

## 📞 Recursos de Ayuda

- **Documentación Supabase:** https://supabase.com/docs
- **Documentación Socket.io:** https://socket.io/docs/v4/
- **React + TypeScript:** https://react-typescript-cheatsheet.netlify.app/

¡Disfruta construyendo tu mundo virtual! 🌍✨
