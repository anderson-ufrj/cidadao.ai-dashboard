# Cidadão.AI - Agent Orchestration Dashboard

Real-time monitoring and performance analysis dashboard for the Cidadão.AI Brazilian government transparency multi-agent system.

## 🎯 Features

- **Real-time Agent Monitoring**: Track state transitions (IDLE → THINKING → ACTING → COMPLETED) for all 16 Brazilian cultural AI agents
- **Performance Analytics**: Response time distribution, p95/p99 latency, success rates
- **Reflection Quality Tracking**: Monitor self-evaluation scores and improvement rates (0.8 threshold)
- **Interactive Orchestration Graph**: Cytoscape-powered DAG visualization of agent coordination
- **Live Metrics**: Auto-refreshing SWR-based data fetching with 5s intervals
- **Type-safe**: Full TypeScript coverage with strict mode

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Data Fetching**: SWR (stale-while-revalidate)
- **Charts**: Recharts (lightweight, SSR-friendly)
- **Graph**: Cytoscape.js (agent orchestration visualization)
- **State Management**: React hooks + SWR cache

### Project Structure

```
cidadao-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── metrics/
│   │   │       └── route.ts        # API endpoint for agent metrics
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx        # Main dashboard component
│   │   │   ├── AgentCard.tsx        # Individual agent status card
│   │   │   ├── AgentGraph.tsx       # Cytoscape orchestration graph
│   │   │   └── PerformanceChart.tsx # Response time visualization
│   │   └── ui/
│   │       └── Card.tsx             # Reusable card components
│   ├── hooks/
│   │   └── useAgentMetrics.ts       # SWR hook for data fetching
│   ├── lib/
│   │   ├── constants.ts             # Agent definitions, colors, edges
│   │   └── utils.ts                 # Helper functions, synthetic data
│   └── types/
│       └── agent.ts                 # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
cd cidadao-dashboard
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## 📊 API Integration

### Current State (Demo Mode)

The dashboard currently uses **synthetic data** generated in `/api/metrics/route.ts` for demonstration purposes.

### Production Integration

To connect to the real Cidadão.AI backend, modify `/src/app/api/metrics/route.ts`:

#### Option 1: Direct API Call

```typescript
async function fetchRealMetrics(): Promise<AgentMetricsResponse> {
  const response = await fetch(
    `${CIDADAO_API_BASE}/api/agents/metrics`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CIDADAO_API_KEY}`
      }
    }
  );
  return response.json();
}
```

#### Option 2: Prometheus Query

```typescript
const promResponse = await fetch('http://prometheus:9090/api/v1/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    query: 'rate(agent_requests_total{job="cidadao-agents"}[5m])'
  })
});
```

#### Option 3: PostgreSQL Direct

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const result = await pool.query(`
  SELECT agent_id, state, AVG(response_time_ms) as avg_time
  FROM agent_metrics
  WHERE timestamp > NOW() - INTERVAL '5 minutes'
  GROUP BY agent_id, state
`);
```

### Environment Variables

Create `.env.local`:

```bash
# Cidadão.AI API
CIDADAO_API_BASE=https://cidadao-api-production.up.railway.app
CIDADAO_API_KEY=your_api_key_here

# Database (optional)
DATABASE_URL=postgresql://user:pass@host:5432/cidadao

# Prometheus (optional)
PROMETHEUS_URL=http://localhost:9090
```

## 🎨 Customization

### Adding New Agents

1. Update `/src/lib/constants.ts`:

```typescript
export const AGENTS: Record<string, Agent> = {
  // ... existing agents
  new_agent: {
    id: 'new_agent',
    name: 'New Agent Name',
    role: 'Agent Role',
    color: '#hex_color',
    layer: 'analysis', // orchestration | analysis | communication | governance | support
    description: 'Agent description'
  }
};
```

2. Add edges to `AGENT_EDGES` if needed.

### Modifying Metrics

Update `/src/types/agent.ts` to add new metric types:

```typescript
export interface AgentState {
  // ... existing fields
  customMetric: number;
}
```

### Styling

- Global styles: `/src/app/globals.css`
- Tailwind config: `/tailwind.config.ts`
- Component styles: Inline Tailwind classes

## 📈 Performance Targets

From Cidadão.AI system requirements:

- **API Response (p95)**: < 200ms
- **Agent Processing**: < 5s
- **Chat First Token**: < 500ms
- **Investigation (6 agents)**: < 15s
- **Reflection Threshold**: 0.8 (quality score)

## 🔧 Advanced Features

### WebSocket Integration

For real-time updates, implement WebSocket connection in `/src/hooks/useAgentMetrics.ts`:

```typescript
export function useRealtimeAgentUpdates(onUpdate: (data: any) => void) {
  useEffect(() => {
    const ws = new WebSocket('wss://cidadao-api.railway.app/ws/metrics');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return () => ws.close();
  }, [onUpdate]);
}
```

### Redis Caching

Add Redis layer for better performance:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// In API route
const cached = await redis.get('agent-metrics');
if (cached) return NextResponse.json(cached);

// ... fetch fresh data
await redis.set('agent-metrics', data, { ex: 5 });
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

### Railway

```bash
railway login
railway init
railway up
```

## 🐛 Troubleshooting

### Cytoscape not rendering

Ensure `cytoscape` is installed and containerRef is properly initialized:

```bash
npm install cytoscape --save
```

### SWR not fetching

Check API route is accessible:

```bash
curl http://localhost:3000/api/metrics
```

### Type errors

Run type check to identify issues:

```bash
npm run type-check
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## 📚 Resources

- [Cidadão.AI Backend](https://github.com/anderson-ufrj/cidadao.ai-backend)
- [Next.js Docs](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app)
- [Cytoscape.js](https://js.cytoscape.org/)
- [Recharts](https://recharts.org/)

---

Built with ❤️ for transparent governance in Brazil 🇧🇷
