import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const registerErrorTool = (mcpServer: McpServer) => {
  mcpServer.tool(
    'get_module_federation_errors_solution',
    `For specify error-code error , give the solutions, others advise users to search on internet or open an issue.
    `,
    {
      errorCode: z
        .string()
        .describe(
          'The specify error code , it it starts with #, eg: #BUILD-001, remove "#"',
        ),
    },
    async ({ errorCode }) => {
      let errorCodeSolution = '';
      try {
        errorCodeSolution = fs.readFileSync(
          path.resolve(__dirname, `../resources/${errorCode}.md`),
          'utf-8',
        );
      } catch (e) {
        return {
          content: [
            {
              type: 'text',
              text: `Invalid error code.`,
            },
          ],
        };
      }

      const enableAsyncEntry = fs.readFileSync(
        path.resolve(__dirname, '../resources/enable-async-entry.md'),
        'utf-8',
      );

      return {
        content: [
          {
            type: 'text',
            text: `
            ${['RUNTIME-004', 'RUNTIME-005'].includes(errorCode) ? enableAsyncEntry : ''}
            errorCodeSolution: ${errorCodeSolution}`,
          },
        ],
      };
    },
  );
};
