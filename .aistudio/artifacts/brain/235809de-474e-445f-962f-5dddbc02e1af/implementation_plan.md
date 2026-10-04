# Fix Plan: Windows Icon Resource, Encoding, Build Order & Security Containment

Detailed analysis and fix plan for the `icon.ico` build failure and all 4 reported issues:

---

## 1. Issue Analysis & Confirmed Solutions

### Issue 0 (The Fatal Build Crash): `src-tauri/icons/icon.ico` not found
- **Cause**: On Windows, `tauri-build` compiles a native `.rc` (Windows Resource) file embedding the application icon into `projectflow.exe`. If `src-tauri/icons/icon.ico` does not exist, `tauri-build` aborts compilation with exit code 1.
- **Fix**: Generate and commit valid multi-resolution Windows `icon.ico` (256x256, 128x128, 64x64, 48x48, 32x32, 16x16) and companion PNGs (`icon.png`, `32x32.png`, `128x128.png`, `Square150x150Logo.png`) into `src-tauri/icons/`.

### Issue 1: Mojibake in `tauri.conf.json` window title
- **Cause**: The em-dash `—` (`\u2014`) in `"ProjectFlow — Project & Task Manager"` is parsed by the Windows MSVC resource compiler and CMD without UTF-8 codepage guarantees, rendering as `?` on Windows.
- **Fix**: Replace em-dash with standard ASCII: `"ProjectFlow - Project & Task Manager"`.

### Issue 2: `frontendDist` vs `dist/` vs `web/`
- **Cause**: If `frontendDist` points to `../web` while Vite outputs to `dist/`, `cargo build` fails unless `web/` already exists.
- **Fix**:
  - In `tauri.conf.json`: Set `"frontendDist": "../dist"`.
  - In CI & local packaging: `bun run build` generates `dist/`, `cargo build` reads `dist/`, and then the packaging step copies `dist/` into `web/` directly next to `projectflow.exe`.

### Issue 3: Unused `tokio` and `walkdir` in `Cargo.toml`
- **Cause**: `tokio = { features = ["full"] }` and `walkdir` add 50+ unnecessary crates and several minutes of CI compile time. Tauri v2 already embeds its own internal runtime, and `main.rs` uses synchronous standard library `std::fs`.
- **Fix**: Remove `tokio` and `walkdir` from `src-tauri/Cargo.toml`. Retain only `tauri`, `serde`, `serde_json`, and `chrono`.

### Issue 4: Path Traversal Vulnerability in `server.ts`
- **Cause**: `/api/fs/read`, `/api/fs/write`, and `/api/fs/create` accept arbitrary file paths. If Web Mode is hosted on port 4000 across a local network, any connected user could read or overwrite system files outside the intended project.
- **Fix**:
  - Implement a strict `isPathWithinAllowedRoots(targetPath, allowedRoots)` helper.
  - Allowed roots include the current working directory (`process.cwd()`) and any registered `rootDirectory` paths from the user's projects in `data/projects.json`.
  - Reject paths trying to climb out using `..` or targeting forbidden system directories (e.g. `C:\Windows`, `/etc`, root).

---

## 2. Implementation Steps

1. **Icons Generation**:
   - Create `scripts/generate-icons.js` to create valid, compliant ICO and PNG assets in `src-tauri/icons/`.
   - Run the script so `src-tauri/icons/icon.ico` and standard icons exist in the repository.

2. **`src-tauri/tauri.conf.json` Clean-up**:
   - Change window title to ASCII `"ProjectFlow - Project & Task Manager"`.
   - Set `"frontendDist": "../dist"`.
   - Ensure `"bundle": { "active": false }`.

3. **`src-tauri/Cargo.toml` Streamlining**:
   - Remove `tokio = { version = "1", features = ["full"] }`.
   - Remove `walkdir = "2"`.
   - Keep only essential, lightweight dependencies.

4. **Security Hardening in `server.ts`**:
   - Add boundary validation so all file system reads, writes, and listings stay strictly within legitimate project roots.
   - Return clean 403 Forbidden responses when an out-of-bounds path is requested.

---

## 3. User Review & Approval
Please click **Proceed** to implement the icon generation, Cargo.toml cleanup, tauri.conf.json fix, and path traversal security boundary.
