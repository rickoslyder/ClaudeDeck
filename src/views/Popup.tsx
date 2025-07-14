import { useEffect, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useUsageDataStore, useSettingsStore } from '@/store'
import { formatTokenCount, formatCurrency } from '@/lib/formatters'
import { formatModelsDisplay } from '@/lib/data-processor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function Popup() {
  const isLoading = useUsageDataStore(state => state.isLoading)
  const currentBlock = useUsageDataStore(state => state.currentBlock)
  const dailyReport = useUsageDataStore(state => state.dailyReport)
  const monthlyReport = useUsageDataStore(state => state.monthlyReport)
  const loadUsageData = useUsageDataStore(state => state.loadUsageData)
  
  const theme = useSettingsStore(state => state.settings.theme)
  const loadSettings = useSettingsStore(state => state.loadSettings)

  // Load data on mount
  useEffect(() => {
    loadSettings()
    loadUsageData() // Load last 90 days by default
  }, [loadSettings, loadUsageData])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (mediaQuery.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [theme])

  // Calculate today's usage
  const todayUsage = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return dailyReport.find(day => day.date === today)
  }, [dailyReport])

  // Calculate current month's usage
  const currentMonthUsage = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return monthlyReport.find(month => month.month === currentMonth)
  }, [monthlyReport])

  // Get unique active models across all reports
  const activeModels = useMemo(() => {
    const models = new Set<string>()
    
    if (currentBlock) {
      currentBlock.models.forEach(m => models.add(m))
    }
    if (todayUsage) {
      todayUsage.models.forEach(m => models.add(m))
    }
    
    return Array.from(models)
  }, [currentBlock, todayUsage])

  const handleOpenMainApp = async () => {
    try {
      // Open main window
      await invoke('show_main_window')
      // Close popup
      const window = getCurrentWindow()
      await window.close()
    } catch (error) {
      console.error('Failed to open main app:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 w-[300px] h-[400px] bg-background">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">ClaudeDeck Usage</h2>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Format time remaining for current block
  let timeRemainingStr = 'No active block'
  if (currentBlock && currentBlock.isActive) {
    const timeRemaining = currentBlock.endTime.getTime() - new Date().getTime()
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    timeRemainingStr = `${hoursRemaining}h ${minutesRemaining}m remaining`
  }

  return (
    <div className="p-4 w-[300px] h-[400px] bg-background flex flex-col">
      <div className="flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ClaudeDeck Usage</h2>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* Current Block */}
        <Card className="p-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Block</span>
              <span className="text-xs text-muted-foreground">{timeRemainingStr}</span>
            </div>
            {currentBlock && currentBlock.totalTokens > 0 ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">
                      {formatTokenCount(currentBlock.totalTokens)}
                    </span>
                    <span className="text-xs text-muted-foreground">tokens</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(currentBlock.totalCost)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No activity</p>
            )}
          </div>
        </Card>

        {/* Today's Usage */}
        <Card className="p-3">
          <div className="space-y-1">
            <span className="text-sm font-medium">Today's Total</span>
            {todayUsage && todayUsage.totalTokens > 0 ? (
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold">
                    {formatTokenCount(todayUsage.totalTokens)}
                  </span>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(todayUsage.totalCost)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No usage today</p>
            )}
          </div>
        </Card>

        {/* Monthly Usage */}
        <Card className="p-3">
          <div className="space-y-1">
            <span className="text-sm font-medium">This Month</span>
            {currentMonthUsage && currentMonthUsage.totalTokens > 0 ? (
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold">
                    {formatTokenCount(currentMonthUsage.totalTokens)}
                  </span>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(currentMonthUsage.totalCost)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No usage this month</p>
            )}
          </div>
        </Card>

        {/* Active Models */}
        {activeModels.length > 0 && (
          <Card className="p-3">
            <div className="space-y-1">
              <span className="text-sm font-medium">Active Models</span>
              <p className="text-xs text-muted-foreground">
                {formatModelsDisplay(activeModels)}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Open Main App Button */}
      <div className="pt-3 border-t">
        <Button onClick={handleOpenMainApp} className="w-full" size="sm">
          Open ClaudeDeck
        </Button>
      </div>
    </div>
  )
}