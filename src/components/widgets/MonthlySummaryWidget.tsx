import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsageDataStore } from "@/store"
import { Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"

export function MonthlySummaryWidget() {
  const monthlyReport = useUsageDataStore(state => state.monthlyReport)
  const isLoading = useUsageDataStore(state => state.isLoading)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  // Get current month data
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const currentMonthData = monthlyReport.find(report => report.month === currentMonth)

  const monthCost = currentMonthData?.totalCost || 0
  const monthTokens = currentMonthData?.totalTokens || 0

  // Calculate percentage change from last month
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`
  const lastMonthData = monthlyReport.find(report => report.month === lastMonthKey)
  const lastMonthCost = lastMonthData?.totalCost || 0
  
  let percentageChange = 0
  if (lastMonthCost > 0) {
    percentageChange = ((monthCost - lastMonthCost) / lastMonthCost) * 100
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">This Month</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(monthCost)}</div>
        <p className="text-xs text-muted-foreground">
          {percentageChange !== 0 && (
            <span className={percentageChange > 0 ? "text-red-600" : "text-green-600"}>
              {percentageChange > 0 ? "+" : ""}{percentageChange.toFixed(1)}%
            </span>
          )}
          {percentageChange !== 0 && " from last month"}
          {percentageChange === 0 && monthTokens > 0 && `${monthTokens.toLocaleString()} tokens`}
        </p>
      </CardContent>
    </Card>
  )
}