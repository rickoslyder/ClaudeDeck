import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { CostMode } from '../lib/types';

export interface SystemTraySettings {
  enabled: boolean;
  display: {
    mode: 'compact' | 'detailed' | 'custom';
    showItems: {
      currentBlockTokens: boolean;
      currentBlockCost: boolean;
      currentBlockModels: boolean;
      currentBlockTimeRemaining: boolean;
      dailyTotal: boolean;
      sessionTotal: boolean;
      monthlyTotal: boolean;
    };
    customFormat?: string;
    numberFormat: {
      tokensUnit: 'raw' | 'k' | 'M';
      costDecimals: 0 | 1 | 2;
      compactNumbers: boolean;
    };
    updateInterval: number;
  };
  behavior: {
    clickAction: 'open_app' | 'show_popup' | 'toggle_window' | 'none';
    rightClickShowsMenu: boolean;
    showOnlyWhenActive: boolean;
    inactivityTimeout: number;
    startMinimized: boolean;
  };
  visual: {
    iconStyle: 'default' | 'monochrome' | 'usage_based';
    showTooltip: boolean;
    tooltipContent: 'same_as_title' | 'detailed_stats' | 'custom';
    customTooltipFormat?: string;
  };
  notifications: {
    enabled: boolean;
    triggers: {
      newBlock: boolean;
      dailyLimit: { enabled: boolean; threshold: number };
      monthlyLimit: { enabled: boolean; threshold: number };
      sessionLimit: { enabled: boolean; threshold: number };
      costMilestone: { enabled: boolean; amount: number };
    };
    style: 'native' | 'in_app';
    sound: boolean;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  customDataDirectories: string[];
  notificationLimits: {
    daily: number | null;
    monthly: number | null;
    session: number | null;
  };
  costMode: CostMode;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  showInSystemTray: boolean; // Keep for backward compatibility
  systemTray?: SystemTraySettings; // New structure
  launchAtStartup: boolean;
  defaultExportFormat: 'csv' | 'json';
  compactMode: boolean; // Show only total tokens in tables
}

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  loadSettings: () => Promise<void>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSystemTraySettings: SystemTraySettings = {
  enabled: true,
  display: {
    mode: 'compact',
    showItems: {
      currentBlockTokens: true,
      currentBlockCost: true,
      currentBlockModels: false,
      currentBlockTimeRemaining: false,
      dailyTotal: true,
      sessionTotal: false,
      monthlyTotal: false,
    },
    customFormat: '{tokens} | ${cost} | {models}',
    numberFormat: {
      tokensUnit: 'k',
      costDecimals: 2,
      compactNumbers: true,
    },
    updateInterval: 60, // 1 minute
  },
  behavior: {
    clickAction: 'open_app',
    rightClickShowsMenu: true,
    showOnlyWhenActive: false,
    inactivityTimeout: 30, // 30 minutes
    startMinimized: false,
  },
  visual: {
    iconStyle: 'default',
    showTooltip: true,
    tooltipContent: 'same_as_title',
    customTooltipFormat: '',
  },
  notifications: {
    enabled: false,
    triggers: {
      newBlock: false,
      dailyLimit: { enabled: false, threshold: 80 },
      monthlyLimit: { enabled: false, threshold: 80 },
      sessionLimit: { enabled: false, threshold: 80 },
      costMilestone: { enabled: false, amount: 10 },
    },
    style: 'native',
    sound: false,
  },
};

const defaultSettings: AppSettings = {
  theme: 'system',
  customDataDirectories: [],
  notificationLimits: {
    daily: null,
    monthly: null,
    session: null,
  },
  costMode: 'auto',
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
  showInSystemTray: true,
  systemTray: defaultSystemTraySettings,
  launchAtStartup: false,
  defaultExportFormat: 'csv',
  compactMode: false,
};

// Helper function to migrate old settings to new format
function migrateSettings(settings: any): AppSettings {
  // If systemTray is not defined, migrate from showInSystemTray
  if (!settings.systemTray && settings.showInSystemTray !== undefined) {
    return {
      ...settings,
      systemTray: {
        ...defaultSystemTraySettings,
        enabled: settings.showInSystemTray,
      },
    };
  }
  
  // If systemTray exists but is incomplete, merge with defaults
  if (settings.systemTray) {
    return {
      ...settings,
      systemTray: {
        ...defaultSystemTraySettings,
        ...settings.systemTray,
        display: {
          ...defaultSystemTraySettings.display,
          ...(settings.systemTray.display || {}),
          showItems: {
            ...defaultSystemTraySettings.display.showItems,
            ...(settings.systemTray.display?.showItems || {}),
          },
          numberFormat: {
            ...defaultSystemTraySettings.display.numberFormat,
            ...(settings.systemTray.display?.numberFormat || {}),
          },
        },
        behavior: {
          ...defaultSystemTraySettings.behavior,
          ...(settings.systemTray.behavior || {}),
        },
        visual: {
          ...defaultSystemTraySettings.visual,
          ...(settings.systemTray.visual || {}),
        },
        notifications: {
          ...defaultSystemTraySettings.notifications,
          ...(settings.systemTray.notifications || {}),
          triggers: {
            ...defaultSystemTraySettings.notifications.triggers,
            ...(settings.systemTray.notifications?.triggers || {}),
          },
        },
      },
    };
  }
  
  return settings;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: false, // Start with loading false to prevent initialization issues
  isSaving: false,
  error: null,
  
  // Load settings from backend
  loadSettings: async () => {
    console.log('[SettingsStore] loadSettings called');
    set({ isLoading: true, error: null });
    
    try {
      console.log('[SettingsStore] Invoking get_settings...');
      const rawSettings = await invoke<any>('get_settings');
      console.log('[SettingsStore] Raw settings loaded:', rawSettings);
      
      // Migrate settings to ensure compatibility
      const settings = migrateSettings(rawSettings);
      console.log('[SettingsStore] Settings migrated successfully:', settings);
      
      set({ settings, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      console.error('[SettingsStore] Failed to load settings:', error);
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
  
  // Save settings to backend
  saveSettings: async (settings: AppSettings) => {
    console.log('[SettingsStore] saveSettings called with:', settings);
    set({ isSaving: true, error: null });
    
    try {
      console.log('[SettingsStore] Invoking save_settings...');
      await invoke('save_settings', { settings });
      console.log('[SettingsStore] Settings saved successfully');
      set({ settings, isSaving: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      console.error('[SettingsStore] Failed to save settings:', error);
      set({ 
        error: errorMessage,
        isSaving: false 
      });
    }
  },
  
  // Update settings locally
  updateSettings: (partial: Partial<AppSettings>) => {
    console.log('[SettingsStore] updateSettings called with:', partial);
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, ...partial };
    console.log('[SettingsStore] New settings:', newSettings);
    set({ settings: newSettings });
  },
  
  // Reset to defaults
  resetToDefaults: () => {
    set({ settings: defaultSettings });
  },
}));