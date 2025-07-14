
use tauri::Manager;

pub mod commands;
pub mod core;
pub mod settings;
pub mod tray;
pub mod file_monitor;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            println!("[lib.rs] Setting up Tauri application...");
            
            // Get the main window and enable devtools
            if let Some(window) = app.get_webview_window("main") {
                println!("[lib.rs] Found main window, attempting to open devtools...");
                
                // Try to open devtools automatically in debug builds
                #[cfg(debug_assertions)]
                {
                    window.open_devtools();
                    println!("[lib.rs] DevTools opened");
                }
            } else {
                println!("[lib.rs] Main window not found");
            }
            
            // Log the asset protocol URL
            println!("[lib.rs] Asset protocol URL: tauri://localhost");
            
            // Initialize system tray
            tray::init(&app.handle())?;
            
            // Initialize settings
            settings::init(&app.handle())?;
            
            // Initialize file monitoring
            file_monitor::init(app.handle().clone())?;
            
            println!("[lib.rs] Setup complete");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_usage_entries,
            commands::export_data,
            commands::get_settings,
            commands::save_settings,
            commands::update_tray_title,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}