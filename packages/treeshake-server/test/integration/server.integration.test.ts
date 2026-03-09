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

async function startServer() {
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

describe('server integration', () => {
  it('responds to check-tree-shaking with stub adapter', async () => {
    const { server, base } = await startServer();
    try {
      const payload = {
        shared: [['antd', '6.1.0', ['Button']]],
        plugins: [],
        target: ['es2015'],
        libraryType: 'global',
        hostName: '@treeshake/shared-host',
      };
      const res = await fetch(`${base}/build/check-tree-shaking`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(res.ok, true);
      const json = (await res.json()) as any;
      assert.ok(json?.status === 'success' || json?.status === 'failed');
      if (json?.status === 'success') {
        const url = String(json?.data?.[0]?.cdnUrl || '');
        assert.ok(url.startsWith('https://example.invalid/'));
        assert.ok(url.includes('/tree-shaking-shared/'));
      }
    } finally {
      await new Promise((r) => server.close(() => r(null)));
    }
  });
});
