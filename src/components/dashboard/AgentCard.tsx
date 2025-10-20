'use client';

import { Agent, AgentRuntimeState } from '@/types/agent';
import { STATE_COLORS } from '@/lib/constants';
import { cn, formatRelativeTime } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  state: AgentRuntimeState;
  onClick?: () => void;
}

export function AgentCard({ agent, state, onClick }: AgentCardProps) {
  const stateColor = STATE_COLORS[state.state];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg p-4 cursor-pointer',
        'bg-slate-800/50 border border-white/10',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20',
        'before:absolute before:inset-0 before:bg-gradient-to-r',
        'before:from-transparent before:via-blue-500/10 before:to-transparent',
        'before:-translate-x-full before:transition-transform before:duration-500',
        'hover:before:translate-x-full'
      )}
      style={{
        borderColor: agent.color + '33'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-3 h-3 rounded-full animate-pulse',
              stateColor
            )}
            style={{
              boxShadow: `0 0 10px ${agent.color}`
            }}
          />
          <span className="font-bold text-sm text-white truncate">
            {agent.name}
          </span>
        </div>
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {state.state}
        </span>
      </div>

      {/* Role */}
      <div className="text-xs text-gray-400 mb-3 truncate">
        {agent.role}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500 mb-1">Requests</div>
          <div className="font-semibold text-white">{state.requestCount}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Avg Time</div>
          <div className="font-semibold text-white">
            {Math.round(state.avgResponseTime)}ms
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Success</div>
          <div className="font-semibold text-green-400">
            {Math.round(state.successRate * 100)}%
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Reflections</div>
          <div className="font-semibold text-purple-400">
            {state.reflectionCount}
          </div>
        </div>
      </div>

      {/* Last Active */}
      {state.lastActive && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-xs text-gray-500">
            Last active {formatRelativeTime(state.lastActive)}
          </div>
        </div>
      )}

      {/* Layer indicator */}
      <div
        className="absolute top-0 right-0 w-1 h-full opacity-50"
        style={{ backgroundColor: agent.color }}
      />
    </div>
  );
}
