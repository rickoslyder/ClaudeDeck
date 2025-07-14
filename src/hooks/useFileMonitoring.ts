import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useUsageDataStore } from '../store/usageDataStore';
import { useSettingsStore } from '../store/settingsStore';

interface FileChangeEvent {
  path: string;
  kind: 'created' | 'modified' | 'removed';
}

export function useFileMonitoring() {
  const settings = useSettingsStore(state => state.settings);
  const { autoRefresh } = settings || { autoRefresh: true };
  
  useEffect(() => {
    if (!autoRefresh) return;
    
    try {
      console.log('[useFileMonitoring] Setting up file monitoring...');
      // Listen for file changes from the backend
      const unlisten = listen<FileChangeEvent>('file-changed', async (event) => {
        console.log('[useFileMonitoring] File changed:', event.payload);
        
        // Reload data when Claude files change
        if (event.payload.path.includes('Claude/') && event.payload.path.endsWith('.jsonl')) {
          // Load only recent data for performance
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const { loadUsageData, processReports } = useUsageDataStore.getState();
          await loadUsageData(thirtyDaysAgo.toISOString().split('T')[0]);
          
          // Get current cost mode from settings store
          const currentSettings = useSettingsStore.getState().settings;
          const currentCostMode = currentSettings?.costMode || 'auto';
          
          // Reprocess with current cost mode
          processReports(currentCostMode);
        }
      });
      
      return () => {
        unlisten.then(fn => fn()).catch(console.error);
      };
    } catch (error) {
      console.error('[useFileMonitoring] Failed to set up file monitoring:', error);
    }
  }, [autoRefresh]); // Remove costMode to prevent re-runs on every settings change
}

export function useAutoRefresh() {
  const settings = useSettingsStore(state => state.settings);
  const { autoRefresh, refreshInterval } = settings || { autoRefresh: true, refreshInterval: 300 };
  
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;
    
    try {
      console.log('[useAutoRefresh] Setting up auto-refresh with interval:', refreshInterval);
      // Set up interval for auto-refresh
      const interval = setInterval(() => {
        console.log('[useAutoRefresh] Auto-refresh triggered');
        // Load only recent data for performance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { loadUsageData } = useUsageDataStore.getState();
        loadUsageData(thirtyDaysAgo.toISOString().split('T')[0]);
      }, refreshInterval * 1000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('[useAutoRefresh] Failed to set up auto-refresh:', error);
    }
  }, [autoRefresh, refreshInterval]);
}