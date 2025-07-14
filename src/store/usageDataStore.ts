import { create } from 'zustand';
import { UsageData, DailyUsage, MonthlyUsage, SessionUsage, BlockUsage, CostMode } from '../lib/types';
import { parseJSONLContent, processDailyUsage, processMonthlyUsage, processSessionUsage, processBlockUsage } from '../lib/data-processor';
import { invoke } from '@tauri-apps/api/core';

interface UsageDataState {
  // Raw data
  rawData: UsageData[];
  isLoading: boolean;
  error: string | null;
  lastLoadTime: Date | null;
  
  // Processed reports
  dailyReport: DailyUsage[];
  monthlyReport: MonthlyUsage[];
  sessionReport: SessionUsage[];
  blockReport: BlockUsage[];
  
  // Current block info for system tray
  currentBlock: BlockUsage | null;
  
  // Actions
  loadUsageData: (sinceDate?: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearData: () => void;
  processReports: (costMode: CostMode) => void;
}

export const useUsageDataStore = create<UsageDataState>((set, get) => ({
  // Initial state
  rawData: [],
  isLoading: false, // Start with loading false to prevent initialization issues
  error: null,
  lastLoadTime: null,
  dailyReport: [],
  monthlyReport: [],
  sessionReport: [],
  blockReport: [],
  currentBlock: null,
  
  // Load usage data from backend
  loadUsageData: async (sinceDate?: string) => {
    console.log('[UsageDataStore] loadUsageData called with sinceDate:', sinceDate);
    set({ isLoading: true, error: null });
    
    try {
      // Fetch JSONL content from backend
      console.log('[UsageDataStore] Invoking load_usage_entries...');
      const jsonLines = await invoke<string[]>('load_usage_entries', { sinceDate });
      console.log('[UsageDataStore] Received', jsonLines.length, 'JSONL files');
      
      // Handle case where no data is found
      if (jsonLines.length === 0) {
        console.log('[UsageDataStore] No Claude data found. This is normal for new installations.');
        set({ 
          rawData: [], 
          lastLoadTime: new Date(),
          isLoading: false,
          error: null
        });
        get().processReports('auto');
        return;
      }
      
      // Parse all JSONL content
      const allData: UsageData[] = [];
      let parseErrors = 0;
      for (const line of jsonLines) {
        try {
          const entries = parseJSONLContent(line);
          allData.push(...entries);
        } catch (err) {
          parseErrors++;
          console.warn('[UsageDataStore] Failed to parse JSONL line:', err);
        }
      }
      
      console.log('[UsageDataStore] Parsed', allData.length, 'usage entries with', parseErrors, 'errors');
      
      // Sort by timestamp (with null safety)
      allData.sort((a, b) => {
        if (!a.timestamp && !b.timestamp) return 0;
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return a.timestamp.localeCompare(b.timestamp);
      });
      
      set({ 
        rawData: allData, 
        lastLoadTime: new Date(),
        isLoading: false 
      });
      
      // Process reports with default cost mode
      console.log('[UsageDataStore] Processing reports...');
      get().processReports('auto');
      console.log('[UsageDataStore] Data load complete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load usage data';
      console.error('[UsageDataStore] Failed to load data:', error);
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
  
  // Process reports from raw data
  processReports: (costMode: CostMode) => {
    const rawData = get().rawData;
    console.log('[UsageDataStore] Processing reports for', rawData.length, 'entries with cost mode:', costMode);
    
    // Process different report types
    const dailyReport = processDailyUsage(rawData, costMode);
    const monthlyReport = processMonthlyUsage(rawData, costMode);
    const blockReport = processBlockUsage(rawData, costMode);
    
    // Find current active block
    const currentBlock = blockReport.find(block => block.isActive) || null;
    
    // Process session report
    const sessionReport = processSessionUsage(rawData, costMode);
    
    console.log('[UsageDataStore] Report processing complete:');
    console.log('  - Daily entries:', dailyReport.length);
    console.log('  - Monthly entries:', monthlyReport.length);
    console.log('  - Session entries:', sessionReport.length);
    console.log('  - Block entries:', blockReport.length);
    console.log('  - Current block:', currentBlock ? 'Active' : 'None');
    
    set({
      dailyReport,
      monthlyReport,
      sessionReport,
      blockReport,
      currentBlock,
    });
  },
  
  setError: (error: string | null) => set({ error }),
  
  clearData: () => set({
    rawData: [],
    dailyReport: [],
    monthlyReport: [],
    sessionReport: [],
    blockReport: [],
    currentBlock: null,
    lastLoadTime: null,
    error: null,
  }),
}));