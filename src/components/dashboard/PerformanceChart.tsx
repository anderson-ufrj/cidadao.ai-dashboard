'use client';

import { PerformanceDataPoint } from '@/types/agent';
import { AGENTS } from '@/lib/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  // Aggregate by agent
  const agentStats = Object.keys(AGENTS).map(agentId => {
    const agentData = data.filter(d => d.agent === agentId);
    if (agentData.length === 0) {
      return {
        agent: AGENTS[agentId].name,
        avgTime: 0,
        color: AGENTS[agentId].color,
        count: 0
      };
    }

    const avgTime =
      agentData.reduce((sum, d) => sum + d.responseTime, 0) / agentData.length;

    return {
      agent: AGENTS[agentId].name.split(' ')[0], // Shorten for display
      avgTime: Math.round(avgTime),
      color: AGENTS[agentId].color,
      count: agentData.length
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={agentStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="agent"
          stroke="#94a3b8"
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis
          stroke="#94a3b8"
          label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff'
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value}ms (${props.payload.count} requests)`,
            'Avg Response Time'
          ]}
        />
        <Bar dataKey="avgTime" radius={[8, 8, 0, 0]}>
          {agentStats.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
