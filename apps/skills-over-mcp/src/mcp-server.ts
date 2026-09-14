import {
  McpServer,
  ProtocolError,
  ProtocolErrorCode,
} from '@modelcontextprotocol/server';
import { FederatedSkillsCatalog } from './catalog.ts';
import {
  GetSkillParamsSchema,
  GetSkillResultSchema,
  ListSkillsParamsSchema,
  ListSkillsResultSchema,
} from './skills-schema.ts';

const CACHE_TTL_MS = 300_000;

export const createSkillsMcpServer = (
  catalog: FederatedSkillsCatalog,
): McpServer => {
  const server = new McpServer({
    name: 'federated-skills-gateway',
    version: '0.1.0',
  });

  server.server.registerCapabilities({
    extensions: {
      'io.modelcontextprotocol/skills': {
        directoryRead: false,
      },
    },
  });

  server.server.setRequestHandler(
    'skills/list',
    { params: ListSkillsParamsSchema, result: ListSkillsResultSchema },
    async () => ({
      skills: catalog.skills,
      ttlMs: CACHE_TTL_MS,
      cacheScope: 'public' as const,
    }),
  );

  server.server.setRequestHandler(
    'skills/get',
    { params: GetSkillParamsSchema, result: GetSkillResultSchema },
    async ({ uri }) => {
      const skill = catalog.getSkill(uri);
      if (!skill) {
        throw new ProtocolError(
          ProtocolErrorCode.InvalidParams,
          `Unknown skill URI: ${uri}`,
        );
      }
      return {
        skill,
        ttlMs: CACHE_TTL_MS,
        cacheScope: 'public' as const,
      };
    },
  );

  for (const resource of catalog.resources) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        mimeType: resource.mimeType,
        cacheHint: {
          ttlMs: CACHE_TTL_MS,
          cacheScope: 'public',
        },
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: resource.mimeType,
            text: resource.text,
          },
        ],
      }),
    );
  }

  for (const tool of catalog.tools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        annotations: {
          readOnlyHint: true,
        },
      },
      async () => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(await tool.run()),
          },
        ],
      }),
    );
  }

  return server;
};
