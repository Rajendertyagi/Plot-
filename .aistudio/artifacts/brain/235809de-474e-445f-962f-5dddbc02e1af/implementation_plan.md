# Unified Single-Executable Architecture Plan (GUI + Headless Web Server in One Binary)

## 1. Concept: Unified Single-Binary Mode Switch

Instead of two separate binaries, a single **`projectflow.exe`** handles both modes dynamically based on command-line flags:

```
Double-click projectflow.exe            ───► Launches Native Desktop GUI (Tauri + WebView2)
start-desktop-mode.bat                  ───► Launches Native Desktop GUI (Tauri + WebView2)
start-web-mode.bat (projectflow.exe -s) ───► Launches Headless Web Server (Axum on http://localhost:3000)
```

---

## 2. Why Single-EXE is Superior

1. **Only One Binary to Build & Ship**:
   - Simplifies CI (`cargo build --release`), packaging, and releases.
   - Zero binary bloat: The user only sees and downloads a single `projectflow.exe`.
2. **Zero Dependencies for Web Mode**:
   - `start-web-mode.bat` simply calls `projectflow.exe --server` and opens `http://localhost:3000`. No Node.js, no Bun, no external server required.
3. **Shared Memory & Codebase**:
   - Same `std::fs` atomic read/write logic for `./data/projects.json` used by both the GUI IPC handler and the Axum HTTP REST router.
4. **CLI Flexibility**:
   - Supports:
     - `projectflow.exe` (Default: GUI mode)
     - `projectflow.exe --server` or `projectflow.exe -s` (Web server mode)
     - `projectflow.exe --server --port 8080` (Custom port)
     - `projectflow.exe --server --open` (Starts server and automatically opens default browser)

---

## 3. Architecture & Implementation Plan

### Phase 1: Dependencies in `src-tauri/Cargo.toml`
- Add lightweight web server crates:
  - `axum = "0.8"` (or `0.7`)
  - `tower-http = { version = "0.6", features = ["fs", "cors"] }`
  - `tokio = { version = "1", features = ["full"] }`

### Phase 2: Web Server Router (`src-tauri/src/server.rs`)
- Implement the Axum web server module:
  - `GET /api/data` -> Reads `./data/projects.json`.
  - `POST /api/data` -> Atomically saves payload to `./data/projects.json`.
  - `GET /api/prompts` & `POST /api/prompts` -> Reads/saves `./data/prompts.json`.
  - Static file fallback with `tower_http::services::ServeDir` pointing to `./web` next to the executable.

### Phase 3: CLI Mode Detection in `src-tauri/src/main.rs`
- In `main()`:
  - Inspect `std::env::args()`:
    - If `--server`, `-s`, or `--headless` is present:
      - Start Tokio runtime and run `server::start_server(port, open_browser)`.
    - Otherwise:
      - Set `WEBVIEW2_USER_DATA_FOLDER` to `./data/webview` and boot the standard Tauri GUI application.

### Phase 4: Frontend API Layer (`src/services/api.ts`)
- Update `apiService`:
  - When in browser/web mode, attempt `fetch('/api/data')` first.
  - If server responds (running under `projectflow.exe --server`), persist directly to disk via HTTP.
  - If offline/static without server, gracefully fallback to `localStorage`.

### Phase 5: Launchers & CI
- Update `start-web-mode.bat`:
  ```bat
  @echo off
  echo Starting ProjectFlow Web Server...
  start "" "projectflow.exe" --server --open
  ```
- Update `start-desktop-mode.bat`:
  ```bat
  @echo off
  start "" "projectflow.exe"
  ```
- CI workflow builds a single clean binary: `projectflow.exe`.
