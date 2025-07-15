import { Server } from '@modelcontextprotocol/sdk/server/index';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'tools-server',
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
        name: 'run_command',
        description: 'Execute a shell command and return its output.',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The shell command to execute',
            },
            cwd: {
              type: 'string',
              description: 'Working directory for the command (optional)',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'process_info',
        description: 'Get information about the current Node.js process.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'environment_info',
        description: 'Get environment variables and system information.',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter pattern for environment variables',
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
    if (name === 'run_command') {
      const command = args.command as string;
      const cwd = args.cwd as string | undefined;

      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: cwd || process.cwd(),
          timeout: 30000, // 30 second timeout
        });

        return {
          content: [
            {
              type: 'text',
              text: `Command: ${command}\nOutput:\n${stdout}${stderr ? `\nErrors:\n${stderr}` : ''}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Command failed: ${command}\nError: ${error.message}\nStdout: ${error.stdout || ''}\nStderr: ${error.stderr || ''}`,
            },
          ],
          isError: true,
        };
      }
    } else if (name === 'process_info') {
      const info = {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        versions: process.versions,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    } else if (name === 'environment_info') {
      const filter = args.filter as string | undefined;
      let envVars = process.env;

      if (filter) {
        const regex = new RegExp(filter, 'i');
        envVars = Object.fromEntries(
          Object.entries(process.env).filter(([key]) => regex.test(key)),
        );
      }

      const info = {
        environment: envVars,
        argv: process.argv,
        execPath: process.execPath,
        execArgv: process.execArgv,
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

export function createToolsServer() {
  return server;
}

export default server;
