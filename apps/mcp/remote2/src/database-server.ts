import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types';

// Simple in-memory database simulation
interface DatabaseEntry {
  id: string;
  data: any;
  timestamp: string;
}

class SimpleDatabase {
  private data: Map<string, DatabaseEntry> = new Map();

  set(key: string, value: any): void {
    this.data.set(key, {
      id: key,
      data: value,
      timestamp: new Date().toISOString(),
    });
  }

  get(key: string): DatabaseEntry | undefined {
    return this.data.get(key);
  }

  list(): DatabaseEntry[] {
    return Array.from(this.data.values());
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}

const db = new SimpleDatabase();

const server = new Server(
  {
    name: 'database-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'db_set',
        description: 'Store a key-value pair in the database.',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The key to store the data under',
            },
            value: {
              type: 'string',
              description: 'The value to store (will be stored as JSON)',
            },
          },
          required: ['key', 'value'],
        },
      },
      {
        name: 'db_get',
        description: 'Retrieve a value from the database by key.',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The key to retrieve',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'db_list',
        description: 'List all entries in the database.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'db_delete',
        description: 'Delete an entry from the database.',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The key to delete',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'db_clear',
        description: 'Clear all entries from the database.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'db_info',
        description: 'Get information about the database.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'db_set') {
      const key = args.key as string;
      const value = args.value as string;

      try {
        // Try to parse as JSON, fallback to string
        const parsedValue = JSON.parse(value);
        db.set(key, parsedValue);
      } catch {
        db.set(key, value);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully stored data under key: ${key}`,
          },
        ],
      };
    } else if (name === 'db_get') {
      const key = args.key as string;
      const entry = db.get(key);

      if (!entry) {
        return {
          content: [
            {
              type: 'text',
              text: `Key not found: ${key}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(entry, null, 2),
          },
        ],
      };
    } else if (name === 'db_list') {
      const entries = db.list();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(entries, null, 2),
          },
        ],
      };
    } else if (name === 'db_delete') {
      const key = args.key as string;
      const deleted = db.delete(key);

      if (!deleted) {
        return {
          content: [
            {
              type: 'text',
              text: `Key not found: ${key}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully deleted key: ${key}`,
          },
        ],
      };
    } else if (name === 'db_clear') {
      db.clear();

      return {
        content: [
          {
            type: 'text',
            text: 'Database cleared successfully',
          },
        ],
      };
    } else if (name === 'db_info') {
      const info = {
        size: db.size(),
        keys: db.list().map((entry) => entry.id),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

export function createDatabaseServer() {
  return server;
}

export default server;
