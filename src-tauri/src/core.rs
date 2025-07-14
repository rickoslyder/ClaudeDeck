use std::path::{Path, PathBuf};
use std::fs;
use tauri::AppHandle;

/// Discovers Claude data directories
pub fn discover_claude_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    
    // Check CLAUDE_CONFIG_DIR environment variable
    if let Ok(env_paths) = std::env::var("CLAUDE_CONFIG_DIR") {
        for path in env_paths.split(',') {
            let path = PathBuf::from(path.trim());
            if path.exists() {
                paths.push(path);
            }
        }
    }
    
    // Check default locations
    if let Some(home) = dirs::home_dir() {
        let default_paths = vec![
            home.join(".config/claude"),
            home.join(".claude"),
        ];
        
        for path in default_paths {
            if path.exists() && !paths.contains(&path) {
                paths.push(path);
            }
        }
    }
    
    paths
}

/// Alias for file_monitor.rs compatibility
pub fn get_claude_directories() -> Vec<PathBuf> {
    discover_claude_paths()
}

/// Loads usage data from JSONL files
pub async fn load_usage_data(
    since_date: Option<String>,
    _app: &AppHandle,
) -> Result<Vec<String>, String> {
    let claude_paths = discover_claude_paths();
    
    println!("[core.rs] Discovered Claude paths: {:?}", claude_paths);
    
    if claude_paths.is_empty() {
        println!("[core.rs] No Claude data directories found. Returning empty array.");
        // Return empty array instead of error to allow app to load
        return Ok(Vec::new());
    }
    
    let mut all_files = Vec::new();
    
    for claude_path in &claude_paths {
        let projects_path = claude_path.join("projects");
        println!("[core.rs] Checking projects path: {:?}", projects_path);
        
        if !projects_path.exists() {
            println!("[core.rs] Projects path does not exist, skipping");
            continue;
        }
        
        // Find all .jsonl files recursively
        if let Ok(entries) = find_jsonl_files(&projects_path) {
            println!("[core.rs] Found {} JSONL files in {:?}", entries.len(), projects_path);
            all_files.extend(entries);
        }
    }
    
    println!("[core.rs] Total JSONL files found: {}", all_files.len());
    
    // Filter by date if provided
    let filtered_files = if let Some(_date) = since_date {
        // TODO: Implement date filtering based on file modification time
        all_files
    } else {
        all_files
    };
    
    // Read file contents
    let mut file_contents = Vec::new();
    for file_path in &filtered_files {
        if let Ok(content) = fs::read_to_string(&file_path) {
            file_contents.push(content);
        } else {
            println!("[core.rs] Failed to read file: {:?}", file_path);
        }
    }
    
    println!("[core.rs] Successfully read {} files", file_contents.len());
    Ok(file_contents)
}

/// Recursively finds all JSONL files in a directory
fn find_jsonl_files(dir: &Path) -> Result<Vec<PathBuf>, std::io::Error> {
    let mut files = Vec::new();
    
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                if let Ok(mut nested) = find_jsonl_files(&path) {
                    files.append(&mut nested);
                }
            } else if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                files.push(path);
            }
        }
    }
    
    Ok(files)
}

/// Exports data in the specified format
pub async fn export_data(
    _format: String,
    content: String,
    default_filename: String,
    app: &AppHandle,
) -> Result<(), String> {
    use tauri_plugin_dialog::DialogExt;
    
    let dialog = app.dialog();
    
    // Show save dialog
    let file_handle = dialog
        .file()
        .set_file_name(&default_filename)
        .blocking_save_file();
    
    if let Some(file_path) = file_handle {
        // Write content to file
        match &file_path {
            tauri_plugin_dialog::FilePath::Path(path) => {
                fs::write(path, content)
                    .map_err(|e| format!("Failed to save file: {}", e))?;
            }
            _ => return Err("Invalid file path".to_string()),
        }
    }
    
    Ok(())
}