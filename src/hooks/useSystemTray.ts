import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useUsageDataStore } from '../store/usageDataStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatModelsDisplay } from '../lib/data-processor';
import { SystemTraySettings } from '../store/settingsStore';

// Helper function to format tokens based on settings
function formatTokens(tokens: number, unit: 'raw' | 'k' | 'M'): string {
  switch (unit) {
    case 'raw':
      return tokens.toLocaleString();
    case 'k':
      return `${(tokens / 1000).toFixed(1)}k`;
    case 'M':
      return `${(tokens / 1000000).toFixed(2)}M`;
    default:
      return `${(tokens / 1000).toFixed(1)}k`;
  }
}

// Helper function to format cost based on settings
function formatCost(cost: number, decimals: number): string {
  return `$${cost.toFixed(decimals)}`;
}

// Helper function to calculate time remaining in block (5 hours)
function getTimeRemaining(startTime: Date): string {
  const now = new Date();
  const endTime = new Date(startTime.getTime() + 5 * 60 * 60 * 1000); // 5 hours
  const remaining = endTime.getTime() - now.getTime();
  
  if (remaining <= 0) return '0m';
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Helper function to build tray title based on settings
function buildTrayTitle(
  settings: SystemTraySettings,
  currentBlock: any,
  dailyTotal: { tokens: number; cost: number } | null,
  sessionTotal: { tokens: number; cost: number } | null,
  monthlyTotal: { tokens: number; cost: number } | null
): string {
  const { display } = settings;
  const { showItems, numberFormat, customFormat, mode } = display;
  
  // If no current block and mode is compact, show default
  if (!currentBlock && mode === 'compact') {
    return 'ClaudeDeck';
  }
  
  // Build components based on what should be shown
  const components: Record<string, string> = {};
  
  if (currentBlock) {
    if (showItems.currentBlockTokens) {
      components.tokens = formatTokens(currentBlock.totalTokens, numberFormat.tokensUnit);
    }
    if (showItems.currentBlockCost) {
      components.cost = formatCost(currentBlock.totalCost, numberFormat.costDecimals);
    }
    if (showItems.currentBlockModels) {
      components.models = formatModelsDisplay(currentBlock.models) || '';
    }
    if (showItems.currentBlockTimeRemaining) {
      components.timeRemaining = getTimeRemaining(currentBlock.startTime);
    }
  }
  
  if (showItems.dailyTotal && dailyTotal) {
    components.dailyTokens = formatTokens(dailyTotal.tokens, numberFormat.tokensUnit);
    components.dailyCost = formatCost(dailyTotal.cost, numberFormat.costDecimals);
  }
  
  if (showItems.sessionTotal && sessionTotal) {
    components.sessionTokens = formatTokens(sessionTotal.tokens, numberFormat.tokensUnit);
    components.sessionCost = formatCost(sessionTotal.cost, numberFormat.costDecimals);
  }
  
  if (showItems.monthlyTotal && monthlyTotal) {
    components.monthlyTokens = formatTokens(monthlyTotal.tokens, numberFormat.tokensUnit);
    components.monthlyCost = formatCost(monthlyTotal.cost, numberFormat.costDecimals);
  }
  
  // Format based on mode
  switch (mode) {
    case 'compact':
      // Show only current block tokens and cost
      const parts = [];
      if (components.tokens) parts.push(components.tokens);
      if (components.cost) parts.push(components.cost);
      return parts.join(' | ') || 'ClaudeDeck';
      
    case 'detailed':
      // Show all enabled items
      const detailParts = [];
      if (components.tokens) detailParts.push(`${components.tokens} tokens`);
      if (components.cost) detailParts.push(components.cost);
      if (components.models) detailParts.push(components.models);
      if (components.timeRemaining) detailParts.push(`${components.timeRemaining} left`);
      if (components.dailyCost) detailParts.push(`Today: ${components.dailyCost}`);
      return detailParts.join(' | ') || 'ClaudeDeck';
      
    case 'custom':
      // Use custom format string
      if (!customFormat) return 'ClaudeDeck';
      
      let formatted = customFormat;
      // Replace placeholders
      Object.entries(components).forEach(([key, value]) => {
        formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
      
      // Clean up any remaining placeholders
      formatted = formatted.replace(/\{[^}]+\}/g, '');
      return formatted.trim() || 'ClaudeDeck';
      
    default:
      return 'ClaudeDeck';
  }
}

export function useSystemTray() {
  const currentBlock = useUsageDataStore(state => state.currentBlock);
  const dailyReport = useUsageDataStore(state => state.dailyReport);
  const sessionReport = useUsageDataStore(state => state.sessionReport);
  const monthlyReport = useUsageDataStore(state => state.monthlyReport);
  const settings = useSettingsStore(state => state.settings);
  const lastUpdateRef = useRef<number>(0);
  
  // Use new settings structure with fallback to old
  const systemTraySettings = settings?.systemTray || {
    enabled: settings?.showInSystemTray ?? true,
    display: {
      mode: 'compact' as const,
      showItems: {
        currentBlockTokens: true,
        currentBlockCost: true,
        currentBlockModels: true,
        currentBlockTimeRemaining: false,
        dailyTotal: false,
        sessionTotal: false,
        monthlyTotal: false,
      },
      customFormat: '{tokens} | ${cost} | {models}',
      numberFormat: {
        tokensUnit: 'k' as const,
        costDecimals: 2,
        compactNumbers: true,
      },
      updateInterval: 60,
    },
    behavior: {
      clickAction: 'open_app' as const,
      rightClickShowsMenu: true,
      showOnlyWhenActive: false,
      inactivityTimeout: 30,
      startMinimized: false,
    },
    visual: {
      iconStyle: 'default' as const,
      showTooltip: true,
      tooltipContent: 'same_as_title' as const,
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
      style: 'native' as const,
      sound: false,
    },
  };
  
  useEffect(() => {
    try {
      const now = Date.now();
      const updateInterval = systemTraySettings.display.updateInterval * 1000;
      
      // Check if we should update based on interval
      if (now - lastUpdateRef.current < updateInterval) {
        return;
      }
      
      lastUpdateRef.current = now;
      
      console.log('[useSystemTray] enabled:', systemTraySettings.enabled, 'currentBlock:', currentBlock);
      
      if (!systemTraySettings.enabled) {
        // Clear tray title when disabled
        invoke('update_tray_title', { title: '' }).catch(console.error);
        return;
      }
      
      // Calculate totals if needed
      const dailyTotal = systemTraySettings.display.showItems.dailyTotal && dailyReport[0]
        ? { tokens: dailyReport[0].totalTokens, cost: dailyReport[0].totalCost }
        : null;
        
      const sessionTotal = systemTraySettings.display.showItems.sessionTotal && sessionReport[0]
        ? { tokens: sessionReport[0].totalTokens, cost: sessionReport[0].totalCost }
        : null;
        
      const monthlyTotal = systemTraySettings.display.showItems.monthlyTotal && monthlyReport[0]
        ? { tokens: monthlyReport[0].totalTokens, cost: monthlyReport[0].totalCost }
        : null;
      
      // Build the title based on settings
      const title = buildTrayTitle(
        systemTraySettings,
        currentBlock,
        dailyTotal,
        sessionTotal,
        monthlyTotal
      );
      
      console.log('[useSystemTray] Updating tray title to:', title);
      invoke('update_tray_title', { title }).catch(console.error);
      
      // Update tooltip if different from title
      if (systemTraySettings.visual.showTooltip) {
        let tooltip = title; // Default to same as title
        
        if (systemTraySettings.visual.tooltipContent === 'detailed_stats') {
          // Build detailed stats tooltip
          const tooltipParts = [];
          if (currentBlock) {
            tooltipParts.push(`Current Block: ${formatTokens(currentBlock.totalTokens, 'k')} tokens (${formatCost(currentBlock.totalCost, 2)})`);
            const models = formatModelsDisplay(currentBlock.models);
            if (models) tooltipParts.push(`Models: ${models}`);
            const timeRemaining = getTimeRemaining(currentBlock.startTime);
            if (timeRemaining) tooltipParts.push(`Time Remaining: ${timeRemaining}`);
          }
          if (dailyTotal) tooltipParts.push(`Today: ${formatTokens(dailyTotal.tokens, 'k')} tokens (${formatCost(dailyTotal.cost, 2)})`);
          if (sessionTotal) tooltipParts.push(`Session: ${formatTokens(sessionTotal.tokens, 'k')} tokens (${formatCost(sessionTotal.cost, 2)})`);
          if (monthlyTotal) tooltipParts.push(`Monthly: ${formatTokens(monthlyTotal.tokens, 'k')} tokens (${formatCost(monthlyTotal.cost, 2)})`);
          
          tooltip = tooltipParts.join('\n') || 'ClaudeDeck - No active usage';
        } else if (systemTraySettings.visual.tooltipContent === 'custom' && systemTraySettings.visual.customTooltipFormat) {
          // Build components for custom format
          const components: Record<string, string> = {};
          
          if (currentBlock) {
            components.tokens = formatTokens(currentBlock.totalTokens, systemTraySettings.display.numberFormat.tokensUnit);
            components.cost = formatCost(currentBlock.totalCost, systemTraySettings.display.numberFormat.costDecimals);
            components.models = formatModelsDisplay(currentBlock.models) || '';
            components.timeRemaining = getTimeRemaining(currentBlock.startTime);
          }
          
          if (dailyTotal) {
            components.dailyTokens = formatTokens(dailyTotal.tokens, systemTraySettings.display.numberFormat.tokensUnit);
            components.dailyCost = formatCost(dailyTotal.cost, systemTraySettings.display.numberFormat.costDecimals);
          }
          
          if (sessionTotal) {
            components.sessionTokens = formatTokens(sessionTotal.tokens, systemTraySettings.display.numberFormat.tokensUnit);
            components.sessionCost = formatCost(sessionTotal.cost, systemTraySettings.display.numberFormat.costDecimals);
          }
          
          if (monthlyTotal) {
            components.monthlyTokens = formatTokens(monthlyTotal.tokens, systemTraySettings.display.numberFormat.tokensUnit);
            components.monthlyCost = formatCost(monthlyTotal.cost, systemTraySettings.display.numberFormat.costDecimals);
          }
          
          // Use custom format
          let formatted = systemTraySettings.visual.customTooltipFormat;
          Object.entries(components).forEach(([key, value]) => {
            formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
          });
          tooltip = formatted.trim() || 'ClaudeDeck';
        }
        
        console.log('[useSystemTray] Setting tray tooltip to:', tooltip);
        invoke('set_tray_tooltip', { tooltip }).catch(console.error);
      }
      
      // Check for notifications
      if (systemTraySettings.notifications.enabled) {
        // TODO: Implement notification triggers
      }
    } catch (error) {
      console.error('[useSystemTray] Error in system tray hook:', error);
    }
  }, [currentBlock, dailyReport, sessionReport, monthlyReport, systemTraySettings]);
}