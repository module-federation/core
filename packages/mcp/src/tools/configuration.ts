import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const registerQueryModuleFederationConfigTool = (
  mcpServer: McpServer,
) => {
  // FIXME: merge existed configuration
  mcpServer.tool(
    'quickstart_mf',
    ` According below docs, get the basic Module Federation(aka mf) config to help users quickly experience mf abilities.`,
    {
      filepath: z
        .string()
        .optional()
        .describe(
          'The absolute filepath of the module federation configuration',
        ),
    },
    async ({ filepath }) => {
      const buildPlugins = fs.readFileSync(
        path.resolve(__dirname, '../resources/build-plugins.md'),
        'utf-8',
      );
      const content = fs.readFileSync(
        path.resolve(__dirname, '../resources/quickstart.md'),
        'utf-8',
      );

      return {
        content: [
          {
            type: 'text',
            text: ` filepath=${filepath}
          buildPlugins: ${buildPlugins}
          ${content}`,
          },
        ],
      };
    },
  );

  mcpServer.tool(
    'query_module_federation_config',
    `Module federation(aka mf) configuration schema, it lists whole mf configuration. Use this schema to answer any questions users have about mf config.
     If user asks context include 'module-federation' / 'mf' 'ModuleFederation' , it usually means the configuration is mf config.
     And users may ask:
      * What is the purpose of this file configuration?
      * What is the use of shared/remotes/exposes?
      * How can I add runtimePlugins?
    `,
    {
      runtimePlugins: z
        .boolean()
        .describe(
          'Is this inquiry involved `runtimePlugins`? If yes, pass true, otherwise false',
        ),
      filepath: z
        .string()
        .optional()
        .describe(
          'The absolute filepath of the module federation configuration',
        ),
    },
    async ({ runtimePlugins, filepath }) => {
      const schema = fs.readFileSync(
        path.resolve(__dirname, '../resources/module-federation-plugin.json'),
        'utf-8',
      );
      const runtimeHooks = fs.readFileSync(
        path.resolve(__dirname, '../resources/runtime-hooks.md'),
        'utf-8',
      );
      const buildPlugins = fs.readFileSync(
        path.resolve(__dirname, '../resources/build-plugins.md'),
        'utf-8',
      );
      return {
        content: [
          {
            type: 'text',
            text: `
            ${runtimePlugins ? 'runtimeHooks doc:' + runtimeHooks : ''}
            ${filepath ? '' : 'import plugins from ' + buildPlugins}
            ModuleFederationPlugin.json: ${schema}`,
          },
        ],
      };
    },
  );

  mcpServer.tool(
    'optimize_mf_config',
    'Optimize Module Federation configuration based on existing mf and framework configurations.',
    {
      existingMfConfig: z
        .any()
        .describe('Existing Module Federation configuration'),
      frameworkConfig: z.any().describe('Framework or bundler configuration'),
    },
    async ({ existingMfConfig, frameworkConfig }) => {
      const optimization = fs.readFileSync(
        path.resolve(__dirname, '../resources/optimize-configuration.md'),
        'utf-8',
      );

      return {
        content: [
          {
            type: 'text',
            text: `
            existingMfConfig: ${existingMfConfig}
            frameworkConfig: ${frameworkConfig}
            ${optimization}
            `,
          },
        ],
      };
    },
  );
};
