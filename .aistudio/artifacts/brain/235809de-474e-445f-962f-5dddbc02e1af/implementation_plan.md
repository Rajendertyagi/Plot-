# ProjectFlow — Full-Stack Modular Architecture & Disk JSON Persistence

Refactor ProjectFlow into a production-ready, full-stack application featuring server-side JSON file persistence (`data/projects.json`), an organized domain-driven folder structure, and a centralized CSS design token architecture.

> [!IMPORTANT]
> **User-Confirmed Directives**:
> - **Server-Backed JSON Persistence**: Read and write all application data (projects, features, tasks, custom columns) directly to a persistent JSON file on disk (`data/projects.json`) through a local Express API.
> - **Centralized CSS Architecture**: A structured `src/styles/` directory utilizing CSS custom properties (design tokens for obsidian surfaces, shadows, status colors, and typography) and semantic reusable component classes.
> - **Modular Project Structure**: Complete separation of concerns into dedicated directories (`components/`, `services/`, `hooks/`, `types/`, `styles/`, `constants/`).

---

### 1. Architectural Overview & System Flow

```
┌────────────────────────────────────────────────────────┐
│ Client (React 19 + TypeScript + Vite)                  │
│                                                        │
│  UI Components (Header, TreeTaskNode, FeatureSection)  │
│        ▲                                               │
│        │ React State & Optimistic UI                   │
│        ▼                                               │
│  useProjectData Hook ──► services/api.ts               │
└───────────────────────────────┬────────────────────────┘
                                │ HTTP GET / POST /api/data
                                ▼
┌────────────────────────────────────────────────────────┐
│ Full-Stack Server (server.ts with Express + Vite)      │
│ Port 3000                                              │
│                                                        │
│  GET  /api/data         ──► Read data/projects.json    │
│  POST /api/data         ──► Atomic Write to disk       │
│  POST /api/data/reset   ──► Restore Default Seed       │
│  GET  /api/data/export  ──► Download JSON File         │
└───────────────────────────────┬────────────────────────┘
                                │ File System I/O
                                ▼
┌────────────────────────────────────────────────────────┐
│ Disk Storage: data/projects.json                       │
│ (Persistent, editable JSON database on disk)           │
└────────────────────────────────────────────────────────┘
```

---

### 2. Target File & Folder Hierarchy

Refactor the flat component list into a modular, industry-standard project structure:

```
├── data/
│   └── projects.json                  # Persistent disk JSON database
├── server.ts                          # Express server + Vite middlewares + JSON REST API
├── src/
│   ├── assets/                        # SVG icons and visual assets
│   ├── components/
│   │   ├── common/                    # Reusable primitive UI
│   │   │   ├── ProjectModal.tsx       # Create/edit project dialog
│   │   │   ├── FeatureModal.tsx       # Create/edit feature specification dialog
│   │   │   ├── TaskModal.tsx          # Create/edit task dialog
│   │   │   └── ColumnManagerModal.tsx # Configure workflow stages & colors
│   │   ├── features/                  # Domain-specific feature views
│   │   │   ├── FeatureSection.tsx     # Feature card container & specs
│   │   │   ├── TreeTaskNode.tsx       # Expandable tree row with subtasks
│   │   │   └── TaskCard.tsx           # Multi-column Kanban card
│   │   ├── layout/                    # Shell and navigation
│   │   │   ├── Header.tsx             # Top navbar, project selector, search
│   │   │   └── ProjectSidebar.tsx     # Left project navigation & metrics
│   │   └── project/                   # Project views
│   │       └── ProjectOverview.tsx    # Scope banner, pipeline stats & features list
│   ├── constants/
│   │   ├── colors.ts                  # Status badge styles & glowing accents
│   │   └── initialSeed.ts             # Default starter seed for fresh JSON generation
│   ├── hooks/
│   │   └── useProjectData.ts          # Central data hook with server sync & optimistic updates
│   ├── services/
│   │   └── api.ts                     # API client for reading/writing data/projects.json
│   ├── styles/
│   │   ├── theme.css                  # CSS custom properties (obsidian tokens, shadows)
│   │   ├── components.css             # Reusable semantic classes (.btn-pill, .card-obsidian)
│   │   └── index.css                  # Master CSS entrypoint importing tokens & Tailwind
│   ├── types/
│   │   └── index.ts                   # Domain models (Project, Feature, Task, Subtask, Column)
│   ├── App.tsx                        # Root application component
│   └── main.tsx                       # React DOM entry point
├── package.json                       # Scripts: "dev": "tsx server.ts", "start": "node server.ts"
└── tsconfig.json
```

---

### 3. Server-Side Disk JSON API Implementation

1. **`server.ts` Configuration**:
   - Mount Express server with JSON body parsing (`express.json({ limit: '10mb' })`).
   - Check if `data/projects.json` exists; if not, automatically seed it with rich starter data.
   - Endpoints:
     - `GET /api/data`: Returns the current JSON payload.
     - `POST /api/data`: Atomically writes the updated JSON state to `data/projects.json` with formatted indentation (`JSON.stringify(data, null, 2)`).
     - `POST /api/data/reset`: Re-seeds the file with the default project templates.
     - `GET /api/data/export`: Sends the raw `projects.json` as a downloadable file attachment.
   - Mount `vite.middlewares` in dev mode and serve on port 3000.
2. **`package.json` Updates**:
   - Ensure `"dev": "tsx server.ts"` and `"start": "node server.ts"`.
   - Add `tsx` and `@types/express` if needed.

---

### 4. Centralized CSS Design Token System

Create a dedicated `src/styles/` suite to replace raw inline styling with a maintainable design system:

- **`src/styles/theme.css`**:
  - Surface variables: `--color-canvas: #0d0d0d;`, `--color-panel: #121214;`, `--color-surface: #17171a;`, `--color-card: #1f1f23;`
  - Shadow tokens:
    - `--shadow-ambient: 0 4px 20px -2px rgba(0, 0, 0, 0.4);`
    - `--shadow-floating: 0 12px 36px -4px rgba(0, 0, 0, 0.7);`
    - `--shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.2);`
  - Text contrast tokens: `--text-primary: #f4f4f5;`, `--text-secondary: #a1a1aa;`, `--text-muted: #71717a;`
- **`src/styles/components.css`**:
  - Reusable button pills (`.btn-pill-white`, `.btn-pill-ghost`, `.btn-pill-subtle`).
  - Container classes (`.surface-obsidian`, `.card-flat-elevated`).
  - Tree branch connectors (`.tree-guide-vertical`, `.tree-guide-horizontal`).
- **`src/styles/index.css`**:
  - Combines Tailwind CSS with the design tokens.

---

### 5. Verification & Testing Plan

1. Verify server boots on port 3000 with Express and mounts Vite middlewares.
2. Verify `data/projects.json` is created on disk and inspectable.
3. Test making changes in UI (adding features, updating tasks, creating subtasks) and confirm changes write directly into `data/projects.json`.
4. Verify hot reload, TypeScript compilation, and lint validation.
