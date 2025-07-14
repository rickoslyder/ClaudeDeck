use notify::{Watcher, RecursiveMode, Event, EventKind};
use std::sync::mpsc::channel;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

#[derive(Clone, serde::Serialize)]
struct FileChangeEvent {
    path: String,
    kind: String,
}

pub fn init(app: AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Get Claude data directories
    let directories = crate::core::get_claude_directories();
    
    if directories.is_empty() {
        println!("No Claude directories found for monitoring");
        return Ok(());
    }
    
    // Create a channel to receive file system events
    let (tx, rx) = channel();
    
    // Create a watcher
    let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
            let _ = tx.send(event);
        }
    })?;
    
    // Watch all Claude directories
    for dir in &directories {
        if dir.exists() {
            watcher.watch(dir, RecursiveMode::Recursive)?;
            println!("Watching directory: {:?}", dir);
        }
    }
    
    // Spawn a thread to handle file system events
    thread::spawn(move || {
        let _watcher = watcher; // Keep watcher alive
        
        while let Ok(event) = rx.recv() {
            match event.kind {
                EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_) => {
                    for path in event.paths {
                        // Only emit events for JSONL files
                        if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                            let event_kind = match event.kind {
                                EventKind::Create(_) => "created",
                                EventKind::Modify(_) => "modified",
                                EventKind::Remove(_) => "removed",
                                _ => continue,
                            };
                            
                            let file_event = FileChangeEvent {
                                path: path.to_string_lossy().to_string(),
                                kind: event_kind.to_string(),
                            };
                            
                            // Emit event to frontend
                            let _ = app.emit("file-changed", file_event);
                        }
                    }
                }
                _ => {}
            }
            
            // Small delay to batch rapid changes
            thread::sleep(Duration::from_millis(100));
        }
    });
    
    Ok(())
}