import { ModuleFederation } from '@module-federation/runtime-core';
import { unloadRemotePlugin } from '../src/unload-remote-plugin';

describe('unloadRemotePlugin', () => {
  test('clears webpack module cache and remote marker for unloaded remote only', () => {
    const FM = new ModuleFederation({
      name: '@federation/runtime-unload-bundler-cache',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app2',
          alias: 'app2',
          entry:
            'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
        },
      ],
    });

    FM.registerPlugins([unloadRemotePlugin()]);

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

    expect(FM.unloadRemote('@register-remotes/app2')).toBe(true);
    expect(webpackRequire.c.target).toBeUndefined();
    expect(webpackRequire.m.target).toBeUndefined();
    expect(targetMapping.p).toBeUndefined();
    expect(webpackRequire.c.untouched).toBeDefined();
    expect(webpackRequire.m.untouched).toBeDefined();
    expect(untouchedMapping.p).toBeDefined();
  });
});
