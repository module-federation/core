/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

it.each(['webpack', 'rspack'])(
  '%s identifies actual builds with fixed package versions and output names',
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
      const { versions, outputs, explicit, custom } = JSON.parse(result.stdout);
      expect(outputs).toEqual(['first', 'first', 'second']);
      expect(versions[0]).toBeTruthy();
      expect(versions[0]).not.toBe('1.0.0');
      expect(versions[1]).toBe(versions[0]);
      expect(versions[2]).not.toBe(versions[0]);
      expect(explicit).toBe('release-42');
      expect(custom).toBe('custom-release');
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  },
  35000,
);
