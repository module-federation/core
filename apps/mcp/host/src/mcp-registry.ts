import { Server } from '@modelcontextprotocol/sdk/server/index';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types';

export interface McpServerInfo {
  name: string;
  version: string;
  server: Server;
  tools: Tool[];
}

export class McpRegistry {
  private servers: Map<string, McpServerInfo> = new Map();

  async registerServer(name: string, server: Server): Promise<void> {
    try {
      // Get server info and tools
      const tools = await this.getServerTools(server);

      const serverInfo: McpServerInfo = {
        name,
        version: '1.0.0', // Default version
        server,
        tools,
      };

      this.servers.set(name, serverInfo);
      console.log(
        `✓ Registered MCP server: ${name} with ${tools.length} tools`,
      );
    } catch (error) {
      console.error(`✗ Failed to register server ${name}:`, error);
      throw error;
    }
  }

  private async getServerTools(server: Server): Promise<Tool[]> {
    try {
      // Create a mock request to get tools
      const request = {
        method: 'tools/list' as const,
        params: {},
      };

      // Call the server's request handler
      const result = await server.request(request);
      return result.tools || [];
    } catch (error) {
      console.warn(`Could not get tools from server:`, error);
      return [];
    }
  }

  getServer(name: string): McpServerInfo | undefined {
    return this.servers.get(name);
  }

  getAllServers(): McpServerInfo[] {
    return Array.from(this.servers.values());
  }

  getAllTools(): Array<Tool & { serverName: string }> {
    const allTools: Array<Tool & { serverName: string }> = [];

    for (const [serverName, serverInfo] of this.servers) {
      for (const tool of serverInfo.tools) {
        allTools.push({
          ...tool,
          serverName,
        });
      }
    }

    return allTools;
  }

  async callTool(toolName: string, args: any): Promise<any> {
    // Find which server has this tool
    for (const [serverName, serverInfo] of this.servers) {
      const tool = serverInfo.tools.find((t) => t.name === toolName);
      if (tool) {
        try {
          const request = {
            method: 'tools/call' as const,
            params: {
              name: toolName,
              arguments: args,
            },
          };

          return await serverInfo.server.request(request);
        } catch (error) {
          console.error(
            `Error calling tool ${toolName} on server ${serverName}:`,
            error,
          );
          throw error;
        }
      }
    }

    throw new Error(`Tool not found: ${toolName}`);
  }

  getServerNames(): string[] {
    return Array.from(this.servers.keys());
  }

  unregisterServer(name: string): boolean {
    const removed = this.servers.delete(name);
    if (removed) {
      console.log(`✓ Unregistered MCP server: ${name}`);
    }
    return removed;
  }

  clear(): void {
    this.servers.clear();
    console.log('✓ Cleared all registered MCP servers');
  }

  getStats() {
    const serverCount = this.servers.size;
    const totalTools = this.getAllTools().length;

    return {
      serverCount,
      totalTools,
      servers: this.getAllServers().map((s) => ({
        name: s.name,
        version: s.version,
        toolCount: s.tools.length,
        tools: s.tools.map((t) => t.name),
      })),
    };
  }
}
