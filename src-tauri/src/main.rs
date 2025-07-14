// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


mod commands;
mod core;
mod settings;
mod tray;
mod file_monitor;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // Initialize system tray
            tray::init(&app.handle())?;
            
            // Initialize settings
            settings::init(&app.handle())?;
            
            // Initialize file monitoring
            file_monitor::init(app.handle().clone())?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_usage_entries,
            commands::export_data,
            commands::get_settings,
            commands::save_settings,
            commands::update_tray_title,
            commands::set_tray_tooltip,
            commands::show_popup_window,
            commands::hide_popup_window,
            commands::get_popup_position,
            commands::show_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}