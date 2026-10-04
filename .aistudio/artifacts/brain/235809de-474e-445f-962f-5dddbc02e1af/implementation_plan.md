# Transition to Pure Vite & Remove Express Server

Completely removes the Express.js server (`server.ts`) and Node backend dependencies from ProjectFlow. Transitions the web preview to a lightweight, zero-backend Vite server with browser-based (`localStorage`) persistence, while keeping the native Rust/Tauri desktop executable 100% self-contained.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Summary of Confirmed Architectural Direction:**
> - **Remove Express Server**: Delete `server.ts` and remove Express dependencies (`express`, `@types/express`).
> - **Pure Vite Frontend**: Update development scripts to run standard Vite directly on port 3000 (`vite --port 3000 --host 0.0.0.0`).
> - **Browser Storage Fallback**: In web preview mode, replace the `/api/data` HTTP endpoints with robust browser `localStorage` persistence and initial seed data, so all task creations, status updates, and edits persist seamlessly across page refreshes with zero backend.
> - **Preserve Native Rust Desktop Mode**: The Windows desktop app (`projectflow.exe`) continues to use native Rust/Tauri IPC to read and write files directly to disk without any Node/Express footprint.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Eliminates all server-side Node.js / Express code from the repository.
  - The web application becomes a 100% client-side Single Page Application (SPA) running directly on Vite.
  - When running as a native Windows desktop app, it communicates directly with Rust.
  - When running in a web browser or cloud preview, it saves state locally in the browser with immediate reactivity.

- **Target Persona**: Developers and solo builders who want a clean, fast, dependency-minimal architecture without unnecessary backend middleware.

- **Key Value**:
  - Radically faster startup time.
  - Zero server crash risks or port conflict issues.
  - A leaner codebase that is 100% ready for future Rust/Axum services when needed.

---

### 2. User Experience & Visual Design

- **Zero UI Disruption**: The Kanban board, feature hierarchy, status columns, detail view, and file browser UI remain completely unchanged.
- **Persistence Indicator**: Add a subtle, clean indicator in the footer or settings dialog indicating the active storage mode:
  - `Native Desktop (Rust IPC)` when running in `projectflow.exe`.
  - `Browser Storage (Local)` when running in web preview.
- **Data Export / Import**: Ensure the user can export and import their `projects.json` file at any time with a single click, allowing easy backup or migration between desktop and web modes.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Vite Dev Server vs. Custom Node Script**:
  - *Chosen Approach*: Configure `package.json` with `"dev": "vite --port 3000 --host 0.0.0.0"` and `"build": "vite build"`.
  - *Why*: Standard Vite is fast, modern, and officially supported by AI Studio.
  - *Alternative Considered*: Writing a custom Bun or Node HTTP script (rejected to avoid unnecessary custom maintenance).

- **Decision 2: LocalStorage Web Fallback for Project State**:
  - *Chosen Approach*: When `isTauriDesktop()` is false, `api.ts` seamlessly reads and writes from `localStorage`, seeded initially with the default project data.
  - *Why*: Gives the user an instant, functional web preview without needing any active backend process.
  - *Alternative Considered*: Read-only in web mode (rejected because users need to interact with the board in preview).

- **Decision 3: Cleaning Up Obsolete Windows Scripts**:
  - *Chosen Approach*: Update `start-web-mode.bat` to run `npx vite preview` (or remove if only desktop mode is desired), and ensure `start-desktop-mode.bat` points directly to `projectflow.exe`.
  - *Why*: Eliminates confusion around Node/Bun dependencies on Windows.

---

### 4. Technical Architecture & Transition Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 CURRENT HYBRID ARCHITECTURE                 │
│                                                             │
│  [ React Frontend ] ──▶ [ server.ts (Express) ] ──▶ Disk   │
│         ▲                                                   │
│         └─── (Or Tauri IPC in desktop mode) ───────▶ Rust   │
└─────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEW CLEAN ARCHITECTURE                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                React Frontend (SPA on Vite)           │  │
│  └───────────────┬───────────────────────────────┬───────┘  │
│                  │                               │          │
│   (If Web / Cloud Preview)             (If Desktop Mode)     │
│                  ▼                               ▼          │
│       ┌────────────────────┐          ┌──────────────────┐  │
│       │ Browser Storage    │          │ Native Rust /    │  │
│       │ (localStorage)     │          │ Tauri IPC        │  │
│       │ + JSON Import/Exp  │          │ (projectflow.exe)│  │
│       └────────────────────┘          └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Step-by-Step Execution Plan:
1. **Update `src/services/api.ts`**:
   - Provide a seamless client-side storage adapter when `isTauriDesktop()` is false:
     - `loadProjects()`: Reads from `localStorage` (or loads default seed if empty).
     - `saveProjects()`: Writes to `localStorage`.
     - `exportProjects()` / `importProjects()`: Allows downloading/uploading JSON files.
2. **Update `src/services/fsApi.ts`**:
   - For web mode, provide an in-memory / local virtual file adapter so the code editor and file viewer functions cleanly without trying to reach `/api/fs/*`.
3. **Delete `server.ts`**:
   - Remove `server.ts` and delete unnecessary server files.
4. **Update `package.json`**:
   - Change dev scripts to `"dev": "vite --port 3000 --host 0.0.0.0"` and `"start": "vite preview --port 3000 --host 0.0.0.0"`.
   - Remove `express` and `@types/express`.
5. **Update Windows scripts & documentation**:
   - Ensure `start-desktop-mode.bat` and `README.txt` reflect the clean, standalone setup.

---

### Verification & Testing Plan

1. **Vite Compilation & Dev Server Verification**:
   - Run `restart_dev_server` and `compile_applet` to confirm Vite binds to port 3000 cleanly without Express.
2. **Web Mode State Verification**:
   - Add a task, change a status column, refresh the browser, and verify data persists in `localStorage`.
3. **Import/Export Verification**:
   - Test exporting `projects.json` to verify the user can download their project file at any time.
4. **Build Verification**:
   - Run `npm run build` to confirm production dist builds with zero errors.
