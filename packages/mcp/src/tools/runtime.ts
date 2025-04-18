import fs from 'node:fs';
import path from 'node:path';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const registerRuntimeTool = (mcpServer: McpServer) => {
  mcpServer.tool(
    'query_module_federation_runtime',
    `Module federation(aka mf) runtime docs, it includes mf runtime api description and runtime hook . Use the docs to answer any questions users have about mf runtime usage.
     And users may ask:
      * How can i register new remotes?
      * Can i set shared in runtime?
      * How can i add plugin?
    `,
    async () => {
      const runtimeAPI = fs.readFileSync(
        path.resolve(__dirname, '../resources/runtime-api.md'),
        'utf-8',
      );
      const runtimeHooks = fs.readFileSync(
        path.resolve(__dirname, '../resources/runtime-hooks.md'),
        'utf-8',
      );
      return {
        content: [
          {
            type: 'text',
            text: `
            runtimeAPI: ${runtimeAPI}
            runtimeHooks: ${runtimeHooks}`,
          },
        ],
      };
    },
  );
};
