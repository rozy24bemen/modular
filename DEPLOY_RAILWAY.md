# 🚂 Desplegar TODO en Railway

## Opción Simplificada: Un Solo Servicio

En lugar de usar Vercel + Railway separados, puedes desplegar **frontend + backend** juntos en Railway.

### 📦 Ventajas
- ✅ Una sola URL para todo
- ✅ Sin problemas de CORS
- ✅ Variables de entorno en un solo lugar
- ✅ Deploy automático desde GitHub
- ✅ Más barato ($5/mes vs $20+ Vercel Pro)

---

## 🚀 Pasos para Desplegar

### 1. Preparar el Proyecto

El servidor unificado ya está creado en `server/index-unified.js`. Este servidor:
- Sirve el frontend React compilado (carpeta `dist/`)
- Ejecuta el backend Socket.io
- Conecta con Supabase

### 2. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. "Start a New Project"
3. "Deploy from GitHub repo"
4. Selecciona tu repositorio `rozy24bemen/modular`
5. Railway detectará automáticamente que es un proyecto Node.js

### 3. Configurar Variables de Entorno

En el dashboard de Railway, ve a **Variables** y añade:

```bash
SUPABASE_URL=https://twlyxippzksdhotusdnm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3bHl4aXBwemtzZGhvdHVzZG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0MDE5NDUsImV4cCI6MjA0OTk3Nzk0NX0.FwexXa-IUxv_QYl6VEZQcILq9YVMVH9DxoT__T_iL-s
SUPABASE_SERVICE_KEY=tu-service-key-aqui
PORT=3001
NODE_ENV=production
```

⚠️ **Importante:** El `SUPABASE_SERVICE_KEY` lo encuentras en tu `.env` local (archivo `server/.env`)

### 4. Configurar Build Commands

Railway debería detectar automáticamente, pero si no:

**Settings → Build:**
```bash
npm install && cd server && npm install && cd .. && npm run build
```

**Settings → Deploy:**
```bash
cd server && node index-unified.js
```

O simplemente Railway leerá el archivo `railway.json` que ya incluimos.

### 5. Deploy

Railway automáticamente hará el deploy. Verás:
- ✅ Instalando dependencias...
- ✅ Compilando frontend...
- ✅ Iniciando servidor...

### 6. Obtener URL

Railway te dará una URL como:
```
https://modular-production-abc123.up.railway.app
```

¡Esa es tu aplicación completa funcionando!

---

## 🧪 Probar

1. Abre la URL de Railway
2. Deberías ver el frontend cargado
3. Registra una cuenta
4. Crea módulos - se guardarán en Supabase
5. Abre en otra pestaña - verás multijugador en tiempo real

---

## 💰 Costos

- **Railway Hobby Plan:** $5/mes
- **Railway Pro Plan:** $20/mes (más recursos)
- **Trial:** 500 horas gratis + $5 de crédito

---

## 🔧 Desarrollo Local

Para desarrollo, sigue usando:

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🆚 Railway vs Vercel

| Aspecto | Railway (Unificado) | Vercel + Railway |
|---------|---------------------|------------------|
| Complejidad | ⭐ Baja | ⭐⭐⭐ Alta |
| Costo | $5/mes | $20+/mes |
| URLs | 1 URL | 2 URLs |
| CORS | No necesario | Debe configurarse |
| Deploy | 1 comando | 2 comandos |
| Variables | 1 lugar | 2 lugares |

---

## ❓ FAQ

### ¿Qué pasa con Vercel?

Ya no lo necesitas. Railway puede servir el frontend estático igual que Vercel.

### ¿Y si ya tengo Vercel configurado?

Puedes mantenerlo. Solo necesitas:
1. Añadir `VITE_SERVER_URL=https://tu-railway.up.railway.app` en Vercel
2. Desplegar solo el backend en Railway (no el unificado)

### ¿Puedo usar Render en vez de Railway?

Sí, Render funciona igual. El tier gratis tiene cold starts, pero funciona.

---

## 🎉 Resultado Final

Una sola URL que contiene:
- ✅ Frontend React
- ✅ Backend Socket.io
- ✅ API REST
- ✅ Multijugador en tiempo real
- ✅ Conexión a Supabase

¡Todo funcionando desde un solo servicio! 🚀
