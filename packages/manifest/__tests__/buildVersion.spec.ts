/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

it.each(['webpack', 'rspack'])(
  '%s preserves release versions and advances dev revisions on each compilation',
  async (bundler) => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-build-version-'),
    );
    try {
      const result = await promisify(execFile)(
        process.execPath,
        [path.join(__dirname, 'fixtures/buildVersion.cjs'), bundler, directory],
        { timeout: 30000 },
      );
      const { versions, revisions, outputs, explicit, custom, production } =
        JSON.parse(result.stdout);
      expect(outputs).toEqual(['first', 'first', 'second']);
      expect(versions).toEqual(['1.0.0', '1.0.0', '1.0.0']);
      expect(Number(revisions[1])).toBeGreaterThan(Number(revisions[0]));
      expect(Number(revisions[2])).toBeGreaterThan(Number(revisions[1]));
      expect(explicit).toBe('release-42');
      expect(custom).toBe('custom-release');
      expect(production).toMatchObject({ buildVersion: '1.0.0' });
      expect(production).not.toHaveProperty('devRevision');
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  },
  35000,
);
