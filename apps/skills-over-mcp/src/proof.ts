import { createHash } from 'node:crypto';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { startProviderAssetServer } from './provider-assets.ts';
import {
  GetSkillResultSchema,
  ListSkillsResultSchema,
} from './skills-schema.ts';

interface ProofResult {
  extension: unknown;
  skillNames: string[];
  resourceCount: number;
  toolProviders: string[];
  digestVerified: boolean;
  getMatchesList: boolean;
}

const gatewayPath = path.resolve(
  import.meta.dirname,
  '../dist/gateway/main.cjs',
);

const textFromToolResult = (
  result: Awaited<ReturnType<Client['callTool']>>,
) => {
  const block = result.content.find((item) => item.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error('Federated tool returned no text content');
  }
  return block.text;
};

export const runProof = async (): Promise<ProofResult> => {
  const assets = await startProviderAssetServer();
  const client = new Client({
    name: 'federated-skills-proof-client',
    version: '0.1.0',
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [gatewayPath],
    env: {
      SKILLS_PROVIDER_ORIGIN: assets.origin,
    },
  });

  try {
    await client.connect(transport);
    const capabilities = client.getServerCapabilities();
    const extension =
      capabilities?.extensions?.['io.modelcontextprotocol/skills'];
    const list = await client.request(
      { method: 'skills/list', params: {} },
      ListSkillsResultSchema,
    );
    const firstSkill = list.skills[0];
    if (!firstSkill) {
      throw new Error('Federated gateway returned no skills');
    }

    const get = await client.request(
      { method: 'skills/get', params: { uri: firstSkill.uri } },
      GetSkillResultSchema,
    );
    const read = await client.readResource({ uri: firstSkill.uri });
    const text = read.contents.find((item) => 'text' in item)?.text;
    if (!text) {
      throw new Error(`${firstSkill.uri} returned no text`);
    }
    const expectedDigest = firstSkill.resources.find(
      (resource) => resource.uri === firstSkill.uri,
    )?.digest;
    const actualDigest = `sha256:${createHash('sha256')
      .update(text)
      .digest('hex')}`;

    const resources = await client.listResources();
    const tools = await client.listTools();
    const toolProviders = await Promise.all(
      tools.tools.map(async (tool) => {
        const result = await client.callTool({ name: tool.name });
        const payload = JSON.parse(textFromToolResult(result)) as {
          providerId?: string;
        };
        return payload.providerId ?? 'unknown';
      }),
    );

    return {
      extension,
      skillNames: list.skills.map((skill) => skill.frontmatter.name),
      resourceCount: resources.resources.length,
      toolProviders,
      digestVerified: expectedDigest === actualDigest,
      getMatchesList: get.skill.uri === firstSkill.uri,
    };
  } finally {
    await client.close();
    await assets.close();
  }
};
