import useSWR from 'swr';
import { AgentMetricsResponse } from '@/types/agent';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface UseAgentMetricsOptions {
  refreshInterval?: number;
  fallbackData?: AgentMetricsResponse;
}

/**
 * Hook for fetching agent metrics with automatic revalidation
 * Uses SWR for caching, revalidation, and optimistic updates
 */
export function useAgentMetrics(options: UseAgentMetricsOptions = {}) {
  const { refreshInterval = 5000, fallbackData } = options;

  const { data, error, isLoading, mutate } = useSWR<AgentMetricsResponse>(
    '/api/metrics',
    fetcher,
    {
      refreshInterval,
      fallbackData,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for fetching individual agent state
 */
export function useAgentState(agentId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/agents/${agentId}`,
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  );

  return {
    state: data,
    isLoading,
    isError: error,
  };
}

/**
 * Hook for subscribing to real-time agent updates via WebSocket
 * Falls back to polling if WebSocket is not available
 */
export function useRealtimeAgentUpdates(onUpdate?: (data: any) => void) {
  // TODO: Implement WebSocket connection
  // For now, returns null - can be extended with actual WS implementation
  return null;
}
