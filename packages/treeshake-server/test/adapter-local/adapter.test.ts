import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { LocalAdapter } from '@/adapters/local';

describe('LocalAdapter', () => {
  it('creates object store from env config', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'local-adapter-'));
    try {
      const adapter = new LocalAdapter();
      const config = adapter.fromEnv({
        LOCAL_STORE_DIR: tmp,
        LOCAL_STORE_BASE_URL: '/',
      });
      const { objectStore } = await adapter.create(config);

      const file = path.join(tmp, 'hello.txt');
      fs.writeFileSync(file, 'hello');

      const key = 'a/b/hello.txt';
      const port = process.env.PORT || 3000;
      assert.equal(await objectStore.exists(key), false);
      await objectStore.uploadFile(file, key);
      assert.equal(await objectStore.exists(key), true);
      assert.equal(
        objectStore.publicUrl(key),
        `http://localhost:${port}/${key}`,
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
