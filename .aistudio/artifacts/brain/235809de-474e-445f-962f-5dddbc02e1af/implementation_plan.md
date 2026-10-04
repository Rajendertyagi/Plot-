# Direct Project Folder Finder & Creation Flow Plan

Upgrades the project addition workflow by providing two first-class paths: **Open Folder from Finder** and **New Blank Project**, prominently accessible across the Activity Rail, Project Switcher Dropdown, and Empty State.

## User Decisions & Scope

> [!IMPORTANT]
> The following requirements were confirmed by the user:

- **Dual Creation Pathways (Confirmed)**:
  1. **Open Folder from Finder (`FolderSearch`)**: Directly launches the directory browser. Selecting a local directory automatically creates/prefills a project named after that folder and sets its `rootDirectory`.
  2. **New Blank Project (`Plus`)**: Opens the project modal to configure title, description, and custom settings from scratch.
- **Ubiquitous Placement (Confirmed)**:
  - **Activity Rail**: Provide dedicated Finder / Open Folder action alongside the New Project button, or a multi-option project add menu.
  - **Project Switcher Dropdown**: Clearly display both "Open Project Folder..." and "Create Blank Project".
  - **Empty State (`App.tsx`)**: Replace single button with dual action cards: "Open Local Repository / Folder" and "Create Blank Project".
  - **Project Modal**: Enhance directory picking so selecting a folder automatically populates the project name (if blank) and ensures modal layering (`z-index`) is clean and responsive.

---

## 1. UX & Component Improvements

### 1.1 Activity Rail (`src/components/layout/ActivityRail.tsx`)
- Add an **"Open Project Folder"** icon button (`FolderSearch`) directly on the rail right next to the `+` button.
- In the **Project Switcher Dropdown** (`Layers` icon):
  - Add an item: **"Open Project Folder from Finder..."** (`FolderSearch` icon, keyboard shortcut indicator).
  - Add an item: **"Create Blank Project..."** (`Plus` icon).
- Add tooltip: "Open Existing Project Folder (Finder)".

### 1.2 Empty Workspace State (`src/App.tsx`)
- Replace the single "Create First Project" button with a welcoming, dual-card or split button layout:
  - **Primary Card/Button**: "Open Project Folder" (browse files, git repo, or workspace).
  - **Secondary Card/Button**: "Create Blank Project" (manual setup).

### 1.3 Project Creation Flow (`src/App.tsx` & `DirectoryPickerModal.tsx`)
- Add `handleOpenProjectFromDirectory(dirPath: string)`:
  - Extracts the directory name (e.g., `/workspace/my-react-app` -> `my-react-app`).
  - Pre-populates a new project with title = folder name and rootDirectory = selected path.
  - Opens `ProjectModal` prefilled for quick review/confirmation, or directly creates it and sets it as the active project.
- Fix modal layering:
  - Ensure `DirectoryPickerModal` has `z-60` so that if opened on top of `ProjectModal` (`z-50`), it layers cleanly above it without flicker or focus traps.

### 1.4 Project Sidebar / Header Quick Access
- Allow users to easily open another project folder at any time from the project context menu in `ResizableSidebar`.

---

## 2. Verification Plan

1. **Verify Empty State**:
   - Ensure both "Open Project Folder" and "Create Blank Project" options are clearly visible and clickable.
2. **Verify Activity Rail & Dropdown**:
   - Check rail button tooltips and dropdown menu items.
3. **Verify Folder Selection**:
   - Select a directory from the Finder and verify the project is created with proper title, linked path, and immediately loads files into the Codebase Explorer.
4. **Compile & Lint**:
   - Run `lint_applet` and `compile_applet`.
