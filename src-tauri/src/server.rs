use axum::{
    extract::Json,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use std::fs;
use std::net::SocketAddr;
use std::path::PathBuf;
use tower_http::cors::CorsLayer;
use tower_http::services::{ServeDir, ServeFile};

/// Get base directory containing running executable
fn get_base_dir() -> PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            return parent.to_path_buf();
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

/// Get portable data directory (./data)
fn get_data_dir() -> PathBuf {
    let data_dir = get_base_dir().join("data");
    if !data_dir.exists() {
        let _ = fs::create_dir_all(&data_dir);
    }
    data_dir
}

/// Get path to ./data/projects.json
fn get_projects_file() -> PathBuf {
    get_data_dir().join("projects.json")
}

/// Get path to ./data/prompts.json
fn get_prompts_file() -> PathBuf {
    get_data_dir().join("prompts.json")
}

/// Get path to portable ./web directory
fn get_web_dir() -> PathBuf {
    let base = get_base_dir();
    let web = base.join("web");
    if web.exists() {
        web
    } else {
        // Fallback for dev mode where web assets are in dist
        let dist = base.join("dist");
        if dist.exists() {
            dist
        } else {
            web
        }
    }
}

// ---------------------------------------------------------------------------
// API Handlers
// ---------------------------------------------------------------------------

async fn get_data() -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let file_path = get_projects_file();
    if !file_path.exists() {
        let default_val = serde_json::json!({
            "projects": [],
            "features": [],
            "tasks": [],
            "viewLayout": "tree"
        });
        return Ok(Json(default_val));
    }

    let content = fs::read_to_string(&file_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Read error: {}", e)))?;
    let json: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("JSON parse error: {}", e)))?;

    Ok(Json(json))
}

async fn save_data(Json(payload): Json<serde_json::Value>) -> Result<StatusCode, (StatusCode, String)> {
    let file_path = get_projects_file();
    if let Some(parent) = file_path.parent() {
        if !parent.exists() {
            let _ = fs::create_dir_all(parent);
        }
    }

    // Atomic write
    let tmp_path = file_path.with_extension("tmp");
    let content = serde_json::to_string_pretty(&payload)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Serialization error: {}", e)))?;
    fs::write(&tmp_path, content)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Write error: {}", e)))?;
    fs::rename(&tmp_path, &file_path)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Rename error: {}", e)))?;

    Ok(StatusCode::OK)
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

// ---------------------------------------------------------------------------
// Server Entry Point
// ---------------------------------------------------------------------------

pub async fn run_server(args: Vec<String>) -> Result<(), Box<dyn std::error::Error>> {
    let mut port: u16 = 3000;
    let mut host = "127.0.0.1".to_string();
    let mut open_browser = false;

    // Check environment variable PORT
    if let Ok(p_str) = std::env::var("PORT") {
        if let Ok(p) = p_str.parse::<u16>() {
            port = p;
        }
    }

    // Parse command-line args
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

    // Build Axum Router with API routes and static asset fallback
    let app = Router::new()
        .route("/api/data", get(get_data).post(save_data))
        .route("/api/prompts", get(get_prompts).post(save_prompts))
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
        #[cfg(target_os = "windows")]
        {
            let _ = std::process::Command::new("cmd")
                .args(["/C", "start", "", &url])
                .spawn();
        }
        #[cfg(not(target_os = "windows"))]
        {
            let _ = std::process::Command::new("xdg-open")
                .arg(&url)
                .spawn();
        }
    }

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
