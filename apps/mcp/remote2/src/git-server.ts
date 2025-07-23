import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const server = new Server(
  {
    name: 'git-server',
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
        name: 'git_status',
        description: 'Get the current git status of the repository.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description:
                'Path to the git repository (optional, defaults to current directory)',
            },
          },
        },
      },
      {
        name: 'git_log',
        description: 'Get git commit history.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the git repository (optional)',
            },
            limit: {
              type: 'number',
              description: 'Number of commits to retrieve (default: 10)',
            },
            oneline: {
              type: 'boolean',
              description: 'Show compact one-line format',
            },
          },
        },
      },
      {
        name: 'git_diff',
        description: 'Show git diff for staged or unstaged changes.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the git repository (optional)',
            },
            staged: {
              type: 'boolean',
              description: 'Show staged changes (--cached)',
            },
            file: {
              type: 'string',
              description: 'Specific file to diff (optional)',
            },
          },
        },
      },
      {
        name: 'git_branch',
        description: 'List or manage git branches.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the git repository (optional)',
            },
            all: {
              type: 'boolean',
              description: 'Show all branches including remote',
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
    const cwd = (args.path as string) || process.cwd();

    if (name === 'git_status') {
      try {
        const { stdout } = await execAsync('git status --porcelain', { cwd });
        const { stdout: branch } = await execAsync(
          'git branch --show-current',
          { cwd },
        );

        return {
          content: [
            {
              type: 'text',
              text: `Current branch: ${branch.trim()}\n\nStatus:\n${stdout || 'Working tree clean'}`,
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Git status failed: ${error.message}`);
      }
    } else if (name === 'git_log') {
      const limit = (args.limit as number) || 10;
      const oneline = args.oneline as boolean;
      const format = oneline
        ? '--oneline'
        : '--pretty=format:"%h - %an, %ar : %s"';

      try {
        const { stdout } = await execAsync(`git log ${format} -${limit}`, {
          cwd,
        });

        return {
          content: [
            {
              type: 'text',
              text: stdout || 'No commits found',
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Git log failed: ${error.message}`);
      }
    } else if (name === 'git_diff') {
      const staged = args.staged as boolean;
      const file = args.file as string;
      const stagedFlag = staged ? '--cached' : '';
      const fileArg = file ? ` -- ${file}` : '';

      try {
        const { stdout } = await execAsync(`git diff ${stagedFlag}${fileArg}`, {
          cwd,
        });

        return {
          content: [
            {
              type: 'text',
              text: stdout || 'No differences found',
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Git diff failed: ${error.message}`);
      }
    } else if (name === 'git_branch') {
      const all = args.all as boolean;
      const allFlag = all ? '-a' : '';

      try {
        const { stdout } = await execAsync(`git branch ${allFlag}`, { cwd });

        return {
          content: [
            {
              type: 'text',
              text: stdout || 'No branches found',
            },
          ],
        };
      } catch (error: any) {
        throw new Error(`Git branch failed: ${error.message}`);
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

export function createGitServer() {
  return server;
}

export default server;
