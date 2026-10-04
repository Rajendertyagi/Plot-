# Modular Real Hierarchical Tree System with Linked Elements

Refactors the sidebar tree panel into a fully modular, extensible tree architecture. Upgrades the tree to a true multi-tier hierarchical system (Features → Tasks → Linked Code Files & Subtasks) complete with visual indentation guide lines, smart sorting controls (Status & Priority), and synchronized cross-view selection.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were clarified and confirmed:

- **Hierarchical Depth & Linked Elements (Confirmed)**:
  - **Level 1 (Feature Nodes)**: Feature title, task progress ratio (`2/5`), expand/collapse toggle, and management menu.
  - **Level 2 (Task Nodes)**: Task status indicator, title, priority tag, subtask counter, and linked file counter.
  - **Level 3 (Linked Code Files & Subtasks)**: Direct expand/collapse under tasks to reveal linked files (e.g. `src/App.tsx`, `server.ts`) with file icons, as well as subtasks with instant toggleable check states.
- **Smart Sorting & Controls (Confirmed)**:
  - Add a compact toolbar below the project row with Sort options:
    - **Smart (Recommended)**: Groups by active status (In Progress first), then by Priority (High → Medium → Low).
    - **Alphabetical**: A–Z by title.
    - **Status Flow**: Backlog → Todo → In Progress → Review → Done.
  - Quick "Expand All" / "Collapse All" tree toggles.
- **Node Selection & Synchronized Highlighting (Confirmed)**:
  - Clicking a Feature filters the canvas to that feature.
  - Clicking a Task highlights it and scrolls/focuses it in the active board/tree view.
  - Clicking a Linked File opens/highlights file context in the Codebase Explorer.
- **Modular Component Architecture (Confirmed)**:
  - Break monolithic code into decoupled, single-responsibility modules under `src/components/tree/` for effortless future extensibility:
    - `types.ts`: Type definitions for tree nodes, node kinds, sort options.
    - `treeUtils.ts`: Pure tree construction, smart sorting, and recursive filtering functions.
    - `TreeToolbar.tsx`: Sort selector, expand/collapse toggles, and count badges.
    - `TreeNodeItem.tsx`: High-performance recursive node renderer with tree guide lines and node-type icons.
    - `ResizableSidebar.tsx`: Clean orchestrator combining the topmost search box, project header, toolbar, and tree view.

---

## 1. Modular Architecture Overview

```
src/components/
├── layout/
│   ├── ResizableSidebar.tsx       # Orchestrator: Top Search + Project Row + Tree
│   └── CompactHeader.tsx          # Clean top breadcrumb header
└── tree/
    ├── types.ts                   # TreeNode interface, TreeFilter, SortOption
    ├── treeUtils.ts               # buildTreeData(), sortTreeNodes(), filterTree()
    ├── TreeToolbar.tsx            # Sort selector, Expand All / Collapse All
    ├── TreeNodeItem.tsx           # Multi-level node with guide lines & icon badges
    └── TreeView.tsx               # Virtual/scrolling tree container with empty states
```

---

## 2. Tree Visual Hierarchy & Guide Rails

```
┌────────────────────────────────────────────────────────┐
│ [🔍] Search tree, tasks, files...     [4 matches] [X]  │ <- Topmost full-width
├────────────────────────────────────────────────────────┤
│ [Folder] ProjectFlow Web           [~/desktop]   [...] │ <- Project metadata
├────────────────────────────────────────────────────────┤
│ Sort: [⚡ Smart (Priority)]       [⤢ Expand] [⤡ Fold]  │ <- Tree Toolbar
├────────────────────────────────────────────────────────┤
│ ▼ 📂 Authentication & RBAC                   [3/4] [...]
│   │
│   ├── ▼ 🟣 Implement Google OAuth Token Flow  [HIGH]
│   │   │   ├── 📄 src/auth/oauth.ts                     │ <- Linked Code File
│   │   │   ├── 📄 server.ts                             │ <- Linked Code File
│   │   │   ├── ☑ Token refresh rotation logic          │ <- Subtask (Done)
│   │   │   └── ☐ Popup fallback error modal            │ <- Subtask (Todo)
│   │   │
│   │   └── ▶ 🟢 Secure Session Persistence     [MED]
│   │
│   └── ▶ 📂 Database Sync & Cloud Backup        [1/2]
└────────────────────────────────────────────────────────┘
```

---

## 3. Key Technical Decisions & Data Flow

1. **Decoupled Tree Node Model (`TreeNode`)**:
   - Each node contains `{ id, label, kind, data, children, isExpanded, isSelected, level }`.
   - Adding a new child type in the future (e.g. test suites, API endpoints, git branches) only requires adding a case in `treeUtils.ts` without altering UI rendering logic.

2. **Smart Sorting Pipeline**:
   - Features sorted by progress / pending tasks.
   - Tasks sorted by status priority: `in-progress` (urgent) > `todo` > `backlog` > `done`, secondary sorted by priority (`high` > `medium` > `low`).
   - Toggles available via the `TreeToolbar`.

3. **Indentation & Visual Rails**:
   - CSS tree guide lines via left border lines and pseudo-connector lines (`border-l border-neutral-800/80 hover:border-neutral-700`).

---

## 4. Implementation Steps

1. **`src/components/tree/types.ts`**:
   - Define `TreeNodeKind = 'feature' | 'task' | 'file' | 'subtask'`.
   - Define `TreeSortMode = 'smart' | 'alphabetical' | 'status'`.
   - Define node interfaces and callback signatures.

2. **`src/components/tree/treeUtils.ts`**:
   - Implement `buildProjectTree()`: maps `features`, `tasks`, and their linked files and subtasks into a unified hierarchical structure.
   - Implement `sortTreeNodes()` and `filterTreeNodes()` with live query matching.

3. **`src/components/tree/TreeToolbar.tsx`**:
   - Minimal shadcn-styled toolbar with sort dropdown menu and expand/collapse all buttons.

4. **`src/components/tree/TreeNodeItem.tsx`**:
   - Renders node row according to its kind (`feature`, `task`, `file`, `subtask`).
   - Renders collapsible child container with vertical guide rail.
   - Handles selection and toggle actions.

5. **`src/components/tree/TreeView.tsx`**:
   - Encapsulates tree state (expanded node IDs, selection).
   - Renders the list of root nodes.

6. **`src/components/layout/ResizableSidebar.tsx`**:
   - Integrate `TreeView` and `TreeToolbar` beneath the topmost search box and project header.

7. **Verification**:
   - Run `lint_applet` and `compile_applet`.
   - Verify zero errors and verify linked files and subtasks expand smoothly with active selection.
