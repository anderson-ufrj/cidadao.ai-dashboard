import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AgentState, AgentRuntimeState, PerformanceDataPoint, StateTransitionMatrix } from '@/types/agent';

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `há ${seconds}s`;
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  return `há ${days}d`;
}

/**
 * Calculate percentile from array
 */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate moving average
 */
export function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

/**
 * Generate synthetic agent state data for demo/testing
 */
export function generateSyntheticAgentState(): AgentRuntimeState {
  const states: AgentState[] = ['IDLE', 'THINKING', 'ACTING', 'COMPLETED'];
  return {
    state: states[Math.floor(Math.random() * states.length)],
    lastActive: Date.now() - Math.random() * 60000,
    requestCount: Math.floor(Math.random() * 100),
    avgResponseTime: 50 + Math.random() * 150,
    successRate: 0.85 + Math.random() * 0.14,
    reflectionCount: Math.floor(Math.random() * 20),
    errorCount: Math.floor(Math.random() * 5)
  };
}

/**
 * Generate synthetic performance data
 */
export function generateSyntheticPerformanceData(
  agentIds: string[],
  count: number
): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      timestamp: Date.now() - (count - i) * 10000,
      agent: agentIds[Math.floor(Math.random() * agentIds.length)],
      responseTime: 50 + Math.random() * 150,
      success: Math.random() > 0.1,
      reflectionTriggered: Math.random() > 0.8
    });
  }
  return data;
}

/**
 * Generate state transition matrix
 */
export function generateStateTransitionMatrix(): StateTransitionMatrix {
  const states: AgentState[] = ['IDLE', 'THINKING', 'ACTING', 'COMPLETED', 'ERROR'];
  const matrix: StateTransitionMatrix = {} as StateTransitionMatrix;
  
  states.forEach(from => {
    matrix[from] = {} as Record<AgentState, number>;
    states.forEach(to => {
      if (from !== to) {
        matrix[from][to] = Math.floor(Math.random() * 50);
      } else {
        matrix[from][to] = 0;
      }
    });
  });
  
  return matrix;
}

/**
 * Validate API response structure
 */
export function isValidAgentMetricsResponse(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    'agents' in data &&
    'performance' in data &&
    'summary' in data
  );
}

/**
 * Calculate aggregate metrics from performance data
 */
export function calculateAggregateMetrics(data: PerformanceDataPoint[]) {
  if (data.length === 0) {
    return {
      avgResponseTime: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      successRate: 0,
      totalRequests: 0
    };
  }

  const responseTimes = data.map(d => d.responseTime);
  const successCount = data.filter(d => d.success).length;

  return {
    avgResponseTime: responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length,
    p50: percentile(responseTimes, 50),
    p95: percentile(responseTimes, 95),
    p99: percentile(responseTimes, 99),
    successRate: successCount / data.length,
    totalRequests: data.length
  };
}
