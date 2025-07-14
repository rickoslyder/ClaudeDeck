import { Detail, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { homedir } from "os";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface UsageEntry {
  timestamp: string;
  cache_read_input_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  cost?: number;
  model?: string;
}

export default function DailyCost() {
  const [dailyCost, setDailyCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [tokenCounts, setTokenCounts] = useState({
    input: 0,
    output: 0,
    cacheRead: 0,
  });

  useEffect(() => {
    loadTodaysCost();
  }, []);

  const loadTodaysCost = () => {
    try {
      const configPath = join(homedir(), ".config", "claude", "claude_desktop", "usage_data");
      
      if (!existsSync(configPath)) {
        showToast({
          style: Toast.Style.Failure,
          title: "Claude data not found",
          message: "Please make sure Claude Desktop is installed",
        });
        setLoading(false);
        return;
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      
      const todayFile = join(configPath, `${year}-${month}-${day}.jsonl`);
      
      if (!existsSync(todayFile)) {
        setDailyCost(0);
        setLoading(false);
        return;
      }

      const content = readFileSync(todayFile, "utf-8");
      const lines = content.trim().split("\n").filter(line => line);
      
      let totalCost = 0;
      let inputTokens = 0;
      let outputTokens = 0;
      let cacheReadTokens = 0;

      lines.forEach(line => {
        try {
          const entry: UsageEntry = JSON.parse(line);
          if (entry.cost) totalCost += entry.cost;
          if (entry.input_tokens) inputTokens += entry.input_tokens;
          if (entry.output_tokens) outputTokens += entry.output_tokens;
          if (entry.cache_read_input_tokens) cacheReadTokens += entry.cache_read_input_tokens;
        } catch (e) {
          // Skip invalid lines
        }
      });

      setDailyCost(totalCost);
      setTokenCounts({
        input: inputTokens,
        output: outputTokens,
        cacheRead: cacheReadTokens,
      });
      setLoading(false);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error loading data",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const markdown = `
# Today's Claude Usage

## Cost
**${formatCurrency(dailyCost)}**

## Token Usage
- **Input Tokens:** ${formatNumber(tokenCounts.input)}
- **Output Tokens:** ${formatNumber(tokenCounts.output)}
- **Cache Read Tokens:** ${formatNumber(tokenCounts.cacheRead)}
- **Total Tokens:** ${formatNumber(tokenCounts.input + tokenCounts.output + tokenCounts.cacheRead)}

---
*Data from ${new Date().toLocaleDateString()}*
`;

  return <Detail markdown={markdown} isLoading={loading} />;
}