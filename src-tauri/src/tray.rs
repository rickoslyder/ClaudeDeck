use tauri::{
    AppHandle, Manager,
    tray::{TrayIconBuilder, TrayIconEvent, TrayIconId},
    menu::{MenuBuilder, MenuItemBuilder},
};
use crate::settings::{AppSettings, get_settings_store};

fn create_popup_window(app: &AppHandle) -> Result<(), String> {
    // Check if popup window already exists
    if let Some(popup) = app.webview_windows().get("popup") {
        // Window exists, just show it
        popup.show().map_err(|e| format!("Failed to show popup window: {}", e))?;
        popup.set_focus().map_err(|e| format!("Failed to focus popup window: {}", e))?;
    } else {
        // Get position for popup window (bottom-right corner)
        let (x, y) = if let Ok(Some(monitor)) = app.primary_monitor() {
            let monitor_size = monitor.size();
            let scale_factor = monitor.scale_factor();
            
            // Calculate position for bottom-right corner with some padding
            let popup_width = 300.0;
            let popup_height = 400.0;
            let padding = 20.0;
            
            let x = (monitor_size.width as f64 / scale_factor) - popup_width - padding;
            let y = (monitor_size.height as f64 / scale_factor) - popup_height - padding;
            
            (x, y)
        } else {
            // Fallback position if we can't get monitor info
            (100.0, 100.0)
        };
        
        // Create new popup window
        let _popup = tauri::WebviewWindowBuilder::new(app, "popup", tauri::WebviewUrl::App("popup.html".into()))
            .title("ClaudeDeck Quick View")
            .resizable(false)
            .inner_size(300.0, 400.0)
            .position(x, y)
            .decorations(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .build()
            .map_err(|e| format!("Failed to create popup window: {}", e))?;
    }
    
    Ok(())
}

fn toggle_main_window(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.webview_windows().get("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| format!("Failed to hide window: {}", e))?;
        } else {
            window.show().map_err(|e| format!("Failed to show window: {}", e))?;
            window.set_focus().map_err(|e| format!("Failed to focus window: {}", e))?;
        }
    }
    Ok(())
}

pub fn init(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
    let show = MenuItemBuilder::with_id("show", "Open ClaudeDeck").build(app)?;
    
    let menu = MenuBuilder::new(app)
        .item(&show)
        .item(&quit)
        .build()?;
    
    let tray_id = TrayIconId::new("main");
    let _tray = TrayIconBuilder::with_id(tray_id)
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "quit" => {
                app.exit(0);
            }
            "show" => {
                if let Some(window) = app.webview_windows().get("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { .. } = event {
                let app = tray.app_handle();
                
                // Read user settings to determine click action
                let click_action = if let Ok(store) = get_settings_store(&app) {
                    let settings = AppSettings::from_store(&store);
                    
                    // Get click_action from system_tray settings
                    if let Some(system_tray) = settings.system_tray {
                        system_tray.behavior.click_action
                    } else {
                        // Default to "open_app" if system_tray settings not found
                        "open_app".to_string()
                    }
                } else {
                    // Default to "open_app" if settings can't be loaded
                    "open_app".to_string()
                };
                
                // Handle different click actions
                match click_action.as_str() {
                    "show_popup" => {
                        if let Err(e) = create_popup_window(&app) {
                            eprintln!("Failed to create popup window: {}", e);
                        }
                    }
                    "toggle_window" => {
                        if let Err(e) = toggle_main_window(&app) {
                            eprintln!("Failed to toggle window: {}", e);
                        }
                    }
                    "open_app" => {
                        if let Some(window) = app.webview_windows().get("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "none" => {
                        // Do nothing on click
                    }
                    _ => {
                        // Default behavior: open app
                        if let Some(window) = app.webview_windows().get("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
            }
        })
        .build(app)?;
    
    Ok(())
}

pub fn update_title(app: &AppHandle, title: &str) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_title(Some(title))
            .map_err(|e| format!("Failed to update tray title: {}", e))?;
    }
    Ok(())
}

pub fn set_tooltip(app: &AppHandle, tooltip: &str) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_tooltip(Some(tooltip))
            .map_err(|e| format!("Failed to set tray tooltip: {}", e))?;
    }
    Ok(())
}