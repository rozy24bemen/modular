@echo off
echo ========================================
echo   MODULAR - Setup Helper
echo ========================================
echo.

:menu
echo Que quieres hacer?
echo.
echo 1. Instalar dependencias
echo 2. Configurar servidor (reemplazar index.js)
echo 3. Iniciar backend
echo 4. Iniciar frontend
echo 5. Iniciar ambos (en ventanas separadas)
echo 6. Verificar configuracion
echo 7. Salir
echo.
set /p choice="Elige una opcion (1-7): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto setup
if "%choice%"=="3" goto backend
if "%choice%"=="4" goto frontend
if "%choice%"=="5" goto both
if "%choice%"=="6" goto verify
if "%choice%"=="7" goto end
goto menu

:install
echo.
echo Instalando dependencias...
echo.
echo [Frontend]
call npm install
echo.
echo [Backend]
cd server
call npm install
cd ..
echo.
echo Dependencias instaladas!
pause
goto menu

:setup
echo.
echo Configurando servidor...
cd server
if exist index-new.js (
    if exist index.js (
        echo Respaldando index.js actual...
        move /y index.js index-old.js
    )
    echo Activando nuevo servidor...
    move /y index-new.js index.js
    echo Servidor configurado!
) else (
    echo ERROR: No se encuentra index-new.js
)
cd ..
pause
goto menu

:backend
echo.
echo Iniciando backend...
echo.
cd server
call npm start
cd ..
pause
goto menu

:frontend
echo.
echo Iniciando frontend...
echo.
call npm run dev
pause
goto menu

:both
echo.
echo Iniciando backend y frontend en ventanas separadas...
echo.
start "Modular Backend" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul
start "Modular Frontend" cmd /k "npm run dev"
echo.
echo Ambos servidores iniciados en ventanas separadas!
pause
goto menu

:verify
echo.
echo ========================================
echo   Verificacion de Configuracion
echo ========================================
echo.

echo [1] Verificando archivos .env...
if exist .env (
    echo [OK] .env existe en raiz
) else (
    echo [X] .env NO existe - Crealo desde .env.example
)

if exist server\.env (
    echo [OK] server\.env existe
) else (
    echo [X] server\.env NO existe - Crealo desde server\.env.example
)
echo.

echo [2] Verificando servidor...
if exist server\index.js (
    echo [OK] server\index.js existe
    findstr /C:"supabase" server\index.js >nul
    if errorlevel 1 (
        echo [!] ADVERTENCIA: index.js parece ser el antiguo
        echo     Ejecuta la opcion 2 para configurar el servidor nuevo
    ) else (
        echo [OK] Servidor nuevo detectado
    )
) else (
    echo [X] server\index.js NO existe
)
echo.

echo [3] Verificando dependencias...
if exist node_modules (
    echo [OK] node_modules existe en raiz
) else (
    echo [X] node_modules NO existe - Ejecuta opcion 1
)

if exist server\node_modules (
    echo [OK] server\node_modules existe
) else (
    echo [X] server\node_modules NO existe - Ejecuta opcion 1
)
echo.

echo [4] Checklist manual:
echo [ ] Creaste proyecto en Supabase
echo [ ] Ejecutaste supabase/schema.sql
echo [ ] Copiaste credenciales a .env
echo [ ] Copiaste credenciales a server/.env
echo.

echo ========================================
pause
goto menu

:end
echo.
echo Hasta luego!
exit
