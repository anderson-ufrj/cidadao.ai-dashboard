// Agent state machine states
export type AgentState = 'IDLE' | 'THINKING' | 'ACTING' | 'COMPLETED' | 'ERROR';

// Agent layers in the architecture
export type AgentLayer = 'orchestration' | 'analysis' | 'communication' | 'governance' | 'support';

// Agent definition
export interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  layer: AgentLayer;
  description?: string;
  image?: string;
}

// Runtime agent state
export interface AgentRuntimeState {
  state: AgentState;
  lastActive: number;
  requestCount: number;
  avgResponseTime: number;
  successRate: number;
  reflectionCount: number;
  errorCount?: number;
}

// Performance data point
export interface PerformanceDataPoint {
  timestamp: number;
  agent: string;
  responseTime: number;
  success: boolean;
  reflectionTriggered?: boolean;
}

// Reflection quality metrics
export interface ReflectionMetrics {
  attempts: number;
  avgQuality: number;
  improvementRate: number;
  belowThresholdCount: number;
}

// State transition data
export type StateTransitionMatrix = Record<AgentState, Record<AgentState, number>>;

// Dashboard metrics summary
export interface DashboardMetrics {
  activeAgents: number;
  avgResponseTime: number;
  reflectionRate: number;
  successRate: number;
  totalRequests: number;
  timestamp: number;
  dataSource?: 'railway' | 'mock';
  backendStatus?: string;
  apiVersion?: string;
}

// API response types
export interface AgentMetricsResponse {
  agents: Record<string, AgentRuntimeState>;
  performance: PerformanceDataPoint[];
  reflections: Record<string, ReflectionMetrics>;
  transitions: StateTransitionMatrix;
  summary: DashboardMetrics;
}

// Cytoscape graph element types
export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    color: string;
    layer: AgentLayer;
    role: string;
  };
}

export interface CytoscapeEdge {
  data: {
    source: string;
    target: string;
    weight?: number;
  };
}

export type CytoscapeElement = CytoscapeNode | CytoscapeEdge;

// WebSocket message types for real-time updates
export interface AgentStateUpdate {
  type: 'state_change';
  agentId: string;
  state: AgentState;
  timestamp: number;
}

export interface PerformanceUpdate {
  type: 'performance';
  data: PerformanceDataPoint;
}

export type WebSocketMessage = AgentStateUpdate | PerformanceUpdate;
