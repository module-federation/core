import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from '@rstest/core';

const execFileAsync = promisify(execFile);

async function runScenario(scenario: string) {
  const { stdout } = await execFileAsync(process.execPath, [
    path.resolve(__dirname, 'fixtures/shared-retry-integration.mjs'),
    scenario,
  ]);
  return JSON.parse(stdout);
}

describe('shared singleton state across an HTTP-loaded webpack remote', () => {
  for (const retry of [false, true]) {
    it(`preserves consumed state when the remote arrives${retry ? ' after recovery' : ''}`, async () => {
      expect(await runScenario(retry ? 'retry-loaded' : 'loaded')).toEqual({
        ...(retry ? { initialError: 'store request failed: 503' } : {}),
        localVersion: '1.0.0',
        remoteVersion: '1.0.0',
        localBefore: 1,
        remoteAfter: 2,
        localAfter: 2,
      });
    });

    it(`preserves one store when the remote consumes during a pending ${retry ? 'retry' : 'initial load'}`, async () => {
      const result = await runScenario(
        retry ? 'retry-pending' : 'initial-pending',
      );
      if (retry) {
        expect(result.initialError).toBe('store request failed: 503');
      }
      // The remote increments first. The host must see that state when its
      // pending load completes, and its increment must remain visible remotely.
      expect({
        remoteBefore: result.remoteBefore,
        localAfter: result.localAfter,
        remoteAfter: result.remoteAfter,
      }).toEqual({ remoteBefore: 1, localAfter: 2, remoteAfter: 2 });
    });
  }
});
