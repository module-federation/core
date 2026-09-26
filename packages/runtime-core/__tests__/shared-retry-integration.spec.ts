import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from '@rstest/core';

const execFileAsync = promisify(execFile);
const initialError = 'store request failed: 503';

async function runScenario(scenario: string) {
  const { stdout } = await execFileAsync(process.execPath, [
    path.resolve(__dirname, 'fixtures/shared-retry-integration.mjs'),
    scenario,
  ]);
  return JSON.parse(stdout);
}

const sharedAfterHostLoad = {
  localVersion: '1.0.0',
  remoteVersion: '1.0.0',
  localBefore: 1,
  remoteAfter: 2,
  localAfter: 2,
};

// The remote increments first. With one shared store, the host then reads 2.
const sharedDuringHostLoad = { remoteBefore: 1, localAfter: 2, remoteAfter: 2 };

describe('shared singleton across an HTTP-loaded webpack remote', () => {
  it('shares one store when the remote loads after the host', async () => {
    expect(await runScenario('loaded')).toEqual(sharedAfterHostLoad);
  });

  it('shares one store when the remote loads after the host retries', async () => {
    expect(await runScenario('retry-loaded')).toEqual({
      initialError,
      ...sharedAfterHostLoad,
    });
  });

  it('shares one store when the remote consumes during the initial load', async () => {
    expect(await runScenario('initial-pending')).toMatchObject(
      sharedDuringHostLoad,
    );
  });

  it('shares one store when the remote consumes during a retry', async () => {
    expect(await runScenario('retry-pending')).toMatchObject({
      initialError,
      ...sharedDuringHostLoad,
    });
  });
});
