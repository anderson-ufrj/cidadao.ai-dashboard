import { Agent } from '@/types/agent';

export const CIDADAO_API_BASE = 'https://cidadao-api-production.up.railway.app';

export const AGENTS: Record<string, Agent> = {
  abaporu: {
    id: 'abaporu',
    name: 'Abaporu',
    role: 'Master Orchestrator',
    color: '#ef4444',
    layer: 'orchestration',
    description: 'Orchestrates all agents using ReAct pattern',
    image: '/agents/abaporu.png'
  },
  ayrton_senna: {
    id: 'ayrton_senna',
    name: 'Ayrton Senna',
    role: 'Intent Router',
    color: '#f59e0b',
    layer: 'orchestration',
    description: 'Semantic routing and intent classification',
    image: '/agents/senna.png'
  },
  zumbi: {
    id: 'zumbi',
    name: 'Zumbi dos Palmares',
    role: 'Anomaly Detection',
    color: '#8b5cf6',
    layer: 'analysis',
    description: 'FFT spectral analysis, deviation detection',
    image: '/agents/zumbi.png'
  },
  anita: {
    id: 'anita',
    name: 'Anita Garibaldi',
    role: 'Statistical Analysis',
    color: '#06b6d4',
    layer: 'analysis',
    description: 'Statistical data analysis, correlation matrices',
    image: '/agents/anita.png'
  },
  oxossi: {
    id: 'oxossi',
    name: 'Oxóssi',
    role: 'Fraud Detection',
    color: '#ec4899',
    layer: 'analysis',
    description: '7+ fraud pattern detection algorithms',
    image: '/agents/oxossi.png'
  },
  obaluae: {
    id: 'obaluae',
    name: 'Obaluaê',
    role: 'Corruption Detection',
    color: '#f43f5e',
    layer: 'analysis',
    description: "Benford's Law, network analysis",
    image: '/agents/obaluaie.png'
  },
  ceuci: {
    id: 'ceuci',
    name: 'Ceuci',
    role: 'Predictive AI',
    color: '#10b981',
    layer: 'analysis',
    description: 'Predictive ML, time series forecasting',
    image: '/agents/ceuci.png'
  },
  lampiao: {
    id: 'lampiao',
    name: 'Lampião',
    role: 'Regional Analysis',
    color: '#f97316',
    layer: 'analysis',
    description: 'Geospatial analysis, regional patterns',
    image: '/agents/lampiao.png'
  },
  drummond: {
    id: 'drummond',
    name: 'Carlos Drummond',
    role: 'NLG',
    color: '#3b82f6',
    layer: 'communication',
    description: 'Natural language generation with poetry',
    image: '/agents/drummond.png'
  },
  tiradentes: {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: 'Reporter',
    color: '#14b8a6',
    layer: 'communication',
    description: 'Multi-format report generation',
    image: '/agents/tiradentes.png'
  },
  niemeyer: {
    id: 'niemeyer',
    name: 'Oscar Niemeyer',
    role: 'Visualizer',
    color: '#a855f7',
    layer: 'communication',
    description: 'Plotly charts, NetworkX graphs',
    image: '/agents/niemeyer.png'
  },
  quiteria: {
    id: 'quiteria',
    name: 'Maria Quitéria',
    role: 'Security',
    color: '#dc2626',
    layer: 'governance',
    description: 'MITRE ATT&CK, UEBA, threat detection',
    image: '/agents/quiteria.png'
  },
  bonifacio: {
    id: 'bonifacio',
    name: 'José Bonifácio',
    role: 'Legal',
    color: '#7c3aed',
    layer: 'governance',
    description: 'Legal compliance, policy analysis',
    image: '/agents/bonifacio.png'
  },
  dandara: {
    id: 'dandara',
    name: 'Dandara',
    role: 'Social Justice',
    color: '#db2777',
    layer: 'governance',
    description: 'Social justice metrics, equity analysis',
    image: '/agents/dandara.png'
  },
  nana: {
    id: 'nana',
    name: 'Nanã',
    role: 'Memory',
    color: '#6366f1',
    layer: 'support',
    description: 'Context management, session state',
    image: '/agents/nana.png'
  },
  machado: {
    id: 'machado',
    name: 'Machado de Assis',
    role: 'Narrative',
    color: '#0891b2',
    layer: 'support',
    description: 'Story analysis, narrative patterns',
    image: '/agents/machado.png'
  }
};

// Orchestration graph edges
export const AGENT_EDGES = [
  { source: 'abaporu', target: 'ayrton_senna' },
  { source: 'ayrton_senna', target: 'zumbi' },
  { source: 'ayrton_senna', target: 'anita' },
  { source: 'ayrton_senna', target: 'oxossi' },
  { source: 'ayrton_senna', target: 'obaluae' },
  { source: 'ayrton_senna', target: 'ceuci' },
  { source: 'ayrton_senna', target: 'lampiao' },
  { source: 'zumbi', target: 'drummond' },
  { source: 'anita', target: 'niemeyer' },
  { source: 'oxossi', target: 'tiradentes' },
  { source: 'obaluae', target: 'tiradentes' },
  { source: 'abaporu', target: 'nana' },
  { source: 'nana', target: 'machado' },
  { source: 'quiteria', target: 'abaporu' },
  { source: 'bonifacio', target: 'abaporu' },
  { source: 'dandara', target: 'abaporu' }
];

// Performance targets from SKILL.md
export const PERFORMANCE_TARGETS = {
  apiResponseP95: 200, // ms
  agentProcessing: 5000, // ms
  chatFirstToken: 500, // ms
  investigation: 15000, // ms (6 agents)
  testCoverage: 80, // %
  reflectionThreshold: 0.8 // quality score
} as const;

// Agent state colors for UI
export const STATE_COLORS = {
  IDLE: 'bg-gray-600',
  THINKING: 'bg-yellow-600',
  ACTING: 'bg-blue-600',
  COMPLETED: 'bg-green-600',
  ERROR: 'bg-red-600'
} as const;
