import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, it } from '@rstest/core';

it('loads the emitted shared fallback using the configured public path without async chunks', async () => {
  const root = path.resolve(__dirname, '../../../../..');
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [path.join(root, 'tools/repros/composed-shared-fallback.cjs')],
    {
      cwd: root,
      env: { ...process.env, MF_REPRO_LEGACY: '1' },
      timeout: 60000,
    },
  );
  expect(stdout).toContain('"value": "secondary-shared-fallback"');
  expect(stdout).toContain(
    '/independent-packages/shared_lib/1.0.0/share-entry.js',
  );
}, 60000);
