import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { FederatedSkillsCatalog } from './catalog.ts';
import { loadFederatedContributions } from './load-contributions.ts';
import { createSkillsMcpServer } from './mcp-server.ts';

const providerOrigin =
  process.env.SKILLS_PROVIDER_ORIGIN ?? 'http://127.0.0.1:43110';
const contributions = await loadFederatedContributions(providerOrigin);
const catalog = new FederatedSkillsCatalog(contributions);

serveStdio(() => createSkillsMcpServer(catalog));
