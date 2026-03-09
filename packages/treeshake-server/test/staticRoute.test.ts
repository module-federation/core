import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createStaticRoute } from '../src/http/routes/static';

describe('staticRoute', () => {
  it('serves tree-shaking-shared files from root', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'static-root-'));
    try {
      const fileRelUrl = 'tree-shaking-shared/v0-test/file.js';
      const filePath = path.join(
        tmp,
        'tree-shaking-shared',
        'v0-test',
        'file.js',
      );
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, "console.log('ok');");

      const app = createStaticRoute({ rootDir: tmp });
      const res = await app.fetch(
        new Request(`http://localhost/${fileRelUrl}`),
      );
      assert.equal(res.status, 200);
      const body = await res.text();
      assert.ok(body.includes('console.log'));
      assert.equal(res.headers.get('content-type'), 'application/javascript');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('rejects path traversal attempts', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'static-root-'));
    try {
      const app = createStaticRoute({ rootDir: tmp });
      const res = await app.fetch(
        new Request('http://localhost/tree-shaking-shared/../../etc/passwd'),
      );
      assert.equal(res.status, 404);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
