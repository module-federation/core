import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from '@rstest/core';

const execFileAsync = promisify(execFile);
const remoteDisabledError =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

async function runScenario(scenario: string) {
  const { stdout } = await execFileAsync(
    process.execPath,
    [path.resolve(__dirname, 'fixtures/optimized-runtimes.mjs'), scenario],
    { cwd: path.resolve(__dirname, '..') },
  );
  return JSON.parse(stdout);
}

describe('independently optimized runtimes', () => {
  it('loads a remote through full instances when a remote-disabled runtime registers last', async () => {
    expect(await runScenario('distinct-last-disabled')).toEqual({
      disabledError: remoteDisabledError,
      createdValue: 'remote-value',
      initializedValue: 'remote-value',
      moduleValue: 'remote-value',
      instanceNames: ['disabled-app', 'full-created', 'full-initialized'],
    });
  });

  it('keeps both capabilities when the full runtime registers last', async () => {
    expect(await runScenario('distinct-last-full')).toEqual({
      fullValue: 'remote-value',
      fullModuleValue: 'remote-value',
      disabledError: remoteDisabledError,
      disabledModuleError: remoteDisabledError,
      instanceNames: ['full-app', 'disabled-app'],
    });
  });

  it('keeps same-name apps separate when their configured app versions differ', async () => {
    expect(await runScenario('version-isolated')).toEqual({
      disabledError: remoteDisabledError,
      fullValue: 'remote-value',
      fullModuleValue: 'remote-value',
      versions: ['1.0.0', '2.0.0'],
    });
  });

  it('preserves shared state across compatible bundles while createInstance stays fresh', async () => {
    expect(await runScenario('compatible-reuse')).toEqual({
      firstValue: 'remote-value',
      repeatedValue: 'remote-value',
      moduleValue: 'remote-value',
      compatibleModuleValue: 'remote-value',
      freshValue: 'remote-value',
      sharedValue: 'shared-value',
      instanceCount: 2,
    });
  });

  for (const [scenario, registeredIds] of [
    ['collision-different-build', ['app@1.0.0', 'app@2.0.0']],
    ['collision-same-build', ['app@1.0.0', 'app@1.0.0']],
    ['collision-remote-without-snapshot', ['app@1.0.0', 'app@1.0.0']],
  ] as const) {
    it(`skips incompatible instances with ${scenario}`, async () => {
      expect(await runScenario(scenario)).toEqual({
        disabledError: remoteDisabledError,
        fullValue: 'remote-value',
        fullModuleValue: 'remote-value',
        repeatedValue: 'remote-value',
        registeredIds,
      });
    });
  }

  it('keeps the disabled runtime disabled when the full instance registers first', async () => {
    expect(await runScenario('collision-full-first')).toEqual({
      fullValue: 'remote-value',
      disabledError: remoteDisabledError,
      disabledModuleError: remoteDisabledError,
      registeredIds: ['app@2.0.0', 'app@1.0.0'],
    });
  });

  it('keeps shared loading when a same-name instance disables sharing', async () => {
    expect(await runScenario('collision-shared')).toEqual({
      disabledError:
        'Shared dependency loading is disabled by experiments.optimization.disableShared.',
      sharedValue: 'shared-value',
      fullValue: 'remote-value',
    });
  });

  it('keeps a Node runtime separate from a same-identity web runtime', async () => {
    expect(await runScenario('collision-target')).toEqual({
      separate: true,
      nodeValue: 'remote-value',
      nodeModuleValue: 'remote-value',
    });
  });

  it('loads a manifest when a same-name instance disables snapshot plugins', async () => {
    expect(await runScenario('collision-snapshot')).toEqual({
      directValue: 'remote-value',
      manifestValue: 'remote-value',
      moduleValue: 'remote-value',
    });
  });

  it('keeps composed kernels with different capabilities separate', async () => {
    expect(await runScenario('compose-distinct-capabilities')).toEqual({
      separate: true,
      disabledError: remoteDisabledError,
      sharedValue: 'shared-value',
      remoteValue: 'remote-value',
      moduleValue: 'remote-value',
    });
  });

  it('reuses a root instance from a composed kernel with equal capabilities', async () => {
    expect(await runScenario('compose-root-reuse')).toEqual({
      reused: true,
      moduleValue: 'remote-value',
      instanceCount: 1,
    });
  });

  it('gives a fully composed kernel the root runtime capabilities', async () => {
    expect(await runScenario('compose-capabilities-string')).toEqual({
      root: 'remote,shared,snapshot,node',
      rootInstance: 'remote,shared,snapshot,node',
      kernel: 'remote,shared,snapshot,node',
    });
  });
});
