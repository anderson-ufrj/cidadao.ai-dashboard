'use client';

import { useState } from 'react';
import { useAgentMetrics } from '@/hooks/useAgentMetrics';
import { AGENTS } from '@/lib/constants';
import { Card, CardHeader, MetricCard } from '@/components/ui/Card';
import { AgentCard } from '@/components/dashboard/AgentCard';
import { AgentGraph } from '@/components/dashboard/AgentGraph';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';

export function Dashboard() {
  const { metrics, isLoading, mutate } = useAgentMetrics({
    refreshInterval: 5000
  });

  const [highlightedAgent, setHighlightedAgent] = useState<string | null>(null);

  const handleAgentClick = (agentId: string) => {
    setHighlightedAgent(agentId);
  };

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <div className="text-xl text-gray-400">Loading agent metrics...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-gray-400">Failed to load metrics</div>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Title Card */}
      <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
              Orquestração de Agentes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análise de Performance & Visualização em Tempo Real
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Data Source Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                metrics.summary.dataSource === 'railway' ? 'bg-green-500' : 'bg-yellow-500'
              } animate-pulse`} />
              <span className="text-sm text-gray-400">
                {metrics.summary.dataSource === 'railway'
                  ? '🚂 Railway API'
                  : '🎭 Mock Data'}
              </span>
              {metrics.summary.backendStatus && (
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  metrics.summary.backendStatus === 'healthy'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {metrics.summary.backendStatus}
                </span>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <MetricCard
            label="Active Agents"
            value={metrics.summary.activeAgents}
            trend="up"
          />
          <MetricCard
            label="Avg Response Time"
            value={`${Math.round(metrics.summary.avgResponseTime)}ms`}
            trend="down"
          />
          <MetricCard
            label="Reflection Rate"
            value={`${Math.round(metrics.summary.reflectionRate * 100)}%`}
            trend="neutral"
          />
          <MetricCard
            label="Success Rate"
            value={`${Math.round(metrics.summary.successRate * 100)}%`}
            trend="up"
          />
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Graph */}
        <Card className="h-[500px]">
          <CardHeader
            title="Agent Orchestration Graph"
            subtitle="Real-time state visualization"
          />
          <div className="h-[400px]">
            <AgentGraph
              agentStates={metrics.agents}
              highlightedAgent={highlightedAgent}
            />
          </div>
        </Card>

        {/* Performance Chart */}
        <Card className="h-[500px]">
          <CardHeader
            title="Response Time Distribution"
            subtitle="Average latency by agent"
          />
          <div className="h-[400px]">
            <PerformanceChart data={metrics.performance} />
          </div>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <Card>
        <CardHeader
          title="Agent Status Monitor"
          subtitle={`Monitoring ${Object.keys(AGENTS).length} agents`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(AGENTS).map(([id, agent]) => (
            <AgentCard
              key={id}
              agent={agent}
              state={metrics.agents[id]}
              onClick={() => handleAgentClick(id)}
            />
          ))}
        </div>
      </Card>

      {/* Reflection Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Reflection Quality Scores"
            subtitle="Self-evaluation and improvement metrics"
          />
          <div className="space-y-3">
            {Object.entries(metrics.reflections).map(([agentId, reflection]) => (
              <div key={agentId} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: AGENTS[agentId].color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">
                      {AGENTS[agentId].name}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {(reflection.avgQuality * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${reflection.avgQuality * 100}%`,
                        backgroundColor:
                          reflection.avgQuality >= 0.8
                            ? '#22c55e'
                            : reflection.avgQuality >= 0.6
                            ? '#eab308'
                            : '#ef4444'
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {reflection.attempts} attempts
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="System Performance"
            subtitle="Key metrics and targets"
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <div className="text-sm text-gray-400">Total Requests</div>
                <div className="text-2xl font-bold text-white">
                  {metrics.summary.totalRequests}
                </div>
              </div>
              <div className="text-green-400">✓</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <div className="text-sm text-gray-400">P95 Response Time</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(metrics.summary.avgResponseTime * 1.5)}ms
                </div>
              </div>
              <div className="text-yellow-400">Target: &lt;200ms</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <div className="text-sm text-gray-400">Reflection Threshold</div>
                <div className="text-2xl font-bold text-white">0.80</div>
              </div>
              <div className="text-purple-400">Quality Baseline</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
