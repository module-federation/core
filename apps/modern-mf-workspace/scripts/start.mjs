import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';
import { createWorkspaceServer } from '../server/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  process.loadEnvFile(path.join(root, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await access(path.join(root, 'dist/html/index/index.html')).catch(() =>
  access(path.join(root, 'dist/index.html')),
);
const server = await createWorkspaceServer();
server.listen(4173, '127.0.0.1', () =>
  console.log('MF Workspace: http://127.0.0.1:4173/workbench'),
);
for (const event of ['SIGTERM', 'SIGINT'])
  process.on(event, () => server.close());
