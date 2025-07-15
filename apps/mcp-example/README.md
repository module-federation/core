# MCP Example with Module Federation

This example demonstrates how to build and host MCP (Model Context Protocol) servers using Module Federation.

## Structure

- **host/**: The main MCP host that loads and aggregates MCP servers
- **remote1/**: MCP servers for filesystem and tools
- **remote2/**: MCP servers for git and database operations

## Features

1. **Dynamic Loading**: MCP servers are loaded dynamically via Module Federation
2. **Tool Namespacing**: All tools are namespaced by server name to avoid conflicts
3. **Registry Pattern**: Centralized registry manages all loaded MCP servers
4. **Unified Interface**: Single host server aggregates all tools from multiple servers

## Architecture

```
┌─────────────────┐
│   MCP Host      │
│                 │
│  ┌───────────┐  │
│  │ Registry  │  │ ◄── Manages all MCP servers
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │Federation │  │ ◄── Loads remote servers
│  │  Loader   │  │
│  └───────────┘  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌────▼──┐  ┌──▼─────┐
│Remote1│  │Remote2 │
│       │  │        │
│ - fs  │  │ - git  │
│ - tools  │ - db   │
└───────┘  └────────┘
```

## Running the Example

1. Install dependencies:
```bash
pnpm install
```

2. Build all apps:
```bash
# Build remotes first
nx build mcp-example-remote1
nx build mcp-example-remote2

# Then build the host
nx build mcp-example-host
```

3. Start the remote servers:
```bash
# Terminal 1
nx serve mcp-example-remote1

# Terminal 2  
nx serve mcp-example-remote2
```

4. Run the host:
```bash
node apps/mcp-example/host/dist/main.js
```

## Available Tools

### Remote 1 - Filesystem & Tools
- `filesystem.read_file` - Read file contents
- `filesystem.write_file` - Write file contents
- `filesystem.list_directory` - List directory contents
- `tools.process_info` - Get process information
- `tools.system_info` - Get system information

### Remote 2 - Git & Database
- `git.git_status` - Get git repository status
- `git.git_log` - Get git commit history
- `database.db_get` - Get value from database
- `database.db_set` - Set value in database
- `database.db_list` - List all database keys

## Module Federation Configuration

The host loads MCP servers using Module Federation:

```javascript
remotes: {
  mcp_remote1: 'mcp_remote1@http://localhost:3030/remoteEntry.js',
  mcp_remote2: 'mcp_remote2@http://localhost:3031/remoteEntry.js',
}
```

Each remote exposes its MCP servers:

```javascript
exposes: {
  './filesystem': './src/filesystem-server.ts',
  './tools': './src/tools-server.ts',
}
```

## Creating Your Own MCP Server

1. Create a new server implementing the MCP protocol
2. Export a factory function that returns the server instance
3. Add it to a remote's exposes configuration
4. Update the federation loader to load your server

Example:
```typescript
export function createMyServer() {
  const server = new Server({
    name: 'my-server',
    version: '1.0.0',
  });
  
  // Add handlers...
  
  return server;
}
```

## Benefits

1. **Modularity**: Each MCP server can be developed and deployed independently
2. **Dynamic Loading**: Load only the servers you need at runtime
3. **Version Management**: Module Federation handles versioning and updates
4. **Tool Isolation**: Namespacing prevents conflicts between servers
5. **Scalability**: Easy to add new MCP servers without modifying the host