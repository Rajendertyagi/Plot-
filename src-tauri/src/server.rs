use axum::{
    extract::{Json, Query},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::fs;
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use tower_http::cors::CorsLayer;
use tower_http::services::{ServeDir, ServeFile};

/// Get base directory containing running executable
pub fn get_base_dir() -> PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            return parent.to_path_buf();
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

/// Get portable data directory (./data)
pub fn get_data_dir() -> PathBuf {
    let data_dir = get_base_dir().join("data");
    if !data_dir.exists() {
        let _ = fs::create_dir_all(&data_dir);
    }
    data_dir
}

/// Get path to ./data/projects.json
pub fn get_projects_file() -> PathBuf {
    get_data_dir().join("projects.json")
}

/// Get path to ./data/prompts.json
pub fn get_prompts_file() -> PathBuf {
    get_data_dir().join("prompts.json")
}

/// Read projects data from disk
pub fn read_projects_data() -> Result<serde_json::Value, String> {
    let file_path = get_projects_file();
    if !file_path.exists() {
        return Ok(serde_json::json!({
            "projects": [],
            "features": [],
            "tasks": [],
            "viewLayout": "tree"
        }));
    }
    let content = fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read {}: {}", file_path.display(), e))?;
    let json: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Invalid JSON in {}: {}", file_path.display(), e))?;
    Ok(json)
}

/// Atomically write projects data to disk
pub fn write_projects_data(payload: &serde_json::Value) -> Result<bool, String> {
    let file_path = get_projects_file();
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }

    let tmp_path = file_path.with_extension("tmp");
    let content = serde_json::to_string_pretty(payload).map_err(|e| e.to_string())?;
    fs::write(&tmp_path, content).map_err(|e| e.to_string())?;
    fs::rename(&tmp_path, &file_path).map_err(|e| e.to_string())?;
    Ok(true)
}

/// Get path to portable ./web directory
pub fn get_web_dir() -> PathBuf {
    let base = get_base_dir();
    let web = base.join("web");
    if web.exists() {
        web
    } else {
        let dist = base.join("dist");
        if dist.exists() {
            dist
        } else {
            web
        }
    }
}

// ---------------------------------------------------------------------------
// DTO Types for File System API
// ---------------------------------------------------------------------------

#[derive(Serialize, Deserialize, Clone)]
pub struct BrowseResult {
    pub exists: bool,
    #[serde(rename = "currentPath")]
    pub current_path: String,
    #[serde(rename = "parentPath")]
    pub parent_path: Option<String>,
    pub directories: Vec<String>,
    #[serde(rename = "workspaceRoot")]
    pub workspace_root: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FileNodeDto {
    pub name: String,
    pub path: String,
    #[serde(rename = "relativePath")]
    pub relative_path: String,
    #[serde(rename = "isDirectory")]
    pub is_directory: bool,
    pub size: Option<u64>,
    pub extension: Option<String>,
    pub children: Option<Vec<FileNodeDto>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TreeResponse {
    #[serde(rename = "rootPath")]
    pub root_path: String,
    pub tree: Vec<FileNodeDto>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ReadFileResult {
    #[serde(rename = "filePath")]
    pub file_path: String,
    pub content: String,
    pub size: u64,
    pub extension: String,
    #[serde(rename = "modifiedAt")]
    pub modified_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct WriteFileResult {
    pub success: bool,
    #[serde(rename = "filePath")]
    pub file_path: String,
    pub size: u64,
    #[serde(rename = "savedAt")]
    pub saved_at: String,
}

#[derive(Deserialize)]
pub struct BrowseQuery {
    pub dir: Option<String>,
}

#[derive(Deserialize)]
pub struct TreeQuery {
    pub root: Option<String>,
}

#[derive(Deserialize)]
pub struct ReadFileQuery {
    pub path: Option<String>,
}

#[derive(Deserialize)]
pub struct WriteFilePayload {
    #[serde(rename = "filePath")]
    pub file_path: String,
    pub content: String,
}

#[derive(Deserialize)]
pub struct CreateItemPayload {
    #[serde(rename = "targetPath")]
    pub target_path: String,
    #[serde(rename = "isDirectory")]
    pub is_directory: bool,
}

// ---------------------------------------------------------------------------
// File System Core Functions (Shared by REST & Desktop Tauri IPC)
// ---------------------------------------------------------------------------

pub fn build_tree_recursive(dir_path: &Path, root_path: &Path, depth: usize) -> Vec<FileNodeDto> {
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

pub fn browse_directory_core(dir: Option<String>) -> Result<BrowseResult, String> {
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

pub fn read_tree_core(root: Option<String>) -> Result<TreeResponse, String> {
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

pub fn read_file_core(file_path: String) -> Result<ReadFileResult, String> {
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

pub fn write_file_core(file_path: String, content: String) -> Result<WriteFileResult, String> {
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

pub fn create_item_core(target_path: String, is_directory: bool) -> Result<bool, String> {
    let path = PathBuf::from(&target_path);
    if path.exists() {
        return Err("File or directory already exists".to_string());
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
// REST API Handlers
// ---------------------------------------------------------------------------

async fn get_data() -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    read_projects_data()
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))
}

async fn save_data(Json(payload): Json<serde_json::Value>) -> Result<StatusCode, (StatusCode, String)> {
    write_projects_data(&payload)
        .map(|_| StatusCode::OK)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))
}

async fn export_data() -> Result<Response, (StatusCode, String)> {
    let file_path = get_projects_file();
    let content = if file_path.exists() {
        fs::read_to_string(&file_path)
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Read error: {}", e)))?
    } else {
        serde_json::to_string_pretty(&serde_json::json!({
            "projects": [],
            "features": [],
            "tasks": [],
            "viewLayout": "tree"
        })).unwrap_or_default()
    };

    let mut headers = HeaderMap::new();
    headers.insert(header::CONTENT_TYPE, "application/json".parse().unwrap());
    headers.insert(
        header::CONTENT_DISPOSITION,
        "attachment; filename=\"projects.json\"".parse().unwrap(),
    );

    Ok((headers, content).into_response())
}

async fn get_prompts() -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let file_path = get_prompts_file();
    if !file_path.exists() {
        return Ok(Json(serde_json::json!([])));
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Read error: {}", e)))?;
    let json: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("JSON parse error: {}", e)))?;

    Ok(Json(json))
}

async fn save_prompts(Json(payload): Json<serde_json::Value>) -> Result<StatusCode, (StatusCode, String)> {
    let file_path = get_prompts_file();
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            let _ = fs::create_dir_all(parent);
        }
    }

    let tmp_path = file_path.with_extension("tmp");
    let content = serde_json::to_string_pretty(&payload)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Serialization error: {}", e)))?;
    fs::write(&tmp_path, content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Write error: {}", e)))?;
    fs::rename(&tmp_path, &file_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Rename error: {}", e)))?;

    Ok(StatusCode::OK)
}

async fn fs_browse(Query(query): Query<BrowseQuery>) -> Result<Json<BrowseResult>, (StatusCode, String)> {
    browse_directory_core(query.dir)
        .map(Json)
        .map_err(|e| (StatusCode::BAD_REQUEST, e))
}

async fn fs_tree(Query(query): Query<TreeQuery>) -> Result<Json<TreeResponse>, (StatusCode, String)> {
    read_tree_core(query.root)
        .map(Json)
        .map_err(|e| (StatusCode::NOT_FOUND, e))
}

async fn fs_read(Query(query): Query<ReadFileQuery>) -> Result<Json<ReadFileResult>, (StatusCode, String)> {
    let path = match query.path {
        Some(p) if !p.trim().is_empty() => p,
        _ => return Err((StatusCode::BAD_REQUEST, "Missing path query parameter".to_string())),
    };
    read_file_core(path)
        .map(Json)
        .map_err(|e| (StatusCode::NOT_FOUND, e))
}

async fn fs_write(Json(payload): Json<WriteFilePayload>) -> Result<Json<WriteFileResult>, (StatusCode, String)> {
    write_file_core(payload.file_path, payload.content)
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))
}

async fn fs_create(Json(payload): Json<CreateItemPayload>) -> Result<Json<bool>, (StatusCode, String)> {
    create_item_core(payload.target_path, payload.is_directory)
        .map(Json)
        .map_err(|e| (StatusCode::CONFLICT, e))
}

// ---------------------------------------------------------------------------
// Server Entry Point
// ---------------------------------------------------------------------------

pub async fn run_server(args: Vec<String>) -> Result<(), Box<dyn std::error::Error>> {
    let mut port: u16 = 4000;
    let mut host = "127.0.0.1".to_string();
    let mut open_browser = false;

    if let Ok(p_str) = std::env::var("PORT") {
        if let Ok(p) = p_str.parse::<u16>() {
            port = p;
        }
    }

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--port" | "-p" => {
                if i + 1 < args.len() {
                    if let Ok(p) = args[i + 1].parse::<u16>() {
                        port = p;
                        i += 1;
                    }
                }
            }
            "--host" => {
                if i + 1 < args.len() {
                    host = args[i + 1].clone();
                    i += 1;
                }
            }
            "--open" | "-o" => {
                open_browser = true;
            }
            _ => {}
        }
        i += 1;
    }

    let web_dir = get_web_dir();
    let index_file = web_dir.join("index.html");

    let app = Router::new()
        .route("/api/data", get(get_data).post(save_data))
        .route("/api/data/export", get(export_data))
        .route("/api/prompts", get(get_prompts).post(save_prompts))
        .route("/api/fs/browse", get(fs_browse))
        .route("/api/fs/tree", get(fs_tree))
        .route("/api/fs/read", get(fs_read))
        .route("/api/fs/write", post(fs_write))
        .route("/api/fs/create", post(fs_create))
        .nest_service(
            "/",
            ServeDir::new(&web_dir).fallback(ServeFile::new(&index_file)),
        )
        .layer(CorsLayer::permissive());

    let addr: SocketAddr = format!("{}:{}", host, port).parse()?;
    println!("[INFO] ========================================================");
    println!("[INFO] ProjectFlow Portable Web Server running at:");
    println!("[INFO]   http://localhost:{}", port);
    println!("[INFO]   http://{}:{}", host, port);
    println!("[INFO] Serving static web frontend from: {}", web_dir.display());
    println!("[INFO] Isolated data directory: {}", get_data_dir().display());
    println!("[INFO] Press Ctrl+C to stop the server.");
    println!("[INFO] ========================================================");

    if open_browser {
        let url = format!("http://localhost:{}", port);
        let _ = webbrowser::open(&url);
    }

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
