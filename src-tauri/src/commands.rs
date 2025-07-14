use crate::core;
use crate::settings::{AppSettings, get_settings_store};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub async fn load_usage_entries(
    since_date: Option<String>,
    app: AppHandle,
) -> Result<Vec<String>, String> {
    println!("[commands.rs] load_usage_entries called with since_date: {:?}", since_date);
    let result = core::load_usage_data(since_date, &app).await;
    match &result {
        Ok(data) => println!("[commands.rs] load_usage_entries returning {} entries", data.len()),
        Err(e) => println!("[commands.rs] load_usage_entries error: {}", e),
    }
    result
}

#[tauri::command]
pub async fn export_data(
    format: String,
    content: String,
    default_filename: String,
    app: AppHandle,
) -> Result<(), String> {
    core::export_data(format, content, default_filename, &app).await
}

#[tauri::command]
pub async fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    println!("[commands.rs] get_settings called");
    let store = get_settings_store(&app)?;
    let settings = AppSettings::from_store(&store);
    println!("[commands.rs] get_settings returning: {:?}", settings);
    Ok(settings)
}

#[tauri::command]
pub async fn save_settings(
    settings: AppSettings,
    app: AppHandle,
) -> Result<(), String> {
    let store = get_settings_store(&app)?;
    settings.save_to_store(&store)?;
    Ok(())
}

#[tauri::command]
pub async fn update_tray_title(title: String, app: AppHandle) -> Result<(), String> {
    crate::tray::update_title(&app, &title)?;
    Ok(())
}

#[tauri::command]
pub async fn set_tray_tooltip(tooltip: String, app: AppHandle) -> Result<(), String> {
    crate::tray::set_tooltip(&app, &tooltip)?;
    Ok(())
}

#[tauri::command]
pub async fn show_popup_window(app: AppHandle) -> Result<(), String> {
    // Check if popup window already exists
    if let Some(popup) = app.webview_windows().get("popup") {
        // Window exists, just show it
        popup.show().map_err(|e| format!("Failed to show popup window: {}", e))?;
        popup.set_focus().map_err(|e| format!("Failed to focus popup window: {}", e))?;
    } else {
        // Create new popup window
        let position = get_popup_position_internal(&app).await?;
        
        let _popup = WebviewWindowBuilder::new(&app, "popup", WebviewUrl::App("popup.html".into()))
            .title("ClaudeDeck Quick View")
            .resizable(false)
            .inner_size(300.0, 400.0)
            .position(position.0, position.1)
            .decorations(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .build()
            .map_err(|e| format!("Failed to create popup window: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn hide_popup_window(app: AppHandle) -> Result<(), String> {
    if let Some(popup) = app.webview_windows().get("popup") {
        popup.hide().map_err(|e| format!("Failed to hide popup window: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_popup_position(app: AppHandle) -> Result<(f64, f64), String> {
    get_popup_position_internal(&app).await
}

// Helper function to calculate popup position
async fn get_popup_position_internal(app: &AppHandle) -> Result<(f64, f64), String> {
    // Try to get position near system tray
    // For now, we'll position it in the bottom-right corner as a fallback
    
    // Get primary monitor
    if let Ok(Some(monitor)) = app.primary_monitor() {
        let monitor_size = monitor.size();
        let scale_factor = monitor.scale_factor();
        
        // Calculate position for bottom-right corner with some padding
        let popup_width = 300.0;
        let popup_height = 400.0;
        let padding = 20.0;
        
        let x = (monitor_size.width as f64 / scale_factor) - popup_width - padding;
        let y = (monitor_size.height as f64 / scale_factor) - popup_height - padding;
        
        Ok((x, y))
    } else {
        // Fallback position if we can't get monitor info
        Ok((100.0, 100.0))
    }
}

#[tauri::command]
pub async fn show_main_window(app: AppHandle) -> Result<(), String> {
    if let Some(main_window) = app.webview_windows().get("main") {
        main_window.show().map_err(|e| format!("Failed to show main window: {}", e))?;
        main_window.set_focus().map_err(|e| format!("Failed to focus main window: {}", e))?;
    } else {
        return Err("Main window not found".to_string());
    }
    Ok(())
}