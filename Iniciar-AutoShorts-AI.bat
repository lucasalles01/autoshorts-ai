@echo off
title AutoShorts AI — Launcher
color 0A

set "NODEJS=C:\Program Files\nodejs"
set "PATH=%NODEJS%;%APPDATA%\npm;%PATH%"
set "ROOT=%~dp0"

echo ============================================================
echo    AUTOSHORTS AI — INICIANDO SISTEMA
echo ============================================================
echo.

if not exist "%NODEJS%\node.exe" (
    echo [ERRO] Node.js nao encontrado. Instale em: https://nodejs.org
    pause & exit /b 1
)

echo [1/5] Compilando pacote shared...
cd /d "%ROOT%shared"
if not exist "node_modules" (
    "%NODEJS%\node.exe" "%NODEJS%\node_modules\npm\bin\npm-cli.js" install
)
"%NODEJS%\node.exe" "%NODEJS%\node_modules\npm\bin\npm-cli.js" run build

echo.
echo [2/5] Instalando Backend...
cd /d "%ROOT%backend"
if not exist "node_modules" (
    "%NODEJS%\node.exe" "%NODEJS%\node_modules\npm\bin\npm-cli.js" install
)
"%NODEJS%\node.exe" "%NODEJS%\node_modules\npm\bin\npm-cli.js" run db:push

echo.
echo [3/5] Verificando Frontend...
cd /d "%ROOT%frontend"
if not exist "node_modules" (
    "%NODEJS%\node.exe" "%NODEJS%\node_modules\npm\bin\npm-cli.js" install
)

echo.
echo [4/5] Iniciando Backend (porta 3001)...
cd /d "%ROOT%backend"
start "AutoShorts — Backend" "%NODEJS%\node.exe" "%NODEJS%\node_modules\npm\bin\npm-cli.js" run dev
timeout /t 4 /nobreak >nul

echo.
echo [5/5] Iniciando Frontend (porta 3000)...
cd /d "%ROOT%frontend"
start "AutoShorts — Frontend" "%NODEJS%\node.exe" "%NODEJS%\node_modules\npm\bin\npm-cli.js" run dev
timeout /t 6 /nobreak >nul

start "" "http://localhost:3000"

echo.
echo ============================================================
echo   SISTEMA ATIVO:
echo     Frontend : http://localhost:3000
echo     Backend  : http://localhost:3001
echo ============================================================
pause
