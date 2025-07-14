import { Container } from "@/components/layout/Container"
import { DataTable } from "@/components/shared/DataTable"
import { ExportButton } from "@/components/shared/ExportButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Info, Maximize2, Minimize2 } from "lucide-react"
import { useUsageDataStore, useSettingsStore } from "@/store"
import { ColumnDef } from "@tanstack/react-table"
import { DailyUsage } from "@/lib/types"
import { formatModelsDisplay } from "@/lib/data-processor"
import { formatTokenCount, formatCurrency } from "@/lib/formatters"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const columns: ColumnDef<DailyUsage>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.date)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    },
  },
  {
    accessorKey: "inputTokens",
    header: "Input",
    cell: ({ row }) => formatTokenCount(row.original.inputTokens),
  },
  {
    accessorKey: "outputTokens",
    header: "Output",
    cell: ({ row }) => formatTokenCount(row.original.outputTokens),
  },
  {
    accessorKey: "cacheCreationTokens",
    header: () => (
      <div className="flex items-center gap-1">
        <span>Cache Create</span>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Cache creation tokens are charged at 1.25x the input rate when Claude stores content for reuse</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
    ),
    cell: ({ row }) => formatTokenCount(row.original.cacheCreationTokens),
  },
  {
    accessorKey: "cacheReadTokens",
    header: () => (
      <div className="flex items-center gap-1">
        <span>Cache Read</span>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Cache read tokens are charged at 0.1x the input rate when Claude reuses cached content</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
    ),
    cell: ({ row }) => formatTokenCount(row.original.cacheReadTokens),
  },
  {
    accessorKey: "totalTokens",
    header: "Total",
    enableSorting: true,
    cell: ({ row }) => formatTokenCount(row.original.totalTokens),
  },
  {
    accessorKey: "totalCost",
    header: "Cost",
    enableSorting: true,
    cell: ({ row }) => formatCurrency(row.original.totalCost),
  },
  {
    accessorKey: "models",
    header: "Models",
    cell: ({ row }) => formatModelsDisplay(row.original.models),
  },
]

const compactColumns: ColumnDef<DailyUsage>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.date)
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    },
  },
  {
    accessorKey: "totalTokens",
    header: "Total Tokens",
    cell: ({ row }) => formatTokenCount(row.original.totalTokens),
  },
  {
    accessorKey: "totalCost",
    header: "Cost",
    cell: ({ row }) => formatCurrency(row.original.totalCost),
  },
  {
    accessorKey: "models",
    header: "Models",
    cell: ({ row }) => formatModelsDisplay(row.original.models),
  },
]

export function DailyReport() {
  const dailyReport = useUsageDataStore(state => state.dailyReport)
  const isLoading = useUsageDataStore(state => state.isLoading)
  const compactMode = useSettingsStore(state => state.settings.compactMode)
  const updateSettings = useSettingsStore(state => state.updateSettings)

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Daily Report</h2>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Container>
    )
  }

  // Prepare chart data (last 30 days)
  const chartData = dailyReport.slice(0, 30).reverse().map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tokens: day.totalTokens,
    cost: day.totalCost
  }))

  const totalTokens = dailyReport.reduce((sum, day) => sum + day.totalTokens, 0)
  const totalCost = dailyReport.reduce((sum, day) => sum + day.totalCost, 0)
  const avgTokensPerDay = dailyReport.length > 0 ? totalTokens / dailyReport.length : 0

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Daily Report</h2>
            <p className="text-muted-foreground">
              Token usage and costs by day
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSettings({ compactMode: !compactMode })}
              title={compactMode ? "Show detailed view" : "Show compact view"}
            >
              {compactMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              <span className="ml-2">{compactMode ? "Detailed" : "Compact"}</span>
            </Button>
            <ExportButton 
              data={dailyReport} 
              filename="claude-daily-report"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Tokens</CardDescription>
              <CardTitle className="text-2xl">
                {formatTokenCount(totalTokens)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Cost</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalCost)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg per Day</CardDescription>
              <CardTitle className="text-2xl">
                {formatTokenCount(Math.round(avgTokensPerDay))}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Last 30 Days</CardTitle>
            <CardDescription>Daily token usage trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    fontSize={12}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => formatTokenCount(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'tokens') {
                        return [formatTokenCount(value), 'Tokens']
                      }
                      return [formatCurrency(value), 'Cost']
                    }}
                  />
                  <Bar dataKey="tokens" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Details</CardTitle>
            <CardDescription>Detailed breakdown by day</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={compactMode ? compactColumns : columns} data={dailyReport} />
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}