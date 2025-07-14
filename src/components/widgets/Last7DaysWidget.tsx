import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsageDataStore } from "@/store"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatTokenCount, formatCurrency } from "@/lib/formatters"

export function Last7DaysWidget() {
  const dailyReport = useUsageDataStore(state => state.dailyReport)
  const isLoading = useUsageDataStore(state => state.isLoading)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days</CardTitle>
          <CardDescription>Daily usage trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get last 7 days of data
  const last7Days = dailyReport.slice(0, 7).reverse()
  
  // Calculate totals
  const totalTokens = last7Days.reduce((sum, day) => sum + day.totalTokens, 0)
  const totalCost = last7Days.reduce((sum, day) => sum + day.totalCost, 0)
  const avgTokensPerDay = totalTokens / 7

  const tokensStr = formatTokenCount(totalTokens)
  const costStr = formatCurrency(totalCost)
  const avgStr = formatTokenCount(Math.round(avgTokensPerDay))

  // Prepare chart data
  const chartData = last7Days.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    tokens: day.totalTokens,
    cost: day.totalCost
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 7 Days</CardTitle>
        <CardDescription>Daily usage trend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-center">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-sm font-semibold">{tokensStr}</p>
              <p className="text-xs text-muted-foreground">tokens</p>
            </div>
            <div className="flex-1 border-l border-r px-2">
              <p className="text-xs text-muted-foreground mb-1">Cost</p>
              <p className="text-sm font-semibold">{costStr}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1 whitespace-nowrap">Daily Avg</p>
              <p className="text-sm font-semibold">{avgStr}</p>
              <p className="text-xs text-muted-foreground">tokens</p>
            </div>
          </div>
          
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  formatter={(value: number) => [
                    formatTokenCount(value),
                    'Tokens'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}