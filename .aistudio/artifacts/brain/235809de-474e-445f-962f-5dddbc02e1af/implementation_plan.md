# Windows x64 Dual-Mode Architecture: Port 4000 & External 'web/' Folder

Customized specifically for your Windows x64 environment:
- **Port 4000**: Web Mode runs on `http://localhost:4000`.
- **External `web/` Folder Next to `.exe`**: Built frontend assets (`dist/` renamed to `web/`) sit cleanly alongside the executable in the portable folder.
- **Zero Docker**: 100% native Windows processes.
- **Zero AppData**: All user profiles, webview storage, and project data are self-contained in `./data/`.
- **Automated CI/CD**: GitHub Actions workflow builds the frontend using **Bun**, compiles the binary, and outputs a ready-to-run portable `.zip`.

---

## 1. Portable Folder Layout (Windows x64)

Inside `projectflow-windows-x64-portable.zip`:

```
projectflow-windows-x64-portable/
├── projectflow.exe          # Native Windows x64 executable (~8MB)
├── web/                     # Built frontend assets (next to the .exe)
│   ├── index.html
│   └── assets/
│       ├── index.js
│       └── index.css
├── data/                    # 100% self-contained data (Zero AppData)
│   ├── projects.json        # Projects, roadmap, features, and tasks
│   └── webview/             # Isolated WebView2 cache & local storage
├── start-web-mode.bat       # One-click launcher for Web Mode (port 4000)
├── start-desktop-mode.bat   # One-click launcher for Native Desktop Window
└── README.txt               # Quickstart guide
```

---

## 2. Dual-Mode Operation (Port 4000)

1. **Web Mode (Browser on Port 4000)**:
   - Launches a lightweight web server bound to `http://localhost:4000`.
   - Serves the adjacent `./web` folder and handles REST endpoints (`/api/data`, `/api/fs/*`).
   - Open any browser (Chrome, Edge, Firefox) at `http://localhost:4000`.
   - Accessible to other devices on your local Wi-Fi / LAN if desired.

2. **Desktop Mode (Native Window)**:
   - Runs `projectflow.exe` directly.
   - Loads the interface from the local `./web` folder via Windows native Edge WebView2.
   - User data and WebView2 cache are isolated strictly to `./data/webview/`.
   - Requires zero Node, Bun, or Python on the user's machine.

---

## 3. GitHub Actions CI/CD Workflow (`.github/workflows/build-portable.yml`)

The automated workflow:
- **Runner**: `windows-latest`
- **Build Tool**: **Bun** (`oven-sh/setup-bun@v2`) for ultra-fast dependency installation and compilation.
- **Rust Toolchain**: `dtolnay/rust-toolchain@stable` + `Swatinem/rust-cache@v2`.
- **Pipeline Steps**:
  1. `bun install`
  2. `bun run build` (outputs to `dist/`)
  3. Compile Windows x64 executable.
  4. Assemble portable package:
     - Copy executable to `projectflow-windows-x64-portable/`
     - Copy `dist/` as `web/` directly next to `projectflow.exe`
     - Create initialized `data/` directory
     - Add `start-web-mode.bat` and `start-desktop-mode.bat` launchers configured for port 4000
  5. Compress into `projectflow-windows-x64-portable.zip`
  6. Publish release on GitHub.

---

## 4. Key Files to Implement

1. **`src-tauri/tauri.conf.json` & `src-tauri/src/main.rs`**:
   - Configures the desktop app to load assets from the adjacent `../web` folder.
   - Pins WebView2 user data to `./data/webview`.
   - Provides native local file system operations.
2. **`server.ts` & Port 4000 Support**:
   - Updates server port configuration to default to `4000` (with env override support).
   - Configures static file serving from `./web` when running in standalone mode.
3. **`src/services/fsApi.ts`**:
   - Seamless dual-mode detection (uses desktop IPC when running natively, or `http://localhost:4000/api/*` in web mode).
4. **`.github/workflows/build-portable.yml`**:
   - Complete GitHub Actions workflow with Bun and Windows x64 zip packaging.
5. **Launcher Batch Scripts**:
   - `start-web-mode.bat` and `start-desktop-mode.bat` for instant double-click execution on Windows.

---

## 5. User Review & Approval
Please click **Proceed** to implement the port 4000 configuration, external `web/` folder structure, Tauri v2 scaffold, and GitHub Actions workflow.
