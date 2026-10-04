========================================================================
             ProjectFlow - Portable Windows x64 Application
========================================================================

Welcome to the portable release of ProjectFlow!

This package is 100% self-contained:
- Zero AppData residue: All cache, profile, and local storage data remain
  strictly inside the './data/' folder in this directory.
- No Node.js or Bun required for Desktop Mode.
- Runs anywhere, including USB thumb drives or external hard drives.

------------------------------------------------------------------------
RUNNING THE APP
------------------------------------------------------------------------

[Mode 1: Desktop Mode (Recommended for standalone use)]
- Simply double-click "projectflow.exe" or "start-desktop-mode.bat".
- Runs in a native, lightweight window with Edge WebView2.
- Reads and writes your project plans and tasks directly to "data/projects.json".

[Mode 2: Web Mode (Port 4000)]
- Double-click "start-web-mode.bat".
- It starts the local server on Port 4000 and automatically opens your
  default browser to http://localhost:4000.

------------------------------------------------------------------------
PORTABLE FOLDER STRUCTURE
------------------------------------------------------------------------
projectflow-windows-x64-portable/
├── projectflow.exe          -> Native Windows x64 desktop binary
├── web/                     -> Built frontend web assets (HTML, CSS, JS)
├── data/                    -> 100% self-contained local storage
│   ├── projects.json        -> Projects, features, columns & task data
│   └── webview/             -> Isolated WebView2 cache (never in %APPDATA%)
├── start-desktop-mode.bat   -> Desktop launcher
├── start-web-mode.bat       -> Web launcher (Port 4000)
└── README.txt               -> This file
========================================================================
