import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createArtifactServer } from './artifact-server.mjs';

test('serves rooted artifacts, dynamic routes, and request traces', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'lynx-artifacts-'));
  const root = path.join(parent, 'public');
  await mkdir(root);
  await writeFile(path.join(root, 'artifact.json'), '{"ready":true}');
  await writeFile(path.join(parent, 'secret.txt'), 'secret');

  const server = await createArtifactServer({
    root,
    routes: {
      '/health': (_request, response) => {
        response.writeHead(200, { 'content-type': 'text/plain' });
        response.end('ready');
      },
    },
  });

  try {
    const artifact = await server.waitFor('/artifact.json', 1_000);
    assert.deepEqual(await artifact.json(), { ready: true });
    assert.equal(
      await (await fetch(`${server.origin}/health`)).text(),
      'ready',
    );

    const traversal = await fetch(`${server.origin}/%2e%2e%2fsecret.txt`);
    assert.equal(traversal.status, 403);
    assert.deepEqual(
      server.requests.map(({ path: requestPath, status }) => ({
        path: requestPath,
        status,
      })),
      [
        { path: '/artifact.json', status: 200 },
        { path: '/health', status: 200 },
        { path: '/../secret.txt', status: 403 },
      ],
    );
  } finally {
    await server.close();
    await server.close();
    await rm(parent, { force: true, recursive: true });
  }

  await assert.rejects(fetch(`${server.origin}/artifact.json`));
});
