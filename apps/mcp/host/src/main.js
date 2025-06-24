import { McpRegistry } from './mcp-registry';
import { FederationLoader } from './federation-loader';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types';
// adding random async import so chunk loading stuff is added to bundler.
console.log(import('./noop'));
console.log('🚀 Main.js module loaded');

// Check if Federation Host is available and what remotes are configured
console.log('🔍 [DEBUG] Checking Federation Host configuration...');
if (typeof globalThis !== 'undefined' && globalThis.__FEDERATION__) {
  console.log(
    '🔍 [DEBUG] Federation instances:',
    globalThis.__FEDERATION__.__INSTANCES__?.length || 0,
  );
  if (
    globalThis.__FEDERATION__.__INSTANCES__ &&
    globalThis.__FEDERATION__.__INSTANCES__.length > 0
  ) {
    globalThis.__FEDERATION__.__INSTANCES__.forEach((instance, i) => {
      console.log(`🔍 [DEBUG] Instance ${i}:`, {
        name: instance.name,
        remotes: instance.options.remotes?.length || 0,
        remoteDetails:
          instance.options.remotes?.map((r) => ({
            name: r.name,
            entry: r.entry,
          })) || [],
      });
    });
  }
}
async function createMcpHost() {
  console.log('🏠 Starting MCP Host with Module Federation');

  // Create registry and loader
  const registry = new McpRegistry();
  const loader = new FederationLoader(registry);

  // Load remote servers
  await loader.loadRemoteServers();

  // Create unified MCP server
  const hostServer = new Server(
    {
      name: 'mcp-host',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Handle list tools - aggregate from all registered servers
  hostServer.setRequestHandler(ListToolsRequestSchema, async () => {
    const allTools = registry.getAllTools();
    return {
      tools: allTools.map((tool) => ({
        name: `${tool.serverName}.${tool.name}`,
        description: `[${tool.serverName.toUpperCase()}] ${tool.description}`,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle tool calls - route to appropriate server
  hostServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Parse server name and tool name
    const parts = name.split('.');
    if (parts.length !== 2) {
      throw new Error(`Invalid tool name format. Use: serverName.toolName`);
    }

    const [serverName, toolName] = parts;
    const serverInfo = registry.getServer(serverName);

    if (!serverInfo) {
      throw new Error(`Server not found: ${serverName}`);
    }

    try {
      return await registry.callTool(toolName, args);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error calling ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return { hostServer, registry, loader };
}

async function runDemo() {
  try {
    const { hostServer, registry, loader } = await createMcpHost();

    console.log('\n📊 MCP Host Statistics:');
    const stats = registry.getStats();
    console.log(JSON.stringify(stats, null, 2));

    console.log('\n🔧 Available Tools:');
    const tools = registry.getAllTools();
    tools.forEach((tool) => {
      console.log(`  • ${tool.serverName}.${tool.name} - ${tool.description}`);
    });

    console.log('\n🌐 Loaded Remotes:', loader.getLoadedRemotes());

    // Demo tool calls
    console.log('\n🧪 Running Demo Tool Calls...');

    try {
      // Test filesystem tools
      console.log('\n1. Testing Filesystem Tools:');
      const processInfo = await registry.callTool('process_info', {});
      console.log('Process Info:', JSON.stringify(processInfo, null, 2));
    } catch (error) {
      console.error('Filesystem demo failed:', error);
    }

    try {
      // Test database tools
      console.log('\n2. Testing Database Tools:');
      await registry.callTool('db_set', {
        key: 'demo',
        value: '{"message": "Hello from MCP Host!"}',
      });
      const dbGet = await registry.callTool('db_get', { key: 'demo' });
      console.log('Database Get:', JSON.stringify(dbGet, null, 2));
    } catch (error) {
      console.error('Database demo failed:', error);
    }

    try {
      // Test git tools
      console.log('\n3. Testing Git Tools:');
      const gitStatus = await registry.callTool('git_status', {
        path: process.cwd(),
      });
      console.log('Git Status:', JSON.stringify(gitStatus, null, 2));
    } catch (error) {
      console.error('Git demo failed:', error);
    }

    console.log('\n✅ MCP Host Demo Complete!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Export for Module Federation
export { createMcpHost, McpRegistry, FederationLoader };

// Always run demo when this module is loaded
runDemo().catch(console.error);
