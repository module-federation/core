import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from '@rstest/core';

describe('runtime capability boundaries', () => {
  it('excludes share selection and semver from an unoptimized remote-only bundle', async () => {
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [path.join(__dirname, 'fixtures/remote-capability.cjs')],
      { timeout: 25_000 },
    );
    const result: { modules: string[]; runtimeName: string } =
      JSON.parse(stdout);
    const modules = result.modules.map((resource) =>
      resource.replace(/\\/g, '/'),
    );

    expect(result.runtimeName).toBe('remote-only-boundary');
    expect(
      modules.some((resource) => resource.endsWith('/remote/index.js')),
    ).toBe(true);
    expect(
      modules.filter((resource) =>
        /runtime-core\/dist\/(shared\/index\.|utils\/(share\.|semver\/))/.test(
          resource,
        ),
      ),
    ).toEqual([]);
  }, 30_000);
});
