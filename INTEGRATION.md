# Guia de Integração com API Real do Cidadão.AI

Este guia mostra como conectar o dashboard à API real do Cidadão.AI em produção.

## 🎯 Opções de Integração

### Opção 1: REST API Direta (Recomendada)

**Quando usar:** Se você tem endpoints `/api/agents/metrics` no backend Cidadão.AI

**Passos:**

1. **Configure o backend para expor métricas:**

```python
# src/api/routes/agents.py (Cidadão.AI backend)
from fastapi import APIRouter, Depends
from src.infrastructure.agent_pool import AgentPool

router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.get("/metrics")
async def get_agent_metrics():
    """Retorna métricas de todos os agents em tempo real"""
    pool = AgentPool()
    
    agents_state = {}
    for agent_id in pool.agents:
        agent = await pool.get_agent(agent_id)
        agents_state[agent_id] = {
            "state": agent.state,
            "lastActive": agent.last_active_timestamp,
            "requestCount": agent.request_count,
            "avgResponseTime": agent.avg_response_time,
            "successRate": agent.success_rate,
            "reflectionCount": agent.reflection_count
        }
    
    # Buscar performance data do Redis/PostgreSQL
    performance_data = await get_recent_performance_data()
    
    return {
        "agents": agents_state,
        "performance": performance_data,
        "reflections": await get_reflection_metrics(),
        "transitions": await get_state_transitions(),
        "summary": calculate_summary(agents_state, performance_data)
    }
```

2. **Modifique o dashboard API route:**

```typescript
// src/app/api/metrics/route.ts
import { CIDADAO_API_BASE } from '@/lib/constants';

export async function GET() {
  try {
    const response = await fetch(`${CIDADAO_API_BASE}/api/agents/metrics`, {
      headers: {
        'Authorization': `Bearer ${process.env.CIDADAO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 5 } // ISR cache for 5s
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch real metrics:', error);
    
    // Fallback to synthetic data in dev/error
    if (process.env.NODE_ENV === 'development') {
      return generateSyntheticMetrics();
    }
    
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }
}
```

3. **Configure variáveis de ambiente:**

```bash
# .env.local
CIDADAO_API_BASE=https://cidadao-api-production.up.railway.app
CIDADAO_API_KEY=your_actual_api_key_here
```

---

### Opção 2: Prometheus + Grafana

**Quando usar:** Se você já tem Prometheus configurado no Cidadão.AI

**Passos:**

1. **Verifique as métricas expostas no Cidadão.AI:**

```python
# src/infrastructure/monitoring.py (backend)
from prometheus_client import Counter, Histogram, Gauge

agent_requests_total = Counter(
    'agent_requests_total',
    'Total agent requests',
    ['agent_id', 'status']
)

agent_response_time = Histogram(
    'agent_response_time_seconds',
    'Agent response time',
    ['agent_id']
)

agent_state = Gauge(
    'agent_state',
    'Current agent state',
    ['agent_id', 'state']
)

agent_reflection_quality = Gauge(
    'agent_reflection_quality',
    'Reflection quality score',
    ['agent_id']
)
```

2. **Crie API route para query Prometheus:**

```typescript
// src/app/api/metrics/route.ts
async function fetchFromPrometheus(): Promise<AgentMetricsResponse> {
  const promUrl = process.env.PROMETHEUS_URL || 'http://localhost:9090';
  
  // Query 1: Agent request rates
  const requestsQuery = await fetch(
    `${promUrl}/api/v1/query?query=rate(agent_requests_total[5m])`
  );
  const requestsData = await requestsQuery.json();
  
  // Query 2: Response times (p95)
  const latencyQuery = await fetch(
    `${promUrl}/api/v1/query?query=histogram_quantile(0.95,rate(agent_response_time_seconds_bucket[5m]))`
  );
  const latencyData = await latencyQuery.json();
  
  // Query 3: Reflection quality
  const qualityQuery = await fetch(
    `${promUrl}/api/v1/query?query=agent_reflection_quality`
  );
  const qualityData = await qualityQuery.json();
  
  // Transform Prometheus format to AgentMetricsResponse
  return transformPrometheusData(requestsData, latencyData, qualityData);
}
```

---

### Opção 3: PostgreSQL Direto

**Quando usar:** Se você prefere consultar o banco diretamente para dados históricos

**Passos:**

1. **Configure schema no PostgreSQL:**

```sql
-- migrations/create_agent_metrics.sql
CREATE TABLE agent_metrics (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    state VARCHAR(20) NOT NULL,
    response_time_ms INTEGER,
    success BOOLEAN,
    reflection_triggered BOOLEAN,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_agent_timestamp (agent_id, timestamp DESC),
    INDEX idx_timestamp (timestamp DESC)
);

CREATE TABLE agent_reflections (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    quality_score DECIMAL(3,2),
    improvement_rate DECIMAL(3,2),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Instale cliente PostgreSQL:**

```bash
npm install pg
npm install --save-dev @types/pg
```

3. **Crie API route com query SQL:**

```typescript
// src/app/api/metrics/route.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function GET() {
  const client = await pool.connect();
  
  try {
    // Query agent states (últimos 5 minutos)
    const agentStatesQuery = await client.query(`
      SELECT 
        agent_id,
        state,
        COUNT(*) as request_count,
        AVG(response_time_ms) as avg_response_time,
        AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate,
        MAX(timestamp) as last_active
      FROM agent_metrics
      WHERE timestamp > NOW() - INTERVAL '5 minutes'
      GROUP BY agent_id, state
    `);
    
    // Query reflection metrics
    const reflectionsQuery = await client.query(`
      SELECT 
        agent_id,
        COUNT(*) as attempts,
        AVG(quality_score) as avg_quality,
        AVG(improvement_rate) as improvement_rate
      FROM agent_reflections
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY agent_id
    `);
    
    // Transform to AgentMetricsResponse
    const response = transformDatabaseResults(
      agentStatesQuery.rows,
      reflectionsQuery.rows
    );
    
    return NextResponse.json(response);
  } finally {
    client.release();
  }
}
```

---

### Opção 4: Redis Cache Layer (Hybrid)

**Quando usar:** Para máxima performance com dados real-time

**Arquitetura:**

```
Cidadão.AI Backend → Redis (pub/sub) → Dashboard API → Frontend
```

**Passos:**

1. **Configure Redis no backend:**

```python
# src/infrastructure/cache.py
import redis
import json

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=6379,
    decode_responses=True
)

async def publish_agent_update(agent_id: str, state: dict):
    """Publica update de agent para dashboard"""
    message = {
        'type': 'agent_state_update',
        'agent_id': agent_id,
        'state': state,
        'timestamp': time.time()
    }
    redis_client.publish('agent_updates', json.dumps(message))
    
    # Cache também para queries HTTP
    redis_client.setex(
        f'agent:{agent_id}:state',
        5,  # TTL 5s
        json.dumps(state)
    )
```

2. **Instale Upstash Redis (serverless-friendly):**

```bash
npm install @upstash/redis
```

3. **Implemente no dashboard:**

```typescript
// src/app/api/metrics/route.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function GET() {
  // Tenta cache primeiro
  const cached = await redis.get<AgentMetricsResponse>('dashboard:metrics');
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // Fetch from backend
  const fresh = await fetchFromCidadaoAPI();
  
  // Cache por 5s
  await redis.setex('dashboard:metrics', 5, JSON.stringify(fresh));
  
  return NextResponse.json(fresh);
}
```

---

## 🚀 WebSocket Real-Time (Avançado)

Para updates em tempo real sem polling:

### Backend (Cidadão.AI)

```python
# src/api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    async def broadcast_agent_update(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/metrics")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantém conexão viva
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.active_connections.remove(websocket)

# Em cada agent, após completar ação:
async def on_agent_complete(agent_id: str, result: dict):
    await manager.broadcast_agent_update({
        'type': 'agent_state_update',
        'agent_id': agent_id,
        'state': result
    })
```

### Frontend (Dashboard)

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { AgentStateUpdate } from '@/types/agent';

export function useAgentWebSocket(onUpdate: (update: AgentStateUpdate) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL || 'wss://cidadao-api-production.up.railway.app'}/ws/metrics`
    );
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Fallback to polling
    };
    
    wsRef.current = ws;
    
    return () => ws.close();
  }, [onUpdate]);
  
  return wsRef.current;
}
```

```typescript
// src/components/dashboard/Dashboard.tsx
import { useAgentWebSocket } from '@/hooks/useWebSocket';

export function Dashboard() {
  const { metrics, mutate } = useAgentMetrics();
  
  // WebSocket para updates real-time
  useAgentWebSocket((update) => {
    // Optimistic update do SWR cache
    mutate((current) => {
      if (!current) return current;
      
      return {
        ...current,
        agents: {
          ...current.agents,
          [update.agent_id]: update.state
        }
      };
    }, false); // Não revalida
  });
  
  // ...resto do componente
}
```

---

## 📊 Monitoramento da Integração

### Health Check

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    api: false,
    redis: false,
    database: false,
    websocket: false
  };
  
  try {
    // Test API
    const apiResponse = await fetch(`${CIDADAO_API_BASE}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    checks.api = apiResponse.ok;
    
    // Test Redis
    if (process.env.REDIS_URL) {
      const redis = new Redis({ url: process.env.REDIS_URL });
      await redis.ping();
      checks.redis = true;
    }
    
    // Test Database
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      await pool.query('SELECT 1');
      checks.database = true;
    }
    
    const allHealthy = Object.values(checks).every(v => v);
    
    return NextResponse.json(
      { status: allHealthy ? 'healthy' : 'degraded', checks },
      { status: allHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: String(error) },
      { status: 503 }
    );
  }
}
```

---

## 🔧 Troubleshooting

### Erro: CORS

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ];
  },
};
```

### Erro: Timeout

```typescript
// Aumente timeout do fetch
const response = await fetch(url, {
  signal: AbortSignal.timeout(10000) // 10s
});
```

### Erro: Rate Limit

```typescript
// Implemente exponential backoff
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

---

## ✅ Checklist de Go-Live

- [ ] Backend endpoint `/api/agents/metrics` implementado
- [ ] Autenticação configurada (API key / JWT)
- [ ] Rate limiting habilitado
- [ ] CORS configurado corretamente
- [ ] Redis cache layer (opcional mas recomendado)
- [ ] WebSocket endpoint (para real-time)
- [ ] Logs e monitoring (Sentry/DataDog)
- [ ] Load testing (100+ usuários simultâneos)
- [ ] Rollback plan (fallback para synthetic data)
- [ ] Documentation atualizada

---

**Need Help?** 
- Check `ARCHITECTURE.md` para detalhes técnicos
- See `README.md` para comandos e troubleshooting
- Backend repo: https://github.com/anderson-ufrj/cidadao.ai-backend
