import { Container } from "@/components/layout/Container"
import { DataTable } from "@/components/shared/DataTable"
import { ExportButton } from "@/components/shared/ExportButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Info, Maximize2, Minimize2 } from "lucide-react"
import { useUsageDataStore, useSettingsStore } from "@/store"
import { ColumnDef } from "@tanstack/react-table"
import { BlockUsage } from "@/lib/types"
import { formatModelsDisplay } from "@/lib/data-processor"
import { formatTokenCount, formatCurrency } from "@/lib/formatters"

const columns: ColumnDef<BlockUsage>[] = [
  {
    accessorKey: "startTime",
    header: "Block Start",
    cell: ({ row }) => {
      const start = row.original.startTime
      return start.toLocaleString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span className={row.original.isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
        {row.original.isActive ? "Active" : "Completed"}
      </span>
    ),
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
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Cache creation tokens are charged at 1.25x the input rate when Claude stores content for reuse</p>
            </TooltipContent>
          </Tooltip>
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
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Cache read tokens are charged at 0.1x the input rate when Claude reuses cached content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    cell: ({ row }) => formatTokenCount(row.original.cacheReadTokens),
  },
  {
    accessorKey: "totalTokens",
    header: "Total",
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

const compactColumns: ColumnDef<BlockUsage>[] = [
  {
    accessorKey: "startTime",
    header: "Block Start",
    enableSorting: true,
    cell: ({ row }) => {
      const start = row.original.startTime
      return start.toLocaleString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span className={row.original.isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
        {row.original.isActive ? "Active" : "Completed"}
      </span>
    ),
  },
  {
    accessorKey: "totalTokens",
    header: "Total Tokens",
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

export function BlocksReport() {
  const blockReport = useUsageDataStore(state => state.blockReport)
  const isLoading = useUsageDataStore(state => state.isLoading)
  const compactMode = useSettingsStore(state => state.settings.compactMode)
  const updateSettings = useSettingsStore(state => state.updateSettings)

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">5-Hour Blocks</h2>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Container>
    )
  }

  const activeBlocks = blockReport.filter(b => b.isActive)
  const completedBlocks = blockReport.filter(b => !b.isActive && b.totalTokens > 0)
  const totalTokens = blockReport.reduce((sum, block) => sum + block.totalTokens, 0)
  const totalCost = blockReport.reduce((sum, block) => sum + block.totalCost, 0)

  return (
    <TooltipProvider>
      <Container>
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">5-Hour Blocks</h2>
            <p className="text-muted-foreground">
              Usage grouped in 5-hour time blocks
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
              data={blockReport.filter(b => b.totalTokens > 0)} 
              filename="claude-blocks-report"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Blocks</CardDescription>
              <CardTitle className="text-2xl">{activeBlocks.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Blocks</CardDescription>
              <CardTitle className="text-2xl">{completedBlocks.length}</CardTitle>
            </CardHeader>
          </Card>
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
        </div>

        {/* Active Block Highlight */}
        {activeBlocks.length > 0 && (
          <Card className="border-green-600 dark:border-green-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
                Current Active Block
              </CardTitle>
              <CardDescription>
                Started at {activeBlocks[0].startTime.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div>
                  <p className="text-sm text-muted-foreground">Input</p>
                  <p className="text-lg font-semibold">
                    {formatTokenCount(activeBlocks[0].inputTokens)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Output</p>
                  <p className="text-lg font-semibold">
                    {formatTokenCount(activeBlocks[0].outputTokens)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>Cache Create</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Cache creation tokens are charged at 1.25x the input rate when Claude stores content for reuse</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-lg font-semibold">
                    {formatTokenCount(activeBlocks[0].cacheCreationTokens)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>Cache Read</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Cache read tokens are charged at 0.1x the input rate when Claude reuses cached content</p>
                      </TooltipContent>
                    </Tooltip>
                  </p>
                  <p className="text-lg font-semibold">
                    {formatTokenCount(activeBlocks[0].cacheReadTokens)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cost</p>
                  <p className="text-lg font-semibold">{formatCurrency(activeBlocks[0].totalCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Models</p>
                  <p className="text-lg font-semibold">{formatModelsDisplay(activeBlocks[0].models) || 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Block History</CardTitle>
            <CardDescription>All 5-hour blocks with usage</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={compactMode ? compactColumns : columns} 
              data={blockReport.filter(b => b.totalTokens > 0)} 
            />
          </CardContent>
        </Card>
      </div>
    </Container>
    </TooltipProvider>
  )
}