# Cidadão.AI Dashboard - Technical Architecture

## System Overview

Multi-layer React/Next.js dashboard for monitoring 16 Brazilian AI agents in real-time.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Client                       │
├─────────────────────────────────────────────────────────┤
│  React Components                                        │
│  ├─ Dashboard (main orchestrator)                       │
│  ├─ AgentCard (individual status)                       │
│  ├─ AgentGraph (Cytoscape DAG)                          │
│  └─ PerformanceChart (Recharts viz)                     │
├─────────────────────────────────────────────────────────┤
│  Data Layer (SWR + React Query patterns)                │
│  ├─ useAgentMetrics hook                                │
│  ├─ Client-side cache (5s stale)                        │
│  └─ Auto-revalidation on focus/reconnect                │
├─────────────────────────────────────────────────────────┤
│  Next.js App Router                                      │
│  ├─ /api/metrics (GET)                                  │
│  ├─ /api/agents/[id] (GET)                              │
│  └─ SSR/SSG support                                      │
├─────────────────────────────────────────────────────────┤
│  Backend Integration Layer (TODO: Production)           │
│  ├─ Cidadão.AI REST API                                 │
│  ├─ Prometheus metrics                                   │
│  ├─ PostgreSQL direct queries                           │
│  └─ Redis cache layer                                    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Current (Demo Mode)

```
1. Browser → GET /api/metrics
2. API Route → generateSyntheticData()
3. In-memory cache (5s TTL)
4. JSON response → SWR cache
5. React components render
6. Auto-refresh every 5s
```

### Production (Future)

```
1. Browser → GET /api/metrics
2. API Route checks Redis cache
   ├─ HIT → Return cached (< 5s old)
   └─ MISS → Query backend
3. Backend options:
   ├─ Cidadão.AI /api/agents/status
   ├─ Prometheus /api/v1/query
   └─ PostgreSQL agent_metrics table
4. Transform to AgentMetricsResponse type
5. Store in Redis (5s TTL)
6. Return to client → SWR cache
7. WebSocket stream for real-time updates
```

## Component Architecture

### Dashboard Component Tree

```
<Dashboard>
├─ <Card> (Header)
│  ├─ <MetricCard> × 4 (summary stats)
│  └─ Refresh button
├─ <Card> (Agent Graph)
│  └─ <AgentGraph>
│     └─ Cytoscape instance
├─ <Card> (Performance)
│  └─ <PerformanceChart>
│     └─ Recharts BarChart
├─ <Card> (Agent Status)
│  └─ <AgentCard> × 16
└─ <Card> (Reflection Quality)
   └─ Progress bars × 16
```

## State Management

### SWR Configuration

```typescript
{
  refreshInterval: 5000,        // Poll every 5s
  revalidateOnFocus: true,      // Refresh on tab focus
  revalidateOnReconnect: true,  // Refresh on network reconnect
  dedupingInterval: 2000,       // Dedupe requests within 2s
  fallbackData: undefined       // SSR support
}
```

### Cache Strategy

- **L1 Cache**: SWR in-memory (client-side)
- **L2 Cache**: API route in-memory (5s TTL)
- **L3 Cache**: Redis (production, 5s TTL)
- **L4 Source**: Cidadão.AI backend / Prometheus

## Type System

### Core Types

```typescript
// Agent definition (static)
interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  layer: AgentLayer;
}

// Agent runtime state (dynamic)
interface AgentState {
  state: 'IDLE' | 'THINKING' | 'ACTING' | 'COMPLETED' | 'ERROR';
  lastActive: number;
  requestCount: number;
  avgResponseTime: number;
  successRate: number;
  reflectionCount: number;
}

// API response
interface AgentMetricsResponse {
  agents: Record<string, AgentState>;
  performance: PerformanceDataPoint[];
  reflections: Record<string, ReflectionMetrics>;
  transitions: StateTransitionMatrix;
  summary: DashboardMetrics;
}
```

## Performance Optimizations

### Current

1. **SWR Deduping**: Prevents duplicate requests within 2s window
2. **Memoization**: React.memo on expensive components
3. **Lazy Loading**: Dynamic imports for heavy libraries
4. **Tree Shaking**: Next.js automatic code splitting

### Future Enhancements

1. **Virtual Scrolling**: For large agent lists (>50 agents)
2. **WebSocket Streaming**: Replace polling with push updates
3. **Edge Caching**: Vercel Edge Functions for faster responses
4. **IndexedDB**: Client-side persistence for offline support
5. **Service Worker**: Background sync and prefetching

## Monitoring & Observability

### Metrics to Track

```typescript
// Frontend metrics
- Page load time (LCP, FID, CLS)
- API latency (p50, p95, p99)
- Cache hit rate
- WebSocket connection drops
- Component render time

// Backend metrics (if self-hosted)
- Request rate
- Error rate
- Cache hit/miss ratio
- Database query time
- Memory usage
```

### Integration with Cidadão.AI Prometheus

```typescript
// Example PromQL queries
rate(agent_requests_total[5m])
histogram_quantile(0.95, agent_response_time_seconds_bucket)
sum(agent_reflections_total) by (agent_id)
avg(agent_quality_score) by (agent_id)
```

## Security Considerations

### API Protection

```typescript
// Rate limiting (production)
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,              // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
};

// API key authentication
if (process.env.NODE_ENV === 'production') {
  const apiKey = request.headers['x-api-key'];
  if (apiKey !== process.env.CIDADAO_API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }
}
```

## Deployment Strategies

### Option 1: Vercel (Serverless)

**Pros:**
- Zero config deployment
- Edge network (CDN)
- Automatic HTTPS
- Preview deployments

**Cons:**
- Cold starts on API routes
- Serverless execution limits (10s)

```bash
vercel --prod
```

### Option 2: Docker + Railway/Fly.io

**Pros:**
- Long-running processes (WebSocket)
- Full control over environment
- Consistent with Cidadão.AI backend

**Cons:**
- Manual configuration
- Higher ops burden

```bash
railway up
```

### Option 3: Static Export + Separate API

**Pros:**
- Fastest possible frontend
- Deploy to S3/Cloudflare Pages
- API independently scalable

**Cons:**
- No API routes in Next.js
- Requires separate backend

```typescript
// next.config.mjs
export default {
  output: 'export',
};
```

## Testing Strategy

### Unit Tests

```typescript
// components/dashboard/AgentCard.test.tsx
describe('AgentCard', () => {
  it('displays agent name and role', () => {
    render(<AgentCard agent={mockAgent} state={mockState} />);
    expect(screen.getByText('Zumbi dos Palmares')).toBeInTheDocument();
  });

  it('applies correct state color', () => {
    const { container } = render(
      <AgentCard agent={mockAgent} state={{ ...mockState, state: 'THINKING' }} />
    );
    expect(container.querySelector('.bg-yellow-600')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// api/metrics.test.ts
describe('GET /api/metrics', () => {
  it('returns valid AgentMetricsResponse', async () => {
    const response = await fetch('/api/metrics');
    const data = await response.json();
    
    expect(data).toHaveProperty('agents');
    expect(data).toHaveProperty('summary');
    expect(Object.keys(data.agents)).toHaveLength(16);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/dashboard.spec.ts
test('dashboard loads and displays metrics', async ({ page }) => {
  await page.goto('/');
  
  await expect(page.locator('h1')).toContainText('Agent Orchestration');
  await expect(page.locator('[data-testid="active-agents"]')).toBeVisible();
  
  // Wait for data to load
  await page.waitForResponse(/\/api\/metrics/);
  
  // Verify agent cards rendered
  const agentCards = page.locator('[data-testid="agent-card"]');
  await expect(agentCards).toHaveCount(16);
});
```

## Scaling Considerations

### Current Limits

- **Agents**: Optimized for 16, tested up to 50
- **Concurrent Users**: ~100 (Vercel free tier)
- **Data Points**: 50 per agent, 800 total in memory
- **Refresh Rate**: 5s (200 reqs/min per user)

### Scaling Strategies

**Horizontal Scaling (Users)**
- Use Redis for shared cache
- Enable ISR (Incremental Static Regeneration)
- CDN for static assets

**Vertical Scaling (Data)**
- Pagination for large datasets
- Time-window queries (last 5 min only)
- Aggregation on backend

**Real-time Scaling**
- WebSocket server cluster
- Redis Pub/Sub for broadcasting
- Sticky sessions for WS connections

## Roadmap

### Phase 1: MVP (Current)
- [x] Basic dashboard layout
- [x] Agent status cards
- [x] Orchestration graph
- [x] Performance charts
- [x] Synthetic data generation

### Phase 2: Production Integration
- [ ] Connect to Cidadão.AI API
- [ ] Redis caching layer
- [ ] WebSocket real-time updates
- [ ] Error boundary handling
- [ ] Loading states optimization

### Phase 3: Advanced Features
- [ ] Historical data viewer
- [ ] Alert system (threshold breaches)
- [ ] Custom dashboard builder
- [ ] Export reports (PDF/CSV)
- [ ] Agent logs viewer

### Phase 4: Scale & Polish
- [ ] Multi-tenancy support
- [ ] RBAC (role-based access)
- [ ] Audit logging
- [ ] Performance profiling tools
- [ ] Mobile-responsive improvements

---

**Last Updated**: 2025-01-17
**Maintainer**: Engineering Team
**Status**: MVP Complete, Production Integration Pending
