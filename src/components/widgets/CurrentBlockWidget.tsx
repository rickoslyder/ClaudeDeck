import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsageDataStore } from "@/store"
import { formatModelsDisplay } from "@/lib/data-processor"
import { formatTokenCount, formatCurrency } from "@/lib/formatters"

export function CurrentBlockWidget() {
  const currentBlock = useUsageDataStore(state => state.currentBlock)
  const isLoading = useUsageDataStore(state => state.isLoading)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Block</CardTitle>
          <CardDescription>Active 5-hour usage block</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentBlock || currentBlock.totalTokens === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Block</CardTitle>
          <CardDescription>Active 5-hour usage block</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activity in current block</p>
        </CardContent>
      </Card>
    )
  }

  const costStr = formatCurrency(currentBlock.totalCost)
  const tokensStr = formatTokenCount(currentBlock.totalTokens)
  const modelsStr = formatModelsDisplay(currentBlock.models)

  const timeRemaining = currentBlock.endTime.getTime() - new Date().getTime()
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Block</CardTitle>
        <CardDescription>
          {hoursRemaining}h {minutesRemaining}m remaining
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{tokensStr}</span>
            <span className="text-sm text-muted-foreground">tokens</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold">{costStr}</span>
            <span className="text-sm text-muted-foreground">cost</span>
          </div>
          {modelsStr && (
            <div className="text-sm text-muted-foreground">
              Models: {modelsStr}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}