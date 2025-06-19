import { Server } from '@modelcontextprotocol/sdk/server/index';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types';
import { promises as fs } from 'fs';
import * as path from 'path';

const server = new Server(
  {
    name: 'filesystem-server',
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
        name: 'read_file',
        description:
          'Read the complete contents of a file from the filesystem. Use this when you need to examine the contents of a single file.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Absolute or relative path to the file to read',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description:
          'Create a new file or completely overwrite an existing file with new content.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description:
                'Absolute or relative path where the file should be created/written',
            },
            content: {
              type: 'string',
              description: 'The complete content to write to the file',
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'list_directory',
        description:
          'Get a detailed listing of all files and directories in a specified path.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description:
                'Absolute or relative path to the directory to list (default: current directory)',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'read_file') {
      const filePath = args.path as string;
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: content,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to read file: ${error}`);
      }
    } else if (name === 'write_file') {
      const filePath = args.path as string;
      const content = args.content as string;

      try {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });

        await fs.writeFile(filePath, content, 'utf-8');
        return {
          content: [
            {
              type: 'text',
              text: `Successfully wrote ${content.length} characters to ${filePath}`,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
      }
    } else if (name === 'list_directory') {
      const dirPath = (args.path as string) || '.';

      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const items = await Promise.all(
          entries.map(async (entry) => {
            const fullPath = path.join(dirPath, entry.name);
            const stats = await fs.stat(fullPath);
            return {
              name: entry.name,
              type: entry.isDirectory() ? 'directory' : 'file',
              size: stats.size,
              modified: stats.mtime.toISOString(),
            };
          }),
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(items, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to list directory: ${error}`);
      }
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

export function createFilesystemServer() {
  return server;
}

export default server;
