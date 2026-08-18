import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
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
  await symlink(path.join(parent, 'secret.txt'), path.join(root, 'leak.txt'));

  const server = await createArtifactServer({
    root,
    routes: {
      '/failure': () => {
        throw new Error('private stack marker');
      },
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
    const failure = await fetch(`${server.origin}/failure`);
    assert.equal(failure.status, 500);
    assert.equal(await failure.text(), 'Internal server error');

    const traversal = await fetch(`${server.origin}/%2e%2e%2fsecret.txt`);
    assert.equal(traversal.status, 403);
    const symlinkEscape = await fetch(`${server.origin}/leak.txt`);
    assert.equal(symlinkEscape.status, 404);
    assert.deepEqual(
      server.requests.map(({ path: requestPath, status }) => ({
        path: requestPath,
        status,
      })),
      [
        { path: '/artifact.json', status: 200 },
        { path: '/health', status: 200 },
        { path: '/failure', status: 500 },
        { path: '/../secret.txt', status: 403 },
        { path: '/leak.txt', status: 404 },
      ],
    );
  } finally {
    await server.close();
    await server.close();
    await rm(parent, { force: true, recursive: true });
  }

  await assert.rejects(fetch(`${server.origin}/artifact.json`));
});
