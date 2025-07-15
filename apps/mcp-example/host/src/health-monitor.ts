import { McpRegistry } from './mcp-registry';
import { Server } from '@modelcontextprotocol/sdk/server/index';

export interface HealthStatus {
  serverName: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: Date;
  error?: string;
  tools?: number;
  version?: string;
}

export class HealthMonitor {
  private registry: McpRegistry;
  private healthStatuses: Map<string, HealthStatus> = new Map();
  private checkInterval: NodeJS.Timer | null = null;

  constructor(registry: McpRegistry) {
    this.registry = registry;
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    // Initial check
    this.checkAllServers();

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.checkAllServers();
    }, intervalMs);

    console.log(`🏥 Health monitoring started (interval: ${intervalMs}ms)`);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🏥 Health monitoring stopped');
    }
  }

  private async checkAllServers(): Promise<void> {
    const servers = this.registry.getAllServers();

    for (const serverInfo of servers) {
      await this.checkServer(serverInfo.name, serverInfo.server);
    }
  }

  private async checkServer(name: string, server: Server): Promise<void> {
    const status: HealthStatus = {
      serverName: name,
      status: 'unknown',
      lastChecked: new Date(),
    };

    try {
      // Try to get server info by calling list tools
      const request = {
        method: 'tools/list' as const,
        params: {},
      };

      const result = await server.request(request);
      const tools = result.tools || [];

      status.status = 'healthy';
      status.tools = tools.length;
      status.version = '1.0.0'; // Could be extracted from server info
    } catch (error) {
      status.status = 'unhealthy';
      status.error = error instanceof Error ? error.message : String(error);
    }

    this.healthStatuses.set(name, status);
  }

  getStatus(serverName: string): HealthStatus | undefined {
    return this.healthStatuses.get(serverName);
  }

  getAllStatuses(): HealthStatus[] {
    return Array.from(this.healthStatuses.values());
  }

  getHealthSummary(): {
    total: number;
    healthy: number;
    unhealthy: number;
    unknown: number;
  } {
    const statuses = this.getAllStatuses();
    return {
      total: statuses.length,
      healthy: statuses.filter((s) => s.status === 'healthy').length,
      unhealthy: statuses.filter((s) => s.status === 'unhealthy').length,
      unknown: statuses.filter((s) => s.status === 'unknown').length,
    };
  }

  async performHealthCheck(serverName: string): Promise<HealthStatus> {
    const serverInfo = this.registry.getServer(serverName);
    if (!serverInfo) {
      return {
        serverName,
        status: 'unhealthy',
        lastChecked: new Date(),
        error: 'Server not found',
      };
    }

    await this.checkServer(serverName, serverInfo.server);
    return this.getStatus(serverName)!;
  }
}
