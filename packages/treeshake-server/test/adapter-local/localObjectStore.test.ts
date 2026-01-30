import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { LocalObjectStore } from '@/adapters/local';

describe('LocalObjectStore', () => {
  it('uploads and reports existence', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'local-store-'));
    try {
      const store = new LocalObjectStore({
        rootDir: tmp,
        publicBaseUrl: '/',
      });
      const file = path.join(tmp, 'hello.txt');
      fs.writeFileSync(file, 'hello');

      const key = 'a/b/hello.txt';
      assert.equal(await store.exists(key), false);
      await store.uploadFile(file, key);
      assert.equal(await store.exists(key), true);
      assert.equal(store.publicUrl(key), `/${key}`);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
