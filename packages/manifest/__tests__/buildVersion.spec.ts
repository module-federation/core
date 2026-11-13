/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

it.each(['webpack', 'rspack'])(
  '%s binds container identity to each dev compilation and preserves production version sources',
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
      const { versions, identities, outputs, explicit, custom, production } =
        JSON.parse(result.stdout);
      expect(outputs).toEqual(['first', 'first', 'second']);
      expect(Number(versions[1])).toBeGreaterThan(Number(versions[0]));
      expect(Number(versions[2])).toBeGreaterThan(Number(versions[1]));
      expect(identities).toEqual(
        versions.map((version) => `provider:${version}`),
      );
      expect(explicit).toBe('release-42');
      expect(custom).toBe('custom-release');
      expect(production).toMatchObject({ buildVersion: '1.0.0' });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  },
  35000,
);
