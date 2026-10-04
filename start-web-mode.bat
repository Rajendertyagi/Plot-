@echo off
setlocal
title ProjectFlow Web Server (Port 4000)

echo =======================================================
echo          ProjectFlow - Web Mode (Port 4000)
echo =======================================================
echo.
echo Starting ProjectFlow Web Server on http://localhost:4000 ...

set PORT=4000

REM Try launching with bun if available, otherwise node/npx
where bun >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Using Bun runtime]
    start "" http://localhost:4000
    bun run server.ts
    goto end
)

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [Using Node runtime]
    start "" http://localhost:4000
    npx tsx server.ts
    goto end
)

echo [Error] Neither Bun nor Node was found on your PATH to host the local dev server.
echo If you want standalone zero-dependency execution without Bun or Node,
echo please double-click "projectflow.exe" or "start-desktop-mode.bat" instead!
echo.
pause

:end
endlocal
