import { Container } from "@/components/layout/Container"
import { DataTable } from "@/components/shared/DataTable"
import { ExportButton } from "@/components/shared/ExportButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUsageDataStore } from "@/store"
import { ColumnDef } from "@tanstack/react-table"
import { MonthlyUsage } from "@/lib/types"
import { formatModelsDisplay } from "@/lib/data-processor"
import { formatTokenCount, formatCurrency } from "@/lib/formatters"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const columns: ColumnDef<MonthlyUsage>[] = [
  {
    accessorKey: "month",
    header: "Month",
    enableSorting: true,
    cell: ({ row }) => {
      const [year, month] = row.original.month.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    },
  },
  {
    accessorKey: "totalTokens",
    header: "Tokens",
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
    header: "Models Used",
    cell: ({ row }) => formatModelsDisplay(row.original.models),
  },
]

export function MonthlyReport() {
  const monthlyReport = useUsageDataStore(state => state.monthlyReport)
  const isLoading = useUsageDataStore(state => state.isLoading)

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Monthly Report</h2>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Container>
    )
  }

  // Prepare chart data (last 12 months)
  const chartData = monthlyReport.slice(0, 12).reverse().map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('en-US', { year: '2-digit', month: 'short' }),
    tokens: month.totalTokens,
    cost: month.totalCost
  }))

  const totalTokens = monthlyReport.reduce((sum, month) => sum + month.totalTokens, 0)
  const totalCost = monthlyReport.reduce((sum, month) => sum + month.totalCost, 0)
  const avgTokensPerMonth = monthlyReport.length > 0 ? totalTokens / monthlyReport.length : 0

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Monthly Report</h2>
            <p className="text-muted-foreground">
              Token usage and costs by month
            </p>
          </div>
          <ExportButton 
            data={monthlyReport} 
            filename="claude-monthly-report"
          />
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
              <CardDescription>Avg per Month</CardDescription>
              <CardTitle className="text-2xl">
                {formatTokenCount(Math.round(avgTokensPerMonth))}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Token usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
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
                  <Area 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorTokens)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage Details</CardTitle>
            <CardDescription>Detailed breakdown by month</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={monthlyReport} />
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}