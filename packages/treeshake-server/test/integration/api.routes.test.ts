import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import { serve } from '@hono/node-server';
import { createApp } from '../../src/app';
import type { ObjectStore } from '../../src/ports/objectStore';

const createStubStore = (): ObjectStore => {
  const uploaded = new Set<string>();
  return {
    async exists(key: string) {
      return uploaded.has(key);
    },
    async uploadFile(_localPath: string, key: string) {
      uploaded.add(key);
    },
    publicUrl(key: string) {
      return `https://example.invalid/${key.replace(/^\//, '')}`;
    },
  };
};

async function start() {
  const deps = { objectStore: createStubStore() };
  const app = createApp(deps, {
    pruneIntervalMs: 0,
    runtimeEnv: process.env,
  });
  const server = serve({
    fetch: app.fetch,
    port: 0,
    hostname: '127.0.0.1',
  }) as any;
  await new Promise((r) => server.on('listening', () => r(null)));
  const addr = server.address();
  const base = `http://${addr.address}:${addr.port}/tree-shaking-shared`;
  return {
    server,
    base,
  };
}

describe('api routes', () => {
  it('POST /build and /build/check-tree-shaking', async () => {
    const { server, base } = await start();
    try {
      const payload = {
        shared: [['antd', '6.1.0', ['Button']]],
        plugins: [],
        target: ['es2015'],
        libraryType: 'global',
        hostName: '@treeshake/shared-host',
      };
      const res1 = await fetch(`${base}/build`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(res1.ok, true);
      const j1 = (await res1.json()) as any;
      assert.ok(j1?.status === 'success' || j1?.status === 'failed');
      const res2 = await fetch(`${base}/build/check-tree-shaking`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(res2.ok, true);
      const j2 = (await res2.json()) as any;
      assert.ok(j2?.status === 'success' || j2?.status === 'failed');
    } finally {
      await new Promise((r) => server.close(() => r(null)));
    }
  });

  it('maintenance: POST /clean-cache', async () => {
    const { server, base } = await start();
    try {
      const res = await fetch(`${base}/clean-cache`, { method: 'POST' });
      assert.equal(res.ok, true);
      const j = (await res.json()) as any;
      assert.equal(j?.status, 'success');
      assert.equal(typeof j?.jobId, 'string');
      assert.equal(typeof j?.duration, 'number');
    } finally {
      await new Promise((r) => server.close(() => r(null)));
    }
  }, 30000);
});
