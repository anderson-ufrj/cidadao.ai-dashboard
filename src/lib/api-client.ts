/**
 * API Client for Cidadão.AI Backend
 * Connects to the Railway production backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
  status: 'active' | 'inactive' | 'busy';
}

export interface HealthStatus {
  api: {
    status: string;
    version: string;
    uptime_seconds: number;
    uptime_formatted: string;
    environment: string;
  };
  agents: Record<string, {
    status: string;
    capabilities: string[];
  }>;
  overall_status: string;
  timestamp: string;
}

export class CidadaoAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get available agents
   */
  async getAgents(): Promise<Agent[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/chat/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get detailed health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health/detailed`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch health status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get simple health check
   */
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Start an investigation (requires auth in production)
   */
  async startInvestigation(query: string, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/investigations/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start investigation: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stream investigation results
   */
  async* streamInvestigation(investigationId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/investigations/stream/${investigationId}`,
      {
        headers: {
          'Accept': 'text/event-stream',
        },
      }
    );

    if (!response.ok || !response.body) {
      throw new Error(`Failed to stream investigation: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

// Export singleton instance
export const apiClient = new CidadaoAPIClient();