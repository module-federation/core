import { McpRegistry } from './mcp-registry';
import { McpServerModule, RemoteConfig, McpServerMetadata } from './types';
import { Server } from '@modelcontextprotocol/sdk/server/index';

export class EnhancedFederationLoader {
  private registry: McpRegistry;
  private loadedModules: Map<string, McpServerModule> = new Map();

  constructor(registry: McpRegistry) {
    this.registry = registry;
  }

  async loadFromRemoteConfig(config: RemoteConfig): Promise<void> {
    console.log(`🔄 Loading MCP servers from ${config.name}...`);

    for (const [serverName, modulePath] of Object.entries(config.modules)) {
      try {
        await this.loadModule(config.name, serverName, modulePath);
      } catch (error) {
        console.error(
          `Failed to load ${serverName} from ${config.name}:`,
          error,
        );
      }
    }
  }

  private async loadModule(
    remoteName: string,
    serverName: string,
    modulePath: string,
  ): Promise<void> {
    try {
      // Dynamic import using Module Federation
      const moduleId = `${remoteName}${modulePath}`;
      console.log(`  Loading module: ${moduleId}`);

      const module = (await import(moduleId)) as McpServerModule;
      this.loadedModules.set(serverName, module);

      // Extract server instance
      const server = await this.extractServer(module, serverName);
      if (!server) {
        throw new Error(`No server found in module ${moduleId}`);
      }

      // Extract metadata
      const metadata = this.extractMetadata(module, serverName);

      // Register with enhanced metadata
      await this.registry.registerServer(serverName, server);

      console.log(`  ✓ Loaded ${serverName} (${metadata.version})`);
    } catch (error) {
      console.error(`  ✗ Failed to load ${serverName}:`, error);
      throw error;
    }
  }

  private async extractServer(
    module: McpServerModule,
    serverName: string,
  ): Promise<Server | null> {
    // Try different patterns to find the server

    // 1. Direct server export
    if (module.server instanceof Server) {
      return module.server;
    }

    // 2. Factory function (createServer or default)
    const factory = module.createServer || module.default;
    if (typeof factory === 'function') {
      const result = await factory();
      if (result instanceof Server) {
        return result;
      }
    }

    // 3. Default export that is a server
    if (module.default instanceof Server) {
      return module.default;
    }

    // 4. Look for any function that might create a server
    for (const [key, value] of Object.entries(module)) {
      if (typeof value === 'function' && key.toLowerCase().includes('server')) {
        try {
          const result = await value();
          if (result instanceof Server) {
            return result;
          }
        } catch {
          // Continue searching
        }
      }
    }

    return null;
  }

  private extractMetadata(
    module: McpServerModule,
    serverName: string,
  ): McpServerMetadata {
    // Use provided metadata or create default
    return (
      module.metadata || {
        name: serverName,
        version: '1.0.0',
        description: `MCP server: ${serverName}`,
      }
    );
  }

  async reloadModule(serverName: string): Promise<void> {
    const module = this.loadedModules.get(serverName);
    if (!module) {
      throw new Error(`Module ${serverName} not found`);
    }

    // Unregister existing
    this.registry.unregisterServer(serverName);

    // Reload
    const server = await this.extractServer(module, serverName);
    if (server) {
      await this.registry.registerServer(serverName, server);
    }
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys());
  }

  getModuleMetadata(serverName: string): McpServerMetadata | undefined {
    const module = this.loadedModules.get(serverName);
    return module ? this.extractMetadata(module, serverName) : undefined;
  }
}
