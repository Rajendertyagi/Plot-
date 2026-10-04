@echo off
setlocal
title ProjectFlow Web Server (Port 4000)

echo =======================================================
echo          ProjectFlow - Web Mode (Port 4000)
echo =======================================================
echo.

set PORT=4000
set NODE_ENV=production
set APP_DIR=%~dp0

echo Starting Web Mode on port 4000...
echo.

REM Delayed browser opener (waits 2 seconds for server to bind port)
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4000"

REM 1. Prefer Bun if available (instant, zero configuration)
where bun >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Using Bun runtime...
    cd /d "%APP_DIR%"
    bun x vite preview --port 4000
    goto end
)

REM 2. Fallback to Node.js / npx vite
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Using Node.js runtime...
    cd /d "%APP_DIR%"
    npx vite preview --port 4000
    goto end
)

echo.
echo [Notice] Neither Bun nor Node.js was found on your Windows PATH.
echo.
echo - For Desktop Mode (Zero runtime needed, 100% standalone):
echo   Double-click "projectflow.exe" or "start-desktop-mode.bat"
echo.
echo - For Web Mode:
echo   Install Bun from https://bun.sh or Node.js from https://nodejs.org
echo.
pause

:end
endlocal
