import { ModuleFederation } from '@module-federation/runtime-core';
import { unloadRemotePlugin } from '../src/unload-remote-plugin';

describe('unloadRemotePlugin', () => {
  test('skips webpack cache purge when remote was never loaded by host', () => {
    const targetMapping: any = ['default', './say', 'external-target'];
    targetMapping.p = Promise.resolve(1);
    const untouchedMapping: any = ['default', './say', 'external-untouched'];
    untouchedMapping.p = Promise.resolve(2);

    const webpackRequire: any = {
      c: {
        target: { id: 'target' },
        untouched: { id: 'untouched' },
      },
      m: {
        target: () => null,
        untouched: () => null,
      },
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              target: [
                { externalType: 'script', name: '@register-remotes/app2' },
              ],
              untouched: [{ externalType: 'script', name: 'other-remote' }],
            },
            idToExternalAndNameMapping: {
              target: targetMapping,
              untouched: untouchedMapping,
            },
          },
        },
      },
    };
    const origin: any = {};
    origin[Symbol.for('mf_webpack_require')] = webpackRequire;

    const plugin = unloadRemotePlugin();
    expect(plugin.afterRemoveRemote).toBeDefined();
    plugin.afterRemoveRemote?.({
      remote: {
        name: '@register-remotes/app2',
        alias: 'app2',
      } as any,
      origin,
      loaded: false,
    });

    expect(webpackRequire.c.target).toBeDefined();
    expect(webpackRequire.m.target).toBeDefined();
    expect(targetMapping.p).toBeDefined();
    expect(webpackRequire.c.untouched).toBeDefined();
    expect(webpackRequire.m.untouched).toBeDefined();
    expect(untouchedMapping.p).toBeDefined();
  });

  test('clears webpack module cache when loaded is true', () => {
    const FM = new ModuleFederation({
      name: '@federation/runtime-unload-bundler-cache-loaded',
      version: '1.0.1',
      remotes: [],
    });

    const targetMapping: any = ['default', './say', 'external-target'];
    targetMapping.p = Promise.resolve(1);
    const untouchedMapping: any = ['default', './say', 'external-untouched'];
    untouchedMapping.p = Promise.resolve(2);

    const webpackRequire: any = {
      c: {
        target: { id: 'target' },
        untouched: { id: 'untouched' },
      },
      m: {
        target: () => null,
        untouched: () => null,
      },
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              target: [
                { externalType: 'script', name: '@register-remotes/app2' },
              ],
              untouched: [{ externalType: 'script', name: 'other-remote' }],
            },
            idToExternalAndNameMapping: {
              target: targetMapping,
              untouched: untouchedMapping,
            },
          },
        },
      },
    };
    (FM as any)[Symbol.for('mf_webpack_require')] = webpackRequire;

    const plugin = unloadRemotePlugin();
    expect(plugin.afterRemoveRemote).toBeDefined();
    plugin.afterRemoveRemote?.({
      remote: {
        name: '@register-remotes/app2',
        alias: 'app2',
      } as any,
      origin: FM,
      loaded: true,
    });

    expect(webpackRequire.c.target).toBeUndefined();
    expect(webpackRequire.m.target).toBeUndefined();
    expect(targetMapping.p).toBeUndefined();
    expect(webpackRequire.c.untouched).toBeDefined();
    expect(webpackRequire.m.untouched).toBeDefined();
    expect(untouchedMapping.p).toBeDefined();
  });
});
