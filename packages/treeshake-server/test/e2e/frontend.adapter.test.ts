import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';

import type { ObjectStore } from '@/ports/objectStore';
import type { FrontendAdapter } from '@/frontend/types';
import { createApp } from '@/app';
import { createServer } from '@/nodeServer';

const createStubStore = (): ObjectStore => ({
  exists: async () => false,
  uploadFile: async () => {},
  publicUrl: (key: string) => `/${key.replace(/^\//, '')}`,
});

describe('frontend adapter (e2e)', () => {
  it('registers a frontend route on the server', async () => {
    const adapter: FrontendAdapter = {
      id: 'test-frontend',
      register(app) {
        app.get('/frontend-test', (c) => c.text('ok'));
      },
    };

    const app = createApp(
      { objectStore: createStubStore() },
      { frontendAdapters: [adapter], pruneIntervalMs: 0 },
    );
    const server = createServer({ app, port: 0, hostname: '127.0.0.1' });
    await new Promise((resolve) => server.on('listening', () => resolve(null)));

    try {
      const address = server.address();
      const port =
        typeof address === 'string'
          ? Number(address.split(':').pop())
          : address?.port;
      assert.ok(port);
      const res = await fetch(`http://127.0.0.1:${port}/frontend-test`);
      assert.equal(res.status, 200);
      const text = await res.text();
      assert.equal(text, 'ok');
    } finally {
      await new Promise((resolve) => server.close(() => resolve(null)));
    }
  });
});
