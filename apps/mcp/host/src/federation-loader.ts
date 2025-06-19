import { McpRegistry } from './mcp-registry';

export class FederationLoader {
  private registry: McpRegistry;

  constructor(registry: McpRegistry) {
    this.registry = registry;
  }

  async loadRemoteServers(): Promise<void> {
    console.log('🚀 Loading remote MCP servers via Module Federation...');

    try {
      // Load Remote 1 servers (filesystem and tools)
      await this.loadRemote1Servers();

      // Load Remote 2 servers (git and database)
      await this.loadRemote2Servers();

      console.log('✓ All remote servers loaded successfully');
    } catch (error) {
      console.error('✗ Failed to load remote servers:', error);
      throw error;
    }
  }

  private async loadRemote1Servers(): Promise<void> {
    try {
      console.log('Loading MCP Remote 1 (filesystem & tools)...');

      // Import the remote module
      const remote1 = await import('mcp_remote1/filesystem');
      const remote1Tools = await import('mcp_remote1/tools');

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

  private async loadRemote2Servers(): Promise<void> {
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

  async reloadRemoteServer(remoteName: string): Promise<void> {
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

  getLoadedRemotes(): string[] {
    const servers = this.registry.getServerNames();
    const remotes: string[] = [];

    if (servers.includes('filesystem') || servers.includes('tools')) {
      remotes.push('remote1');
    }

    if (servers.includes('git') || servers.includes('database')) {
      remotes.push('remote2');
    }

    return remotes;
  }
}
