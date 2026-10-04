// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

/// Get the directory containing the running executable or current working directory in dev
fn get_base_dir() -> PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            return parent.to_path_buf();
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

/// Get the portable self-contained data directory next to the executable
fn get_data_dir() -> PathBuf {
    let data_dir = get_base_dir().join("data");
    if !data_dir.exists() {
        let _ = fs::create_dir_all(&data_dir);
    }
    data_dir
}

/// Get path to portable projects.json
fn get_projects_file() -> PathBuf {
    get_data_dir().join("projects.json")
}

// ---------------------------------------------------------------------------
// Native Desktop IPC Commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn load_project_data() -> Result<serde_json::Value, String> {
    let file_path = get_projects_file();
    if !file_path.exists() {
        return Err("projects.json not found in portable data folder".to_string());
    }
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read {}: {}", file_path.display(), e))?;
    let json: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Invalid JSON: {}", e))?;
    Ok(json)
}

#[tauri::command]
fn save_project_data(payload: serde_json::Value) -> Result<bool, String> {
    let file_path = get_projects_file();
    let parent = file_path.parent().unwrap();
    if !parent.exists() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Atomic write
    let tmp_path = file_path.with_extension("tmp");
    let content = serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())?;
    fs::write(&tmp_path, content).map_err(|e| e.to_string())?;
    fs::rename(&tmp_path, &file_path).map_err(|e| e.to_string())?;

    Ok(true)
}

#[derive(Serialize)]
struct BrowseResult {
    exists: bool,
    #[serde(rename = "currentPath")]
    current_path: String,
    #[serde(rename = "parentPath")]
    parent_path: Option<String>,
    directories: Vec<String>,
    #[serde(rename = "workspaceRoot")]
    workspace_root: String,
}

#[tauri::command]
fn browse_directory(dir: Option<String>) -> Result<BrowseResult, String> {
    let base = match dir {
        Some(d) if !d.trim().is_empty() => PathBuf::from(d),
        _ => get_base_dir(),
    };

    let canonical = base.canonicalize().unwrap_or(base.clone());
    if !canonical.exists() || !canonical.is_dir() {
        return Err(format!("Path is not a valid directory: {}", canonical.display()));
    }

    let mut dirs = Vec::new();
    if let Ok(entries) = fs::read_dir(&canonical) {
        for entry in entries.flatten() {
            if let Ok(file_type) = entry.file_type() {
                if file_type.is_dir() {
                    dirs.push(entry.file_name().to_string_lossy().to_string());
                }
            }
        }
    }
    dirs.sort_by(|a, b| a.to_lowercase().cmp(&b.to_lowercase()));

    let parent_path = canonical.parent().map(|p| p.to_string_lossy().to_string());

    Ok(BrowseResult {
        exists: true,
        current_path: canonical.to_string_lossy().to_string(),
        parent_path,
        directories: dirs,
        workspace_root: get_base_dir().to_string_lossy().to_string(),
    })
}

#[derive(Serialize)]
struct FileNodeDto {
    name: String,
    path: String,
    #[serde(rename = "relativePath")]
    relative_path: String,
    #[serde(rename = "isDirectory")]
    is_directory: bool,
    size: Option<u64>,
    extension: Option<String>,
    children: Option<Vec<FileNodeDto>>,
}

fn build_tree_recursive(dir_path: &Path, root_path: &Path, depth: usize) -> Vec<FileNodeDto> {
    if depth > 6 {
        return Vec::new();
    }
    let mut nodes = Vec::new();
    let ignored = ["node_modules", ".git", "dist", "web", "target", ".cache"];

    if let Ok(entries) = fs::read_dir(dir_path) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if ignored.contains(&name.as_str()) {
                continue;
            }

            let full_path = entry.path();
            let rel_path = full_path
                .strip_prefix(root_path)
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|_| name.clone());

            let is_dir = full_path.is_dir();
            if is_dir {
                nodes.push(FileNodeDto {
                    name,
                    path: full_path.to_string_lossy().to_string(),
                    relative_path: rel_path,
                    is_directory: true,
                    size: None,
                    extension: None,
                    children: Some(build_tree_recursive(&full_path, root_path, depth + 1)),
                });
            } else {
                let size = entry.metadata().ok().map(|m| m.len());
                let ext = full_path
                    .extension()
                    .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()));
                nodes.push(FileNodeDto {
                    name,
                    path: full_path.to_string_lossy().to_string(),
                    relative_path: rel_path,
                    is_directory: false,
                    size,
                    extension: ext,
                    children: None,
                });
            }
        }
    }

    nodes.sort_by(|a, b| {
        if a.is_directory != b.is_directory {
            b.is_directory.cmp(&a.is_directory)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    nodes
}

#[derive(Serialize)]
struct TreeResponse {
    #[serde(rename = "rootPath")]
    root_path: String,
    tree: Vec<FileNodeDto>,
}

#[tauri::command]
fn read_tree(root: Option<String>) -> Result<TreeResponse, String> {
    let target_root = match root {
        Some(r) if !r.trim().is_empty() => PathBuf::from(r),
        _ => get_base_dir(),
    };

    let canonical = target_root.canonicalize().unwrap_or(target_root);
    if !canonical.exists() {
        return Err(format!("Root folder does not exist: {}", canonical.display()));
    }

    let tree = build_tree_recursive(&canonical, &canonical, 0);
    Ok(TreeResponse {
        root_path: canonical.to_string_lossy().to_string(),
        tree,
    })
}

#[derive(Serialize)]
struct ReadFileResult {
    #[serde(rename = "filePath")]
    file_path: String,
    content: String,
    size: u64,
    extension: String,
    #[serde(rename = "modifiedAt")]
    modified_at: String,
}

#[tauri::command]
fn read_file(file_path: String) -> Result<ReadFileResult, String> {
    let path = PathBuf::from(&file_path);
    if !path.exists() || !path.is_file() {
        return Err(format!("File not found: {}", file_path));
    }

    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    if meta.len() > 5 * 1024 * 1024 {
        return Err("File too large (exceeds 5MB limit)".to_string());
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let ext = path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();

    Ok(ReadFileResult {
        file_path,
        content,
        size: meta.len(),
        extension: ext,
        modified_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[derive(Serialize)]
struct WriteFileResult {
    success: bool,
    #[serde(rename = "filePath")]
    file_path: String,
    size: u64,
    #[serde(rename = "savedAt")]
    saved_at: String,
}

#[tauri::command]
fn write_file(file_path: String, content: String) -> Result<WriteFileResult, String> {
    let path = PathBuf::from(&file_path);
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }

    let tmp = path.with_extension("cmtmp");
    fs::write(&tmp, &content).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &path).map_err(|e| e.to_string())?;

    let size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);

    Ok(WriteFileResult {
        success: true,
        file_path,
        size,
        saved_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
fn create_item(target_path: String, is_directory: bool) -> Result<bool, String> {
    let path = PathBuf::from(&target_path);
    if path.exists() {
        return Err("File or folder already exists".to_string());
    }

    if is_directory {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    } else {
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
        }
        fs::write(&path, "").map_err(|e| e.to_string())?;
    }
    Ok(true)
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
fn main() {
    // CRITICAL: Overriding WEBVIEW2_USER_DATA_FOLDER isolates all cache, cookies,
    // and profile data into the portable `./data/webview/` folder next to the .exe.
    // This prevents ANY files from being written to %APPDATA% or %LOCALAPPDATA%.
    let exe_dir = get_base_dir();
    let webview_cache_dir = exe_dir.join("data").join("webview");
    let _ = fs::create_dir_all(&webview_cache_dir);
    std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", &webview_cache_dir);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_project_data,
            save_project_data,
            browse_directory,
            read_tree,
            read_file,
            write_file,
            create_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running ProjectFlow desktop application");
}
