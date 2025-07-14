import { Container } from "@/components/layout/Container"
import { DataTable } from "@/components/shared/DataTable"
import { ExportButton } from "@/components/shared/ExportButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUsageDataStore } from "@/store"
import { ColumnDef } from "@tanstack/react-table"
import { SessionUsage } from "@/lib/types"
import { formatModelsDisplay } from "@/lib/data-processor"
import { formatTokenCount, formatCurrency } from "@/lib/formatters"

const columns: ColumnDef<SessionUsage>[] = [
  {
    accessorKey: "sessionId",
    header: "Session",
    cell: ({ row }) => {
      // Display shortened session ID
      const sessionId = row.original.sessionId;
      return sessionId.split('-').slice(-1)[0];
    },
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.original.lastActivity);
      return date.toLocaleString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
    header: "Models",
    cell: ({ row }) => formatModelsDisplay(row.original.models),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      // Calculate approximate duration based on first and last activity
      // Since we're using time-based sessions, this is an approximation
      const tokens = row.original.totalTokens;
      const avgTokensPerMinute = 500; // Rough estimate
      const estimatedMinutes = tokens / avgTokensPerMinute;
      
      if (estimatedMinutes < 60) {
        return `~${Math.round(estimatedMinutes)}m`;
      } else {
        const hours = Math.floor(estimatedMinutes / 60);
        const minutes = Math.round(estimatedMinutes % 60);
        return `~${hours}h ${minutes}m`;
      }
    },
  },
]

export function SessionReport() {
  const sessionReport = useUsageDataStore(state => state.sessionReport)
  const isLoading = useUsageDataStore(state => state.isLoading)

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Session Report</h2>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Container>
    )
  }

  const totalSessions = sessionReport.length
  const totalTokens = sessionReport.reduce((sum, session) => sum + session.totalTokens, 0)
  const avgTokensPerSession = totalSessions > 0 ? totalTokens / totalSessions : 0

  // Get recent sessions (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentSessions = sessionReport.filter(
    session => new Date(session.lastActivity) >= sevenDaysAgo
  )

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Session Report</h2>
            <p className="text-muted-foreground">
              Usage grouped by work sessions
            </p>
          </div>
          <ExportButton 
            data={sessionReport} 
            filename="claude-session-report"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Sessions</CardDescription>
              <CardTitle className="text-2xl">{totalSessions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recent (7 days)</CardDescription>
              <CardTitle className="text-2xl">{recentSessions.length}</CardTitle>
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
              <CardDescription>Avg per Session</CardDescription>
              <CardTitle className="text-2xl">
                {formatTokenCount(Math.round(avgTokensPerSession))}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Sessions Highlight */}
        {recentSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Last 7 days of activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.slice(0, 5).map((session) => (
                  <div key={session.sessionId} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">Session {session.sessionId.split('-').slice(-1)[0]}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.lastActivity).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatTokenCount(session.totalTokens)} tokens
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(session.totalCost)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>Complete session history</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={sessionReport} 
              searchPlaceholder="Search sessions..." 
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  )
}