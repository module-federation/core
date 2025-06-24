import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types';

export class McpRegistry {
  constructor() {
    this.servers = new Map();
  }

  async registerServer(name, server) {
    try {
      // Get server info and tools
      const tools = await this.getServerTools(server);

      const serverInfo = {
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

  async getServerTools(server) {
    try {
      // Instead of using server.request(), directly call the tools/list handler
      // since the server may not be connected to a transport

      // Access the server's internal request handlers
      const requestHandlers = server._requestHandlers || server.requestHandlers;

      if (requestHandlers && requestHandlers.has('tools/list')) {
        const handler = requestHandlers.get('tools/list');
        const result = await handler({
          method: 'tools/list',
          params: {},
        });
        return result.tools || [];
      } else {
        console.warn('No tools/list handler found on server');
        return [];
      }
    } catch (error) {
      console.warn(`Could not get tools from server:`, error);
      return [];
    }
  }

  getServer(name) {
    return this.servers.get(name);
  }

  getAllServers() {
    return Array.from(this.servers.values());
  }

  getAllTools() {
    const allTools = [];

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

  async callTool(toolName, args) {
    // Find which server has this tool
    for (const [serverName, serverInfo] of this.servers) {
      const tool = serverInfo.tools.find((t) => t.name === toolName);
      if (tool) {
        try {
          const request = {
            method: 'tools/call',
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

  getServerNames() {
    return Array.from(this.servers.keys());
  }

  unregisterServer(name) {
    const removed = this.servers.delete(name);
    if (removed) {
      console.log(`✓ Unregistered MCP server: ${name}`);
    }
    return removed;
  }

  clear() {
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
