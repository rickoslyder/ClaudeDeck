import { Container } from "@/components/layout/Container"
import { CurrentBlockWidget } from "@/components/widgets/CurrentBlockWidget"
import { Last7DaysWidget } from "@/components/widgets/Last7DaysWidget"
import { TopModelsWidget } from "@/components/widgets/TopModelsWidget"
import { CostModeWidget } from "@/components/widgets/CostModeWidget"
import { MonthlySummaryWidget } from "@/components/widgets/MonthlySummaryWidget"
import { TotalUsageWidget } from "@/components/widgets/TotalUsageWidget"

export function Dashboard() {
  return (
    <Container>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your Claude Code usage
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CurrentBlockWidget />
          <Last7DaysWidget />
          <MonthlySummaryWidget />
          <TotalUsageWidget />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <TopModelsWidget />
          <CostModeWidget />
        </div>
      </div>
    </Container>
  )
}