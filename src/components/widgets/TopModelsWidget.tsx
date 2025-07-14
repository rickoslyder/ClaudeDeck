import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useUsageDataStore } from "@/store"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatModelName } from "@/lib/data-processor"
import { formatTokenCount } from "@/lib/formatters"
import { useState } from "react"

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
]

type TimeWindow = '7d' | '30d' | 'all'

export function TopModelsWidget() {
  const dailyReport = useUsageDataStore(state => state.dailyReport)
  const isLoading = useUsageDataStore(state => state.isLoading)
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Models</CardTitle>
          <CardDescription>Usage by model</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Aggregate model usage based on selected time window
  const modelUsage = new Map<string, { tokens: number, cost: number }>()
  
  const daysToInclude = timeWindow === '7d' ? 7 : timeWindow === '30d' ? 30 : dailyReport.length
  dailyReport.slice(0, daysToInclude).forEach(day => {
    // Note: We need to enhance data processing to track model-specific usage
    // For now, we'll show all models used
    day.models.forEach(model => {
      if (!modelUsage.has(model)) {
        modelUsage.set(model, { tokens: 0, cost: 0 })
      }
      // This is a simplification - in reality we'd need per-model breakdowns
      const usage = modelUsage.get(model)!
      if (day.models.length > 0) {
        usage.tokens += day.totalTokens / day.models.length
        usage.cost += day.totalCost / day.models.length
      }
    })
  })

  const chartData = Array.from(modelUsage.entries())
    .map(([model, usage]) => ({
      name: formatModelName(model),
      value: usage.tokens,
      cost: usage.cost
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)

  const totalTokens = chartData.reduce((sum, item) => sum + item.value, 0)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Models</CardTitle>
          <CardDescription>Usage by model</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No model usage data available</p>
        </CardContent>
      </Card>
    )
  }

  const getTimeWindowLabel = () => {
    switch (timeWindow) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case 'all': return 'All time'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Models</CardTitle>
            <CardDescription>{getTimeWindowLabel()}</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant={timeWindow === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('7d')}
            >
              7D
            </Button>
            <Button
              variant={timeWindow === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('30d')}
            >
              30D
            </Button>
            <Button
              variant={timeWindow === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('all')}
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: number, name: string) => [
                  `${formatTokenCount(value)} tokens`,
                  name
                ]}
                labelStyle={{
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value: string, entry: any) => {
                  const percent = entry?.payload ? ((entry.payload.value / totalTokens) * 100).toFixed(0) : '0'
                  return `${value} (${percent}%)`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}