import { Container } from "@/components/layout/Container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/store"
import { Bell, FolderOpen, X, Plus } from "lucide-react"
import { useState } from "react"
import { SystemTraySettings } from "@/components/settings/SystemTraySettings"

export function Settings() {
  const settings = useSettingsStore(state => state.settings)
  const updateSettings = useSettingsStore(state => state.updateSettings)
  const saveSettings = useSettingsStore(state => state.saveSettings)
  const isSaving = useSettingsStore(state => state.isSaving)
  const [newDirectory, setNewDirectory] = useState('')

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme })
    
    // Apply theme immediately
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleCostModeChange = (costMode: 'auto' | 'calculate' | 'display') => {
    updateSettings({ costMode })
  }

  const handleSave = async () => {
    await saveSettings(settings)
  }

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your ClaudeDeck preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how ClaudeDeck looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('light')}
                  >
                    Light
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={settings.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('system')}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Calculation</CardTitle>
              <CardDescription>How costs should be calculated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cost Mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.costMode === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCostModeChange('auto')}
                  >
                    Auto
                  </Button>
                  <Button
                    variant={settings.costMode === 'calculate' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCostModeChange('calculate')}
                  >
                    Calculate
                  </Button>
                  <Button
                    variant={settings.costMode === 'display' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCostModeChange('display')}
                  >
                    Display Only
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Auto: Use provided costs when available, calculate otherwise<br/>
                  Calculate: Always calculate from token counts<br/>
                  Display Only: Only show costs from Claude data
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Tray Settings */}
          <SystemTraySettings 
            settings={settings}
            onUpdateSettings={updateSettings}
          />

          {/* Auto Refresh */}
          <Card>
            <CardHeader>
              <CardTitle>Auto Refresh</CardTitle>
              <CardDescription>Automatically update data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Auto Refresh</label>
                <Button
                  variant={settings.autoRefresh ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSettings({ autoRefresh: !settings.autoRefresh })}
                >
                  {settings.autoRefresh ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              {settings.autoRefresh && (
                <div>
                  <label className="text-sm font-medium block mb-2">Refresh Interval</label>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.refreshInterval === 60 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({ refreshInterval: 60 })}
                    >
                      1 min
                    </Button>
                    <Button
                      variant={settings.refreshInterval === 300 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({ refreshInterval: 300 })}
                    >
                      5 min
                    </Button>
                    <Button
                      variant={settings.refreshInterval === 600 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSettings({ refreshInterval: 600 })}
                    >
                      10 min
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Set cost limits to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Daily Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.notificationLimits.daily || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseFloat(e.target.value)
                    updateSettings({ 
                      notificationLimits: {
                        ...settings.notificationLimits,
                        daily: value
                      }
                    })
                  }}
                  placeholder="e.g., 10.00"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Notify when daily usage exceeds this amount
                </p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Monthly Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.notificationLimits.monthly || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseFloat(e.target.value)
                    updateSettings({ 
                      notificationLimits: {
                        ...settings.notificationLimits,
                        monthly: value
                      }
                    })
                  }}
                  placeholder="e.g., 100.00"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Notify when monthly usage exceeds this amount
                </p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Session Limit ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.notificationLimits.session || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseFloat(e.target.value)
                    updateSettings({ 
                      notificationLimits: {
                        ...settings.notificationLimits,
                        session: value
                      }
                    })
                  }}
                  placeholder="e.g., 5.00"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Notify when any session exceeds this amount
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Data Directories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Custom Data Directories
              </CardTitle>
              <CardDescription>Additional directories to scan for Claude data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {settings.customDataDirectories.map((dir, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={dir}
                      readOnly
                      className="h-10 flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newDirs = settings.customDataDirectories.filter((_, i) => i !== index)
                        updateSettings({ customDataDirectories: newDirs })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDirectory}
                    onChange={(e) => setNewDirectory(e.target.value)}
                    placeholder="/path/to/claude/data"
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDirectory.trim()) {
                        updateSettings({ 
                          customDataDirectories: [...settings.customDataDirectories, newDirectory.trim()]
                        })
                        setNewDirectory('')
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newDirectory.trim()) {
                        updateSettings({ 
                          customDataDirectories: [...settings.customDataDirectories, newDirectory.trim()]
                        })
                        setNewDirectory('')
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Default directories: ~/.config/claude and ~/.claude
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}