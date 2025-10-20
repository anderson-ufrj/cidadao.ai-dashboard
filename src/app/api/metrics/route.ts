import { NextResponse } from 'next/server';
import { AgentMetricsResponse, ReflectionMetrics, AgentState } from '@/types/agent';
import { AGENTS } from '@/lib/constants';
import { apiClient } from '@/lib/api-client';
import {
  generateSyntheticAgentState,
  generateSyntheticPerformanceData,
  generateStateTransitionMatrix,
  calculateAggregateMetrics
} from '@/lib/utils';

// In-memory cache for demo - replace with Redis in production
let cachedMetrics: AgentMetricsResponse | null = null;
let lastUpdate = 0;
const CACHE_TTL = 5000; // 5s cache

/**
 * GET /api/metrics
 * Returns current agent metrics, performance data, and aggregated statistics
 * 
 * In production, this would:
 * 1. Query Prometheus for real metrics
 * 2. Hit Cidadão.AI backend /api/agents/status
 * 3. Fetch from Redis cache layer
 * 4. Stream real-time data via WebSocket
 */
export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedMetrics && (now - lastUpdate) < CACHE_TTL) {
      return NextResponse.json(cachedMetrics);
    }

    // Try to fetch real data from Railway backend
    let realAgentData = null;
    let healthStatus = null;

    try {
      // Fetch real agent data
      const [agents, health] = await Promise.all([
        apiClient.getAgents().catch(() => null),
        apiClient.getHealthStatus().catch(() => null)
      ]);

      realAgentData = agents;
      healthStatus = health;
    } catch (error) {
      console.log('Using synthetic data - Railway API unavailable');
    }

    // Generate agent states (use real data if available)
    const agentIds = Object.keys(AGENTS);
    const agentStates = Object.fromEntries(
      agentIds.map(id => {
        // Check if we have real data for this agent
        const realAgent = realAgentData?.find(a => a.id === id);
        const healthAgent = healthStatus?.agents?.[id];

        if (realAgent || healthAgent) {
          // Map real agent status to our state model
          const state: AgentState = realAgent?.status === 'active' ? 'IDLE' :
                       realAgent?.status === 'busy' ? 'ACTING' :
                       healthAgent?.status === 'available' ? 'IDLE' : 'ERROR';

          return [id, {
            state,
            lastActive: now - Math.random() * 60000,
            requestCount: Math.floor(Math.random() * 100),
            avgResponseTime: Math.random() * 200,
            successRate: 0.85 + Math.random() * 0.15,
            reflectionCount: Math.floor(Math.random() * 10)
          }];
        }

        // Fallback to synthetic data
        return [id, generateSyntheticAgentState()];
      })
    );

    const performanceData = generateSyntheticPerformanceData(agentIds, 50);
    const transitions = generateStateTransitionMatrix();

    // Generate reflection metrics
    const reflectionMetrics: Record<string, ReflectionMetrics> = {};
    agentIds.forEach(id => {
      reflectionMetrics[id] = {
        attempts: Math.floor(Math.random() * 10),
        avgQuality: 0.75 + Math.random() * 0.24,
        improvementRate: Math.random() * 0.3,
        belowThresholdCount: Math.floor(Math.random() * 3)
      };
    });

    // Calculate summary metrics
    const activeAgents = Object.values(agentStates).filter(
      s => s.state !== 'IDLE'
    ).length;

    const recentPerformance = performanceData.slice(-20);
    const aggregates = calculateAggregateMetrics(recentPerformance);

    const totalReflections = Object.values(reflectionMetrics).reduce(
      (sum, r) => sum + r.attempts,
      0
    );

    const response: AgentMetricsResponse = {
      agents: agentStates,
      performance: performanceData,
      reflections: reflectionMetrics,
      transitions,
      summary: {
        activeAgents,
        avgResponseTime: aggregates.avgResponseTime,
        reflectionRate: totalReflections / performanceData.length,
        successRate: aggregates.successRate,
        totalRequests: performanceData.length,
        timestamp: now,
        // Add metadata about data source
        dataSource: realAgentData ? 'railway' : 'mock',
        backendStatus: healthStatus?.overall_status || 'unknown',
        apiVersion: healthStatus?.api?.version || '1.0.0'
      }
    };

    // Update cache
    cachedMetrics = response;
    lastUpdate = now;

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent metrics' },
      { status: 500 }
    );
  }
}

/**
 * TODO: Implement real data fetching
 * 
 * async function fetchRealMetrics(): Promise<AgentMetricsResponse> {
 *   // Option 1: Query Cidadão.AI backend directly
 *   const response = await fetch(`${CIDADAO_API_BASE}/api/agents/metrics`);
 *   
 *   // Option 2: Query Prometheus
 *   const promResponse = await fetch('http://prometheus:9090/api/v1/query', {
 *     method: 'POST',
 *     body: JSON.stringify({
 *       query: 'rate(agent_requests_total[5m])'
 *     })
 *   });
 *   
 *   // Option 3: Query PostgreSQL directly
 *   const dbMetrics = await db.query(`
 *     SELECT agent_id, state, avg(response_time_ms) as avg_time
 *     FROM agent_metrics
 *     WHERE timestamp > NOW() - INTERVAL '5 minutes'
 *     GROUP BY agent_id, state
 *   `);
 *   
 *   return transformToMetricsResponse(dbMetrics);
 * }
 */
