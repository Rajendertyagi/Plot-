@echo off
setlocal
title ProjectFlow Web Server
cd /d "%~dp0"

echo =======================================================
echo          ProjectFlow - Native Web Server Mode
echo =======================================================
echo.

if exist "projectflow.exe" (
    echo [INFO] Starting native high-performance Rust web server...
    echo [INFO] Opening default browser at http://localhost:3000...
    echo.
    projectflow.exe --server --open
    goto end
)

REM Fallback for development environments before binary compilation
where bun >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [DEV] Binary not found, launching with Bun...
    bun x vite preview --port 3000
    goto end
)

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [DEV] Binary not found, launching with Node/npx...
    npx vite preview --port 3000
    goto end
)

echo [ERROR] projectflow.exe not found.
echo Please run the executable directly or build it with: bun run tauri build
pause

:end
endlocal
