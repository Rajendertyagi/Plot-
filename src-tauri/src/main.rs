// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;

use std::fs;
use server::{
    browse_directory_core, create_item_core, get_base_dir, read_file_core,
    read_projects_data, read_tree_core, write_file_core, write_projects_data,
    BrowseResult, ReadFileResult, TreeResponse, WriteFileResult,
};

// ---------------------------------------------------------------------------
// Native Desktop IPC Commands (Delegating to shared core functions)
// ---------------------------------------------------------------------------

#[tauri::command]
fn load_project_data() -> Result<serde_json::Value, String> {
    read_projects_data()
}

#[tauri::command]
fn save_project_data(payload: serde_json::Value) -> Result<bool, String> {
    write_projects_data(&payload)
}

#[tauri::command]
fn browse_directory(dir: Option<String>) -> Result<BrowseResult, String> {
    browse_directory_core(dir)
}

#[tauri::command]
fn read_tree(root: Option<String>) -> Result<TreeResponse, String> {
    read_tree_core(root)
}

#[tauri::command]
fn read_file(file_path: String) -> Result<ReadFileResult, String> {
    read_file_core(file_path)
}

#[tauri::command]
fn write_file(file_path: String, content: String) -> Result<WriteFileResult, String> {
    write_file_core(file_path, content)
}

#[tauri::command]
fn create_item(target_path: String, is_directory: bool) -> Result<bool, String> {
    create_item_core(target_path, is_directory)
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
fn main() {
    let args: Vec<String> = std::env::args().collect();
    let is_server_mode = args.iter().any(|arg| {
        arg == "--server" || arg == "-s" || arg == "--headless" || arg == "server"
    });

    if is_server_mode {
        // Run Axum headless web server
        let rt = tokio::runtime::Builder::new_multi_thread()
            .enable_all()
            .build()
            .expect("Failed to initialize Tokio runtime");

        rt.block_on(async move {
            if let Err(e) = server::run_server(args).await {
                eprintln!("[ERROR] Server encountered a fatal error: {}", e);
            }
        });
        return;
    }

    // Otherwise, boot Native Tauri Desktop Application
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
