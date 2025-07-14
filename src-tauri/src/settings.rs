use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::{Store, StoreExt};
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationLimits {
    pub daily: Option<f64>,
    pub monthly: Option<f64>,
    pub session: Option<f64>,
}

// System tray related structures
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTrayDisplayShowItems {
    pub current_block_tokens: bool,
    pub current_block_cost: bool,
    pub current_block_models: bool,
    pub current_block_time_remaining: bool,
    pub daily_total: bool,
    pub session_total: bool,
    pub monthly_total: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTrayNumberFormat {
    pub tokens_unit: String, // "raw" | "k" | "M"
    pub cost_decimals: u32, // 0 | 1 | 2
    pub compact_numbers: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTrayDisplay {
    pub mode: String, // "compact" | "detailed" | "custom"
    pub show_items: SystemTrayDisplayShowItems,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_format: Option<String>,
    pub number_format: SystemTrayNumberFormat,
    pub update_interval: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTrayBehavior {
    pub click_action: String, // "open_app" | "show_popup" | "toggle_window" | "none"
    pub right_click_shows_menu: bool,
    pub show_only_when_active: bool,
    pub inactivity_timeout: u32,
    pub start_minimized: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTrayVisual {
    pub icon_style: String, // "default" | "monochrome" | "usage_based"
    pub show_tooltip: bool,
    pub tooltip_content: String, // "same_as_title" | "detailed_stats" | "custom"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_tooltip_format: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TriggerLimit {
    pub enabled: bool,
    pub threshold: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CostMilestone {
    pub enabled: bool,
    pub amount: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTrayNotificationTriggers {
    pub new_block: bool,
    pub daily_limit: TriggerLimit,
    pub monthly_limit: TriggerLimit,
    pub session_limit: TriggerLimit,
    pub cost_milestone: CostMilestone,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTrayNotifications {
    pub enabled: bool,
    pub triggers: SystemTrayNotificationTriggers,
    pub style: String, // "native" | "in_app"
    pub sound: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemTraySettings {
    pub enabled: bool,
    pub display: SystemTrayDisplay,
    pub behavior: SystemTrayBehavior,
    pub visual: SystemTrayVisual,
    pub notifications: SystemTrayNotifications,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub theme: String,
    pub custom_data_directories: Vec<String>,
    pub notification_limits: NotificationLimits,
    pub cost_mode: String,
    pub auto_refresh: bool,
    pub refresh_interval: u32,
    pub show_in_system_tray: bool, // Keep for backward compatibility
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system_tray: Option<SystemTraySettings>, // New structure
    pub launch_at_startup: bool,
    pub default_export_format: String,
    #[serde(default)]
    pub compact_mode: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            custom_data_directories: Vec::new(),
            notification_limits: NotificationLimits {
                daily: None,
                monthly: None,
                session: None,
            },
            cost_mode: "auto".to_string(),
            auto_refresh: true,
            refresh_interval: 300,
            show_in_system_tray: true,
            system_tray: None, // Will be populated by TypeScript migration logic
            launch_at_startup: false,
            default_export_format: "csv".to_string(),
            compact_mode: false,
        }
    }
}

impl AppSettings {
    pub fn from_store(store: &Store<tauri::Wry>) -> Self {
        // Try to load entire settings object first
        if let Some(settings_value) = store.get("settings") {
            if let Ok(settings) = serde_json::from_value::<AppSettings>(settings_value.clone()) {
                return settings;
            }
        }
        
        // Fall back to default if not found or invalid
        Self::default()
    }
    
    pub fn save_to_store(&self, store: &Store<tauri::Wry>) -> Result<(), String> {
        // Save entire settings object
        store.set("settings", serde_json::to_value(self).unwrap());
        
        store.save().map_err(|e| format!("Failed to save settings: {}", e))?;
        
        Ok(())
    }
}

pub fn init(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Ensure store is initialized
    let _store = app.store("settings.json")?;
    Ok(())
}

pub fn get_settings_store(app: &AppHandle) -> Result<Arc<Store<tauri::Wry>>, String> {
    app.store("settings.json")
        .map_err(|e| format!("Failed to get settings store: {}", e))
}