import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  registerQueryModuleFederationConfigTool,
  registerErrorTool,
  registerRuntimeTool,
  registerInspectTool,
} from './tools';

declare const __VERSION__: string;

export const runMCPServer = async () => {
  try {
    const transport = new StdioServerTransport();
    const server = new McpServer({
      name: 'module-federation-mcp-server',
      version: __VERSION__,
    });

    registerQueryModuleFederationConfigTool(server);
    registerErrorTool(server);
    registerRuntimeTool(server);
    registerInspectTool(server);

    await server.connect(transport);
    console.log('Module Federation MCP Server running on stdio');
  } catch (error) {
    console.error('Fatal error in main():', error);
    process.exit(1);
  }
};
