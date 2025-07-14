import { List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

interface UsageStats {
  currentBlock: {
    tokens: number;
    cost: number;
  };
  today: {
    tokens: number;
    cost: number;
    sessions: number;
  };
  month: {
    tokens: number;
    cost: number;
  };
}

export default function Command() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // TODO: In a real implementation, this would communicate with ClaudeDeck
        // via IPC or by reading the same data files
        const mockStats: UsageStats = {
          currentBlock: {
            tokens: 125000,
            cost: 3.75,
          },
          today: {
            tokens: 450000,
            cost: 13.50,
            sessions: 12,
          },
          month: {
            tokens: 8500000,
            cost: 255.00,
          },
        };
        
        setStats(mockStats);
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to load usage stats",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <List isLoading={isLoading}>
      <List.Section title="Current Block">
        <List.Item
          title="Tokens"
          subtitle={stats?.currentBlock.tokens.toLocaleString() || "0"}
          accessories={[{ text: `$${stats?.currentBlock.cost.toFixed(2) || "0.00"}` }]}
        />
      </List.Section>
      
      <List.Section title="Today">
        <List.Item
          title="Tokens"
          subtitle={stats?.today.tokens.toLocaleString() || "0"}
          accessories={[{ text: `$${stats?.today.cost.toFixed(2) || "0.00"}` }]}
        />
        <List.Item
          title="Sessions"
          subtitle={stats?.today.sessions.toString() || "0"}
        />
      </List.Section>
      
      <List.Section title="This Month">
        <List.Item
          title="Tokens"
          subtitle={stats?.month.tokens.toLocaleString() || "0"}
          accessories={[{ text: `$${stats?.month.cost.toFixed(2) || "0.00"}` }]}
        />
      </List.Section>
    </List>
  );
}