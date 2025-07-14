import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsageDataStore } from "@/store"
import { TrendingUp } from "lucide-react"
import { formatCurrency, formatTokenCount } from "@/lib/formatters"

export function TotalUsageWidget() {
  const dailyReport = useUsageDataStore(state => state.dailyReport)
  const isLoading = useUsageDataStore(state => state.isLoading)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  // Calculate total cost and tokens from daily reports (most accurate)
  const totalCost = dailyReport.reduce((sum, day) => sum + day.totalCost, 0)
  const totalTokens = dailyReport.reduce((sum, day) => sum + day.totalTokens, 0)

  // Calculate average daily cost
  const daysWithUsage = dailyReport.filter(day => day.totalCost > 0).length
  const avgDailyCost = daysWithUsage > 0 ? totalCost / daysWithUsage : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
        <p className="text-xs text-muted-foreground">
          {totalTokens > 0 && `${formatTokenCount(totalTokens)} tokens`}
          {avgDailyCost > 0 && ` • ${formatCurrency(avgDailyCost)}/day avg`}
        </p>
      </CardContent>
    </Card>
  )
}