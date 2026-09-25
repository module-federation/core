import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from '@rstest/core';

const execFileAsync = promisify(execFile);

describe('independently optimized runtimes', () => {
  it('loads a remote through full instances when a remote-disabled runtime registers last', async () => {
    const { stdout } = await execFileAsync(
      process.execPath,
      [path.resolve(__dirname, 'fixtures/optimized-runtimes.mjs')],
      { cwd: path.resolve(__dirname, '..') },
    );

    expect(JSON.parse(stdout)).toEqual({
      disabledError:
        'Remote loading is disabled by experiments.optimization.disableRemote.',
      createdValue: 'remote-value',
      initializedValue: 'remote-value',
      instanceNames: ['disabled-app', 'full-created', 'full-initialized'],
    });
  });
});
