import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppSettings, SystemTraySettings as SystemTrayConfig } from '@/store/settingsStore';
import { 
  ChevronDown, 
  ChevronUp, 
  Monitor, 
  Bell, 
  Palette, 
  MousePointer,
  Eye,
  EyeOff,
  Clock,
  DollarSign,
  Hash
} from 'lucide-react';

interface SystemTraySettingsProps {
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
}

export function SystemTraySettings({ settings, onUpdateSettings }: SystemTraySettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get system tray config from settings
  const systemTrayConfig = settings.systemTray || {
    enabled: settings.showInSystemTray ?? true,
    display: {
      mode: 'compact' as const,
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

  const handleConfigUpdate = (updates: Partial<SystemTrayConfig>) => {
    const newConfig = {
      ...systemTrayConfig,
      ...updates,
      display: {
        ...systemTrayConfig.display,
        ...(updates.display || {}),
        showItems: {
          ...systemTrayConfig.display.showItems,
          ...(updates.display?.showItems || {}),
        },
        numberFormat: {
          ...systemTrayConfig.display.numberFormat,
          ...(updates.display?.numberFormat || {}),
        },
      },
      behavior: {
        ...systemTrayConfig.behavior,
        ...(updates.behavior || {}),
      },
      visual: {
        ...systemTrayConfig.visual,
        ...(updates.visual || {}),
      },
      notifications: {
        ...systemTrayConfig.notifications,
        ...(updates.notifications || {}),
        triggers: {
          ...systemTrayConfig.notifications.triggers,
          ...(updates.notifications?.triggers || {}),
        },
      },
    };
    
    onUpdateSettings({ 
      systemTray: newConfig,
      // Keep backward compatibility
      showInSystemTray: newConfig.enabled 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          System Tray
        </CardTitle>
        <CardDescription>
          Configure how ClaudeDeck appears in your system tray
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Show in System Tray</label>
              <p className="text-xs text-muted-foreground">
                Display ClaudeDeck status in the system tray
              </p>
            </div>
            <Button
              variant={systemTrayConfig.enabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleConfigUpdate({ enabled: !systemTrayConfig.enabled })}
            >
              {systemTrayConfig.enabled ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
              {systemTrayConfig.enabled ? 'Visible' : 'Hidden'}
            </Button>
          </div>

          {systemTrayConfig.enabled && (
            <>
              {/* Display Mode */}
              <div>
                <label className="text-sm font-medium block mb-2">Display Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={systemTrayConfig.display.mode === 'compact' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigUpdate({ display: { ...systemTrayConfig.display, mode: 'compact' } })}
                  >
                    Compact
                  </Button>
                  <Button
                    variant={systemTrayConfig.display.mode === 'detailed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigUpdate({ display: { ...systemTrayConfig.display, mode: 'detailed' } })}
                  >
                    Detailed
                  </Button>
                  <Button
                    variant={systemTrayConfig.display.mode === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigUpdate({ display: { ...systemTrayConfig.display, mode: 'custom' } })}
                  >
                    Custom
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose how information is displayed in the system tray
                </p>
              </div>

              {/* Display Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Items</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={systemTrayConfig.display.showItems.currentBlockTokens}
                      onChange={(e) => handleConfigUpdate({ 
                        display: { 
                          ...systemTrayConfig.display, 
                          showItems: { ...systemTrayConfig.display.showItems, currentBlockTokens: e.target.checked } 
                        } 
                      })}
                      className="rounded border-gray-300"
                    />
                    <Hash className="h-3 w-3" />
                    Block Tokens
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={systemTrayConfig.display.showItems.currentBlockCost}
                      onChange={(e) => handleConfigUpdate({ 
                        display: { 
                          ...systemTrayConfig.display, 
                          showItems: { ...systemTrayConfig.display.showItems, currentBlockCost: e.target.checked } 
                        } 
                      })}
                      className="rounded border-gray-300"
                    />
                    <DollarSign className="h-3 w-3" />
                    Block Cost
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={systemTrayConfig.display.showItems.currentBlockModels}
                      onChange={(e) => handleConfigUpdate({ 
                        display: { 
                          ...systemTrayConfig.display, 
                          showItems: { ...systemTrayConfig.display.showItems, currentBlockModels: e.target.checked } 
                        } 
                      })}
                      className="rounded border-gray-300"
                    />
                    Model Names
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={systemTrayConfig.display.showItems.currentBlockTimeRemaining}
                      onChange={(e) => handleConfigUpdate({ 
                        display: { 
                          ...systemTrayConfig.display, 
                          showItems: { ...systemTrayConfig.display.showItems, currentBlockTimeRemaining: e.target.checked } 
                        } 
                      })}
                      className="rounded border-gray-300"
                    />
                    <Clock className="h-3 w-3" />
                    Time Remaining
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={systemTrayConfig.display.showItems.dailyTotal}
                      onChange={(e) => handleConfigUpdate({ 
                        display: { 
                          ...systemTrayConfig.display, 
                          showItems: { ...systemTrayConfig.display.showItems, dailyTotal: e.target.checked } 
                        } 
                      })}
                      className="rounded border-gray-300"
                    />
                    Daily Total
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={systemTrayConfig.display.showItems.sessionTotal}
                      onChange={(e) => handleConfigUpdate({ 
                        display: { 
                          ...systemTrayConfig.display, 
                          showItems: { ...systemTrayConfig.display.showItems, sessionTotal: e.target.checked } 
                        } 
                      })}
                      className="rounded border-gray-300"
                    />
                    Session Total
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={systemTrayConfig.display.showItems.monthlyTotal}
                      onChange={(e) => handleConfigUpdate({ 
                        display: { 
                          ...systemTrayConfig.display, 
                          showItems: { ...systemTrayConfig.display.showItems, monthlyTotal: e.target.checked } 
                        } 
                      })}
                      className="rounded border-gray-300"
                    />
                    Monthly Total
                  </label>
                </div>
              </div>

              {/* Custom Format */}
              {systemTrayConfig.display.mode === 'custom' && (
                <div>
                  <label className="text-sm font-medium block mb-2">Custom Format</label>
                  <input
                    type="text"
                    value={systemTrayConfig.display.customFormat || ''}
                    onChange={(e) => handleConfigUpdate({ display: { ...systemTrayConfig.display, customFormat: e.target.value } })}
                    placeholder="{tokens} | ${cost} | {models}"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {'{tokens}'}, {'{cost}'}, {'{models}'}, {'{timeRemaining}'}, {'{dailyTokens}'}, {'{dailyCost}'}, etc.
                  </p>
                </div>
              )}

              {/* Number Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Number Format</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Token Units</label>
                    <div className="flex gap-1">
                      <Button
                        variant={systemTrayConfig.display.numberFormat.tokensUnit === 'raw' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleConfigUpdate({ 
                          display: { 
                            ...systemTrayConfig.display, 
                            numberFormat: { ...systemTrayConfig.display.numberFormat, tokensUnit: 'raw' } 
                          } 
                        })}
                      >
                        Raw
                      </Button>
                      <Button
                        variant={systemTrayConfig.display.numberFormat.tokensUnit === 'k' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleConfigUpdate({ 
                          display: { 
                            ...systemTrayConfig.display, 
                            numberFormat: { ...systemTrayConfig.display.numberFormat, tokensUnit: 'k' } 
                          } 
                        })}
                      >
                        K
                      </Button>
                      <Button
                        variant={systemTrayConfig.display.numberFormat.tokensUnit === 'M' ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleConfigUpdate({ 
                          display: { 
                            ...systemTrayConfig.display, 
                            numberFormat: { ...systemTrayConfig.display.numberFormat, tokensUnit: 'M' } 
                          } 
                        })}
                      >
                        M
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Cost Decimals</label>
                    <div className="flex gap-1">
                      <Button
                        variant={systemTrayConfig.display.numberFormat.costDecimals === 0 ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleConfigUpdate({ 
                          display: { 
                            ...systemTrayConfig.display, 
                            numberFormat: { ...systemTrayConfig.display.numberFormat, costDecimals: 0 } 
                          } 
                        })}
                      >
                        $0
                      </Button>
                      <Button
                        variant={systemTrayConfig.display.numberFormat.costDecimals === 1 ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleConfigUpdate({ 
                          display: { 
                            ...systemTrayConfig.display, 
                            numberFormat: { ...systemTrayConfig.display.numberFormat, costDecimals: 1 } 
                          } 
                        })}
                      >
                        $0.0
                      </Button>
                      <Button
                        variant={systemTrayConfig.display.numberFormat.costDecimals === 2 ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleConfigUpdate({ 
                          display: { 
                            ...systemTrayConfig.display, 
                            numberFormat: { ...systemTrayConfig.display.numberFormat, costDecimals: 2 } 
                          } 
                        })}
                      >
                        $0.00
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Interval */}
              <div>
                <label className="text-sm font-medium block mb-2">Update Interval</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={systemTrayConfig.display.updateInterval}
                    onChange={(e) => handleConfigUpdate({ 
                      display: { 
                        ...systemTrayConfig.display, 
                        updateInterval: parseInt(e.target.value) || 60 
                      } 
                    })}
                    className="h-8 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">seconds</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  How often to update the system tray display
                </p>
              </div>
            </>
          )}
        </div>

        {/* Advanced Settings Toggle */}
        {systemTrayConfig.enabled && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="font-medium">Advanced Settings</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="mt-4 space-y-6 pt-4 border-t">
                {/* Behavior Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    Behavior
                  </h4>
                  
                  <div>
                    <label className="text-sm font-medium block mb-2">Click Action</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={systemTrayConfig.behavior.clickAction === 'open_app' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigUpdate({ 
                          behavior: { ...systemTrayConfig.behavior, clickAction: 'open_app' } 
                        })}
                      >
                        Open App
                      </Button>
                      <Button
                        variant={systemTrayConfig.behavior.clickAction === 'show_popup' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigUpdate({ 
                          behavior: { ...systemTrayConfig.behavior, clickAction: 'show_popup' } 
                        })}
                      >
                        Show Popup
                      </Button>
                      <Button
                        variant={systemTrayConfig.behavior.clickAction === 'toggle_window' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigUpdate({ 
                          behavior: { ...systemTrayConfig.behavior, clickAction: 'toggle_window' } 
                        })}
                      >
                        Toggle Window
                      </Button>
                      <Button
                        variant={systemTrayConfig.behavior.clickAction === 'none' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigUpdate({ 
                          behavior: { ...systemTrayConfig.behavior, clickAction: 'none' } 
                        })}
                      >
                        None
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Right-click shows menu</label>
                      <p className="text-xs text-muted-foreground">
                        Show context menu on right-click
                      </p>
                    </div>
                    <Button
                      variant={systemTrayConfig.behavior.rightClickShowsMenu ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigUpdate({ 
                        behavior: { ...systemTrayConfig.behavior, rightClickShowsMenu: !systemTrayConfig.behavior.rightClickShowsMenu } 
                      })}
                    >
                      {systemTrayConfig.behavior.rightClickShowsMenu ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Show only when active</label>
                      <p className="text-xs text-muted-foreground">
                        Hide tray icon when no active usage
                      </p>
                    </div>
                    <Button
                      variant={systemTrayConfig.behavior.showOnlyWhenActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigUpdate({ 
                        behavior: { ...systemTrayConfig.behavior, showOnlyWhenActive: !systemTrayConfig.behavior.showOnlyWhenActive } 
                      })}
                    >
                      {systemTrayConfig.behavior.showOnlyWhenActive ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  {systemTrayConfig.behavior.showOnlyWhenActive && (
                    <div>
                      <label className="text-sm font-medium block mb-2">Inactivity Timeout (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={systemTrayConfig.behavior.inactivityTimeout}
                        onChange={(e) => handleConfigUpdate({ 
                          behavior: { ...systemTrayConfig.behavior, inactivityTimeout: parseInt(e.target.value) || 30 }
                        })}
                        className="h-8 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Start minimized to tray</label>
                      <p className="text-xs text-muted-foreground">
                        Launch app minimized to system tray
                      </p>
                    </div>
                    <Button
                      variant={systemTrayConfig.behavior.startMinimized ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigUpdate({ 
                        behavior: { ...systemTrayConfig.behavior, startMinimized: !systemTrayConfig.behavior.startMinimized } 
                      })}
                    >
                      {systemTrayConfig.behavior.startMinimized ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>

                {/* Visual Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Visual
                  </h4>

                  <div>
                    <label className="text-sm font-medium block mb-2">Icon Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={systemTrayConfig.visual.iconStyle === 'default' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigUpdate({ 
                          visual: { ...systemTrayConfig.visual, iconStyle: 'default' } 
                        })}
                      >
                        Default
                      </Button>
                      <Button
                        variant={systemTrayConfig.visual.iconStyle === 'monochrome' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigUpdate({ 
                          visual: { ...systemTrayConfig.visual, iconStyle: 'monochrome' } 
                        })}
                      >
                        Monochrome
                      </Button>
                      <Button
                        variant={systemTrayConfig.visual.iconStyle === 'usage_based' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigUpdate({ 
                          visual: { ...systemTrayConfig.visual, iconStyle: 'usage_based' } 
                        })}
                      >
                        Usage Based
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show tooltip on hover</label>
                    <Button
                      variant={systemTrayConfig.visual.showTooltip ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigUpdate({ 
                        visual: { ...systemTrayConfig.visual, showTooltip: !systemTrayConfig.visual.showTooltip } 
                      })}
                    >
                      {systemTrayConfig.visual.showTooltip ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  {systemTrayConfig.visual.showTooltip && (
                    <div>
                      <label className="text-sm font-medium block mb-2">Tooltip Content</label>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <Button
                          variant={systemTrayConfig.visual.tooltipContent === 'same_as_title' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleConfigUpdate({ 
                            visual: { ...systemTrayConfig.visual, tooltipContent: 'same_as_title' } 
                          })}
                        >
                          Same as Title
                        </Button>
                        <Button
                          variant={systemTrayConfig.visual.tooltipContent === 'detailed_stats' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleConfigUpdate({ 
                            visual: { ...systemTrayConfig.visual, tooltipContent: 'detailed_stats' } 
                          })}
                        >
                          Detailed Stats
                        </Button>
                        <Button
                          variant={systemTrayConfig.visual.tooltipContent === 'custom' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleConfigUpdate({ 
                            visual: { ...systemTrayConfig.visual, tooltipContent: 'custom' } 
                          })}
                        >
                          Custom
                        </Button>
                      </div>
                      
                      {systemTrayConfig.visual.tooltipContent === 'custom' && (
                        <input
                          type="text"
                          value={systemTrayConfig.visual.customTooltipFormat || ''}
                          onChange={(e) => handleConfigUpdate({ 
                            visual: { ...systemTrayConfig.visual, customTooltipFormat: e.target.value } 
                          })}
                          placeholder="Custom tooltip format..."
                          className="w-full h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h4>

                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium">Enable Notifications</label>
                    <Button
                      variant={systemTrayConfig.notifications.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigUpdate({ 
                        notifications: { ...systemTrayConfig.notifications, enabled: !systemTrayConfig.notifications.enabled } 
                      })}
                    >
                      {systemTrayConfig.notifications.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  {systemTrayConfig.notifications.enabled && (
                    <>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={systemTrayConfig.notifications.triggers.newBlock}
                            onChange={(e) => handleConfigUpdate({ 
                              notifications: {
                                ...systemTrayConfig.notifications,
                                triggers: {
                                  ...systemTrayConfig.notifications.triggers,
                                  newBlock: e.target.checked
                                }
                              }
                            })}
                            className="rounded border-gray-300"
                          />
                          Notify on new billing block
                        </label>
                      </div>

                      <div className="space-y-3 mt-2">
                        <div>
                          <label className="flex items-center gap-2 text-sm mb-2">
                            <input
                              type="checkbox"
                              checked={systemTrayConfig.notifications.triggers.dailyLimit.enabled}
                              onChange={(e) => handleConfigUpdate({ 
                                notifications: {
                                  ...systemTrayConfig.notifications,
                                  triggers: {
                                    ...systemTrayConfig.notifications.triggers,
                                    dailyLimit: { ...systemTrayConfig.notifications.triggers.dailyLimit, enabled: e.target.checked }
                                  }
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            Daily limit threshold
                          </label>
                          {systemTrayConfig.notifications.triggers.dailyLimit.enabled && (
                            <div className="ml-6 flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={systemTrayConfig.notifications.triggers.dailyLimit.threshold}
                                onChange={(e) => handleConfigUpdate({ 
                                  notifications: {
                                    ...systemTrayConfig.notifications,
                                    triggers: {
                                      ...systemTrayConfig.notifications.triggers,
                                      dailyLimit: { ...systemTrayConfig.notifications.triggers.dailyLimit, threshold: parseInt(e.target.value) || 80 }
                                    }
                                  }
                                })}
                                className="h-8 w-16 rounded-md border border-input bg-background px-3 py-1 text-sm"
                              />
                              <span className="text-sm text-muted-foreground">% of limit</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="flex items-center gap-2 text-sm mb-2">
                            <input
                              type="checkbox"
                              checked={systemTrayConfig.notifications.triggers.monthlyLimit.enabled}
                              onChange={(e) => handleConfigUpdate({ 
                                notifications: {
                                  ...systemTrayConfig.notifications,
                                  triggers: {
                                    ...systemTrayConfig.notifications.triggers,
                                    monthlyLimit: { ...systemTrayConfig.notifications.triggers.monthlyLimit, enabled: e.target.checked }
                                  }
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            Monthly limit threshold
                          </label>
                          {systemTrayConfig.notifications.triggers.monthlyLimit.enabled && (
                            <div className="ml-6 flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={systemTrayConfig.notifications.triggers.monthlyLimit.threshold}
                                onChange={(e) => handleConfigUpdate({ 
                                  notifications: {
                                    ...systemTrayConfig.notifications,
                                    triggers: {
                                      ...systemTrayConfig.notifications.triggers,
                                      monthlyLimit: { ...systemTrayConfig.notifications.triggers.monthlyLimit, threshold: parseInt(e.target.value) || 80 }
                                    }
                                  }
                                })}
                                className="h-8 w-16 rounded-md border border-input bg-background px-3 py-1 text-sm"
                              />
                              <span className="text-sm text-muted-foreground">% of limit</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="flex items-center gap-2 text-sm mb-2">
                            <input
                              type="checkbox"
                              checked={systemTrayConfig.notifications.triggers.costMilestone.enabled}
                              onChange={(e) => handleConfigUpdate({ 
                                notifications: {
                                  ...systemTrayConfig.notifications,
                                  triggers: {
                                    ...systemTrayConfig.notifications.triggers,
                                    costMilestone: { ...systemTrayConfig.notifications.triggers.costMilestone, enabled: e.target.checked }
                                  }
                                }
                              })}
                              className="rounded border-gray-300"
                            />
                            Cost milestone
                          </label>
                          {systemTrayConfig.notifications.triggers.costMilestone.enabled && (
                            <div className="ml-6 flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">$</span>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={systemTrayConfig.notifications.triggers.costMilestone.amount}
                                onChange={(e) => handleConfigUpdate({ 
                                  notifications: {
                                    ...systemTrayConfig.notifications,
                                    triggers: {
                                      ...systemTrayConfig.notifications.triggers,
                                      costMilestone: { ...systemTrayConfig.notifications.triggers.costMilestone, amount: parseInt(e.target.value) || 10 }
                                    }
                                  }
                                })}
                                className="h-8 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Notification Style</label>
                          <div className="flex gap-2">
                            <Button
                              variant={systemTrayConfig.notifications.style === 'native' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleConfigUpdate({ 
                                notifications: { ...systemTrayConfig.notifications, style: 'native' } 
                              })}
                            >
                              Native
                            </Button>
                            <Button
                              variant={systemTrayConfig.notifications.style === 'in_app' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleConfigUpdate({ 
                                notifications: { ...systemTrayConfig.notifications, style: 'in_app' } 
                              })}
                            >
                              In-App
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Play Sound</label>
                          <Button
                            variant={systemTrayConfig.notifications.sound ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleConfigUpdate({ 
                              notifications: { ...systemTrayConfig.notifications, sound: !systemTrayConfig.notifications.sound } 
                            })}
                          >
                            {systemTrayConfig.notifications.sound ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}