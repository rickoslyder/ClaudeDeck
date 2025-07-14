import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { useSettingsStore } from "@/store"

export function CostModeWidget() {
  const costMode = useSettingsStore(state => state.settings.costMode)
  
  const modeDescriptions = {
    auto: "Uses pre-calculated costs when available, otherwise calculates from tokens",
    calculate: "Always calculates costs from token counts using model pricing",
    display: "Only shows pre-calculated costs, displays $0.00 if not available"
  }
  
  const modeColors = {
    auto: "text-blue-600 dark:text-blue-400",
    calculate: "text-green-600 dark:text-green-400",
    display: "text-orange-600 dark:text-orange-400"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <span>Cost Mode</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{modeDescriptions[costMode]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold capitalize ${modeColors[costMode]}`}>
          {costMode}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {costMode === 'auto' && 'Smart calculation'}
          {costMode === 'calculate' && 'Token-based'}
          {costMode === 'display' && 'Pre-calculated only'}
        </p>
      </CardContent>
    </Card>
  )
}