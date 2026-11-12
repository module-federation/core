/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getCompilationBuildVersion } from '../src/buildVersion';

it('freezes one compilation independently of later provider changes and other compilers', () => {
  let version = 'first';
  const read = jest.fn(() => version);
  const first = {};
  expect(getCompilationBuildVersion(first, read)).toBe('first');
  version = 'second';
  expect(getCompilationBuildVersion(first, read)).toBe('first');
  expect(getCompilationBuildVersion({}, read)).toBe('second');
  expect(read).toHaveBeenCalledTimes(2);
  expect(getCompilationBuildVersion({}, undefined)).toBeUndefined();
  expect(() => getCompilationBuildVersion({}, () => '')).toThrow(
    'non-empty string',
  );
});

it.each(['webpack', 'rspack'])(
  '%s updates the runtime identity while reusing cached modules',
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
      expect(JSON.parse(result.stdout)).toEqual({
        outputs: ['provider:first', 'provider:second'],
        snapshots: ['first', 'second'],
        rebuilt: 0,
      });
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  },
  35000,
);
