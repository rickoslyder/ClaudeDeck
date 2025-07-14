import {
  UsageData,
  DailyUsage,
  MonthlyUsage,
  SessionUsage,
  BlockUsage,
  TokenCounts,
  AggregatedTokenCounts,
  CostMode,
  ModelPricing,
  DailyDate,
  MonthlyDate,
  ModelName,
  SessionId,
  ActivityDate,
} from './types';

// Hard-coded pricing for known Claude models (fallback when API is unavailable)
const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-20250514': {
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    cache_creation_input_token_cost: 0.00000375,
    cache_read_input_token_cost: 0.0000003,
  },
  'claude-opus-4-20250514': {
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    cache_creation_input_token_cost: 0.00001875,
    cache_read_input_token_cost: 0.0000015,
  },
  'claude-3.5-sonnet-20241022': {
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    cache_creation_input_token_cost: 0.00000375,
    cache_read_input_token_cost: 0.0000003,
  },
  'claude-3-opus-20240229': {
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    cache_creation_input_token_cost: 0.00001875,
    cache_read_input_token_cost: 0.0000015,
  },
};

// Parse JSONL content into UsageData array
export function parseJSONLContent(content: string): UsageData[] {
  const lines = content.trim().split('\n');
  const results: UsageData[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    try {
      const data = JSON.parse(line) as UsageData;
      results.push(data);
    } catch (error) {
      console.warn('Failed to parse JSONL line:', error);
      // Skip malformed lines
    }
  }
  
  return results;
}

// Calculate cost for a single usage entry
export function calculateCost(
  usage: UsageData,
  mode: CostMode = 'auto'
): number {
  // Display mode: only use pre-calculated costUSD
  if (mode === 'display') {
    return usage.costUSD ?? 0;
  }
  
  // Auto mode: use costUSD if available
  if (mode === 'auto' && usage.costUSD !== undefined) {
    return usage.costUSD;
  }
  
  // Calculate mode or fallback: calculate from tokens
  const model = usage.message?.model;
  if (!model || !usage.message?.usage) {
    return 0;
  }
  
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    return 0;
  }
  
  const u = usage.message.usage;
  const inputCost = (u.input_tokens ?? 0) * (pricing.input_cost_per_token ?? 0);
  const outputCost = (u.output_tokens ?? 0) * (pricing.output_cost_per_token ?? 0);
  const cacheCreateCost = (u.cache_creation_input_tokens ?? 0) * (pricing.cache_creation_input_token_cost ?? 0);
  const cacheReadCost = (u.cache_read_input_tokens ?? 0) * (pricing.cache_read_input_token_cost ?? 0);
  
  return inputCost + outputCost + cacheCreateCost + cacheReadCost;
}

// Get total tokens from any token count structure
export function getTotalTokens(tokenCounts: TokenCounts | AggregatedTokenCounts): number {
  const cacheCreation = 'cacheCreationInputTokens' in tokenCounts
    ? tokenCounts.cacheCreationInputTokens
    : (tokenCounts as AggregatedTokenCounts).cacheCreationTokens;
    
  const cacheRead = 'cacheReadInputTokens' in tokenCounts
    ? tokenCounts.cacheReadInputTokens
    : (tokenCounts as AggregatedTokenCounts).cacheReadTokens;
    
  return (
    tokenCounts.inputTokens +
    tokenCounts.outputTokens +
    cacheCreation +
    cacheRead
  );
}

// Process daily usage data
export function processDailyUsage(
  usageData: UsageData[],
  mode: CostMode = 'auto'
): DailyUsage[] {
  const dailyMap = new Map<string, DailyUsage>();
  
  for (const entry of usageData) {
    if (!entry.timestamp) continue;
    const date = entry.timestamp.split('T')[0] as DailyDate;
    
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        models: [],
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 0,
        totalCost: 0,
      });
    }
    
    const daily = dailyMap.get(date)!;
    
    // Add model if present
    if (entry.message?.model) {
      if (!daily.models.includes(entry.message.model as ModelName)) {
        daily.models.push(entry.message.model as ModelName);
      }
    }
    
    // Aggregate tokens
    if (entry.message?.usage) {
      const u = entry.message.usage;
      daily.inputTokens += u.input_tokens ?? 0;
      daily.outputTokens += u.output_tokens ?? 0;
      daily.cacheCreationTokens += u.cache_creation_input_tokens ?? 0;
      daily.cacheReadTokens += u.cache_read_input_tokens ?? 0;
    }
    
    // Add cost
    daily.totalCost += calculateCost(entry, mode);
  }
  
  // Calculate total tokens for each day
  for (const daily of dailyMap.values()) {
    daily.totalTokens = getTotalTokens(daily);
  }
  
  // Return sorted by date descending
  return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// Process monthly usage data
export function processMonthlyUsage(
  usageData: UsageData[],
  mode: CostMode = 'auto'
): MonthlyUsage[] {
  const monthlyMap = new Map<string, MonthlyUsage>();
  
  for (const entry of usageData) {
    if (!entry.timestamp) continue;
    const month = entry.timestamp.substring(0, 7) as MonthlyDate;
    
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        month,
        models: [],
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 0,
        totalCost: 0,
      });
    }
    
    const monthly = monthlyMap.get(month)!;
    
    // Add model if present
    if (entry.message?.model) {
      if (!monthly.models.includes(entry.message.model as ModelName)) {
        monthly.models.push(entry.message.model as ModelName);
      }
    }
    
    // Aggregate tokens
    if (entry.message?.usage) {
      const u = entry.message.usage;
      monthly.inputTokens += u.input_tokens ?? 0;
      monthly.outputTokens += u.output_tokens ?? 0;
      monthly.cacheCreationTokens += u.cache_creation_input_tokens ?? 0;
      monthly.cacheReadTokens += u.cache_read_input_tokens ?? 0;
    }
    
    // Add cost
    monthly.totalCost += calculateCost(entry, mode);
  }
  
  // Calculate total tokens for each month
  for (const monthly of monthlyMap.values()) {
    monthly.totalTokens = getTotalTokens(monthly);
  }
  
  // Return sorted by month descending
  return Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month));
}

// Process 5-hour block usage data
export function processBlockUsage(
  usageData: UsageData[],
  mode: CostMode = 'auto'
): BlockUsage[] {
  const blocks: BlockUsage[] = [];
  const blockSize = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
  
  // Group by 5-hour blocks
  const blockMap = new Map<string, BlockUsage>();
  
  for (const entry of usageData) {
    if (!entry.timestamp) continue;
    const timestamp = new Date(entry.timestamp);
    const blockStart = new Date(Math.floor(timestamp.getTime() / blockSize) * blockSize);
    const blockEnd = new Date(blockStart.getTime() + blockSize);
    const blockId = blockStart.toISOString();
    
    if (!blockMap.has(blockId)) {
      blockMap.set(blockId, {
        blockId,
        startTime: blockStart,
        endTime: blockEnd,
        models: [],
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        isActive: false,
      });
    }
    
    const block = blockMap.get(blockId)!;
    
    // Add model if present
    if (entry.message?.model) {
      if (!block.models.includes(entry.message.model as ModelName)) {
        block.models.push(entry.message.model as ModelName);
      }
    }
    
    // Aggregate tokens
    if (entry.message?.usage) {
      const u = entry.message.usage;
      block.inputTokens += u.input_tokens ?? 0;
      block.outputTokens += u.output_tokens ?? 0;
      block.cacheCreationTokens += u.cache_creation_input_tokens ?? 0;
      block.cacheReadTokens += u.cache_read_input_tokens ?? 0;
    }
    
    // Add cost
    block.totalCost += calculateCost(entry, mode);
  }
  
  // Calculate total tokens and check if active
  const now = new Date();
  for (const block of blockMap.values()) {
    block.totalTokens = getTotalTokens(block);
    block.isActive = now >= block.startTime && now < block.endTime;
    blocks.push(block);
  }
  
  // Return sorted by start time descending
  return blocks.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

// Format model name for display
export function formatModelName(modelName: string): string {
  // Extract model type from full model name
  // e.g., "claude-sonnet-4-20250514" -> "sonnet-4"
  const match = modelName.match(/claude-(\w+)-(\d+)-\d+/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return modelName;
}

// Format multiple models for display
export function formatModelsDisplay(models: string[]): string {
  const uniqueModels = Array.from(new Set(models.map(formatModelName)));
  return uniqueModels.sort().join(', ');
}

// Process session usage data
export function processSessionUsage(
  usageData: UsageData[],
  mode: CostMode = 'auto'
): SessionUsage[] {
  // Since we don't have file paths in the frontend, we'll simulate sessions
  // by grouping data into time-based sessions (gap of more than 30 minutes starts a new session)
  const sessions: SessionUsage[] = [];
  const sessionGap = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  if (usageData.length === 0) return sessions;
  
  // Sort by timestamp (filtering out entries without timestamps)
  const sortedData = [...usageData]
    .filter(entry => entry.timestamp)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  
  let currentSession: SessionUsage | null = null;
  let sessionCounter = 1;
  
  for (const entry of sortedData) {
    if (!entry.timestamp) continue;
    const entryTime = new Date(entry.timestamp).getTime();
    
    // Check if we need to start a new session
    if (!currentSession || 
        (currentSession.lastActivity && 
         entryTime - new Date(currentSession.lastActivity).getTime() > sessionGap)) {
      
      // Save previous session if it exists
      if (currentSession) {
        sessions.push(currentSession);
      }
      
      // Start new session
      const sessionId = `session-${sessionCounter++}` as SessionId;
      currentSession = {
        sessionId,
        projectPath: 'Claude Code Sessions', // Default project path
        models: [],
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        lastActivity: entry.timestamp as unknown as ActivityDate,
        versions: [],
      };
    }
    
    // Update session activity time
    currentSession.lastActivity = entry.timestamp as unknown as ActivityDate;
    
    // Add model if present
    if (entry.message?.model) {
      if (!currentSession.models.includes(entry.message.model as ModelName)) {
        currentSession.models.push(entry.message.model as ModelName);
      }
    }
    
    // Add version if present
    if (entry.version && !currentSession.versions.includes(entry.version)) {
      currentSession.versions.push(entry.version);
    }
    
    // Aggregate tokens
    if (entry.message?.usage) {
      const u = entry.message.usage;
      currentSession.inputTokens += u.input_tokens ?? 0;
      currentSession.outputTokens += u.output_tokens ?? 0;
      currentSession.cacheCreationTokens += u.cache_creation_input_tokens ?? 0;
      currentSession.cacheReadTokens += u.cache_read_input_tokens ?? 0;
    }
    
    // Add cost
    currentSession.totalCost += calculateCost(entry, mode);
  }
  
  // Don't forget the last session
  if (currentSession) {
    sessions.push(currentSession);
  }
  
  // Calculate total tokens for each session
  for (const session of sessions) {
    session.totalTokens = getTotalTokens(session);
  }
  
  // Return sorted by last activity descending
  return sessions.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
}