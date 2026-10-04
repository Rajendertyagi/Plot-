========================================================================
             ProjectFlow - Portable Windows x64 Application
========================================================================

Welcome to the portable release of ProjectFlow!

This package is 100% self-contained:
- Zero AppData residue: All cache, profile, and local storage data remain
  strictly inside the './data/' folder in this directory.
- No Node.js or Bun required for either Desktop or Web Mode.
- Runs anywhere, including USB thumb drives or external hard drives.

------------------------------------------------------------------------
RUNNING THE APP
------------------------------------------------------------------------

[Mode 1: Desktop Mode (Default GUI Window)]
- Simply double-click "projectflow.exe" or "start-desktop-mode.bat".
- Runs in a native, lightweight window with Edge WebView2.
- Reads and writes your project plans and tasks directly to "data/projects.json".

[Mode 2: Web Server Mode (Browser / LAN Access)]
- Double-click "start-web-mode.bat" or run:
    projectflow.exe --server --open
- Starts the built-in high-performance Rust web server (Port 3000) and opens
  your default browser to http://localhost:3000.
- Command-line flags supported:
    projectflow.exe --server --port 8080   (Custom port)
    projectflow.exe --server --host 0.0.0.0 (LAN network access)
    projectflow.exe --server --open         (Auto-open default browser)

------------------------------------------------------------------------
PORTABLE FOLDER STRUCTURE
------------------------------------------------------------------------
projectflow-windows-x64-portable/
├── projectflow.exe          -> Single native Windows x64 binary (GUI + Web Server)
├── web/                     -> Built frontend web assets (HTML, CSS, JS)
├── data/                    -> 100% self-contained local storage
│   ├── projects.json        -> Projects, features, columns & task data
│   ├── prompts.json         -> AI prompt templates
│   └── webview/             -> Isolated WebView2 cache (never in %APPDATA%)
├── start-desktop-mode.bat   -> Desktop GUI launcher
├── start-web-mode.bat       -> Web server launcher (Port 3000)
└── README.txt               -> This file
========================================================================
