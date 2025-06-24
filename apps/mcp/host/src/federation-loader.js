import { McpRegistry } from './mcp-registry';
// import MCP1 from 'mcp_remote1/filesystem'
// console.log('MCP1', MCP1);
export class FederationLoader {
  constructor(registry) {
    this.registry = registry;
  }

  async loadRemoteServers() {
    console.log('🚀 Loading remote MCP servers via Module Federation...');

    // Debug: Check federation configuration before loading
    console.log('🔍 [DEBUG] Federation state before loading remotes:');
    if (typeof globalThis !== 'undefined' && globalThis.__FEDERATION__) {
      console.log(
        '🔍 [DEBUG] Federation instances available:',
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
            remoteNames: instance.options.remotes?.map((r) => r.name) || [],
          });
        });
      }
    }

    // Remotes should now be automatically registered by the ModuleFederationPlugin

    // Load Remote 1 servers (filesystem and tools)
    await this.loadRemote1Servers();

    // Load Remote 2 servers (git and database)
    await this.loadRemote2Servers();
  }

  async registerRemotes() {
    console.log('🔧 [DEBUG] Manually registering remotes...');

    // Get the Federation Host instance
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.__FEDERATION__?.__INSTANCES__?.[0]
    ) {
      const hostInstance = globalThis.__FEDERATION__.__INSTANCES__[0];

      // Define the remotes configuration that matches webpack.config.js
      const remotes = [
        {
          name: 'mcp_remote1',
          entry: 'http://localhost:3030/remoteEntry.js',
          type: 'script',
        },
        {
          name: 'mcp_remote2',
          entry: 'http://localhost:3031/remoteEntry.js',
          type: 'script',
        },
      ];

      // Register each remote
      remotes.forEach((remote) => {
        console.log(
          `🔧 [DEBUG] Registering remote: ${remote.name} at ${remote.entry}`,
        );
        hostInstance.remoteHandler.registerRemote(
          remote,
          hostInstance.options.remotes,
        );
      });

      console.log(
        '🔧 [DEBUG] Remotes registered. New count:',
        hostInstance.options.remotes.length,
      );
      console.log(
        '🔧 [DEBUG] Registered remotes:',
        hostInstance.options.remotes.map((r) => ({
          name: r.name,
          entry: r.entry,
        })),
      );
    } else {
      console.error(
        '❌ [DEBUG] Could not find Federation Host instance to register remotes',
      );
    }
  }

  async loadRemote1Servers() {
    try {
      console.log('Loading MCP Remote 1 (filesystem & tools)...');

      // Import the remote module
      const remote1 = await import('mcp_remote1/filesystem');
      const remote1Tools = await import('mcp_remote1/tools');
      debugger;
      // Create and register the servers
      if (remote1.createFilesystemServer) {
        const fsServer = remote1.createFilesystemServer();
        await this.registry.registerServer('filesystem', fsServer);
      }

      if (remote1Tools.createToolsServer) {
        const toolsServer = remote1Tools.createToolsServer();
        await this.registry.registerServer('tools', toolsServer);
      }

      console.log('✓ Remote 1 servers loaded');
    } catch (error) {
      console.error('✗ Failed to load Remote 1:', error);
      // Don't throw - continue with other remotes
    }
  }

  async loadRemote2Servers() {
    try {
      console.log('Loading MCP Remote 2 (git & database)...');

      // Import the remote module
      const remote2Git = await import('mcp_remote2/git');
      const remote2Db = await import('mcp_remote2/database');

      // Create and register the servers
      if (remote2Git.createGitServer) {
        const gitServer = remote2Git.createGitServer();
        await this.registry.registerServer('git', gitServer);
      }

      if (remote2Db.createDatabaseServer) {
        const dbServer = remote2Db.createDatabaseServer();
        await this.registry.registerServer('database', dbServer);
      }

      console.log('✓ Remote 2 servers loaded');
    } catch (error) {
      console.error('✗ Failed to load Remote 2:', error);
      // Don't throw - continue with other remotes
    }
  }

  async reloadRemoteServer(remoteName) {
    console.log(`🔄 Reloading remote server: ${remoteName}`);

    if (remoteName === 'remote1') {
      // Unregister existing servers
      this.registry.unregisterServer('filesystem');
      this.registry.unregisterServer('tools');

      // Reload
      await this.loadRemote1Servers();
    } else if (remoteName === 'remote2') {
      // Unregister existing servers
      this.registry.unregisterServer('git');
      this.registry.unregisterServer('database');

      // Reload
      await this.loadRemote2Servers();
    } else {
      throw new Error(`Unknown remote: ${remoteName}`);
    }

    console.log(`✓ Remote server ${remoteName} reloaded`);
  }

  getLoadedRemotes() {
    const servers = this.registry.getServerNames();
    const remotes = [];

    if (servers.includes('filesystem') || servers.includes('tools')) {
      remotes.push('remote1');
    }

    if (servers.includes('git') || servers.includes('database')) {
      remotes.push('remote2');
    }

    return remotes;
  }
}
