// Core types adapted from ccusage

export type ModelName = string & { readonly brand: unique symbol };
export type SessionId = string & { readonly brand: unique symbol };
export type DailyDate = string & { readonly brand: unique symbol };
export type MonthlyDate = string & { readonly brand: unique symbol };
export type ActivityDate = string & { readonly brand: unique symbol };
export type ISOTimestamp = string & { readonly brand: unique symbol };

export const CostModes = ['auto', 'calculate', 'display'] as const;
export type CostMode = typeof CostModes[number];

export const SortOrders = ['desc', 'asc'] as const;
export type SortOrder = typeof SortOrders[number];

// Token count structures
export interface TokenCounts {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
}

export interface AggregatedTokenCounts {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
}

export type AnyTokenCounts = TokenCounts | AggregatedTokenCounts;

// Usage data structure from JSONL files
export interface UsageData {
  timestamp: ISOTimestamp;
  message?: {
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
    model?: string;
  };
  costUSD?: number;
  version?: string;
}

// Aggregated data structures
export interface DailyUsage {
  date: DailyDate;
  models: ModelName[];
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
}

export interface MonthlyUsage {
  month: MonthlyDate;
  models: ModelName[];
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
}

export interface SessionUsage {
  sessionId: SessionId;
  projectPath: string;
  models: ModelName[];
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  lastActivity: ActivityDate;
  versions: string[];
}

export interface BlockUsage {
  blockId: string;
  startTime: Date;
  endTime: Date;
  models: ModelName[];
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  isActive: boolean;
}

export interface ModelBreakdown {
  modelName: ModelName;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  cost: number;
}

// Model pricing structure
export interface ModelPricing {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  cache_creation_input_token_cost?: number;
  cache_read_input_token_cost?: number;
}