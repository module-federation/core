import { beforeEach, describe, expect, it } from 'vitest';
import { RUNTIME_005 } from '@module-federation/error-codes';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { ModuleFederationRuntimePlugin } from '../src/type';

type SharedLifecycleEvent =
  | { type: 'before'; pkgName: string }
  | {
      type: 'after';
      pkgName: string;
      lifecycle: string;
      selectedVersion?: string;
      provider?: string;
    }
  | {
      type: 'error';
      pkgName: string;
      lifecycle: string;
      recovered?: boolean;
      availableVersions: string[];
      error?: unknown;
    };

const createSharedLifecyclePlugin = (
  events: SharedLifecycleEvent[],
): ModuleFederationRuntimePlugin => ({
  name: 'shared-lifecycle-test-plugin',
  beforeLoadShare(args) {
    events.push({
      type: 'before',
      pkgName: args.pkgName,
    });
    return args;
  },
  afterLoadShare(args) {
    events.push({
      type: 'after',
      pkgName: args.pkgName,
      lifecycle: args.lifecycle,
      selectedVersion: args.selectedShared?.version,
      provider: args.selectedShared?.from,
    });
  },
  errorLoadShare(args) {
    events.push({
      type: 'error',
      pkgName: args.pkgName,
      lifecycle: args.lifecycle,
      recovered: args.recovered,
      availableVersions: Object.keys(
        args.shareScopeMap.default?.[args.pkgName] || {},
      ),
      error: args.error,
    });
  },
});

describe('shared lifecycle hooks', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('emits beforeLoadShare and afterLoadShare for loadShare success', async () => {
    const events: SharedLifecycleEvent[] = [];
    const mf = new ModuleFederation({
      name: 'shared-lifecycle-host',
      remotes: [],
      plugins: [createSharedLifecyclePlugin(events)],
      shared: {
        'diagnostics-shared': {
          version: '1.0.0',
          lib: () => ({ value: 'shared' }),
        },
      },
    });

    const factory = await mf.loadShare<{ value: string }>('diagnostics-shared');

    expect(factory?.()).toEqual({ value: 'shared' });
    expect(events).toEqual([
      {
        type: 'before',
        pkgName: 'diagnostics-shared',
      },
      {
        type: 'after',
        pkgName: 'diagnostics-shared',
        lifecycle: 'loadShare',
        selectedVersion: '1.0.0',
        provider: 'shared-lifecycle-host',
      },
    ]);
  });

  it('emits errorLoadShare when custom shared info cannot be matched', async () => {
    const events: SharedLifecycleEvent[] = [];
    const mf = new ModuleFederation({
      name: 'shared-lifecycle-version-host',
      remotes: [],
      plugins: [createSharedLifecyclePlugin(events)],
      shared: {
        react: {
          version: '18.3.1',
          lib: () => ({ version: '18.3.1' }),
        },
      },
    });

    const result = await mf.loadShare('react', {
      customShareInfo: {
        shareConfig: {
          requiredVersion: '^99.0.0',
          singleton: false,
        },
      },
    });

    expect(result).toBe(false);
    expect(events.at(-1)).toEqual({
      type: 'error',
      pkgName: 'react',
      lifecycle: 'loadShare',
      recovered: true,
      availableVersions: ['18.3.1'],
      error: undefined,
    });
  });

  it('emits errorLoadShare for async shared consumed synchronously', () => {
    const events: SharedLifecycleEvent[] = [];
    const mf = new ModuleFederation({
      name: 'shared-lifecycle-eager-host',
      remotes: [],
      plugins: [createSharedLifecyclePlugin(events)],
      shared: {},
    });

    expect(() =>
      mf.loadShareSync('diagnostics-async-shared', {
        from: 'build',
        customShareInfo: {
          version: '1.0.0',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^1.0.0',
            singleton: false,
            eager: false,
            strictVersion: false,
          },
          get: () => Promise.resolve(() => ({ value: 'async' })),
        },
      }),
    ).toThrow(RUNTIME_005);

    const errorEvent = events.at(-1);
    expect(errorEvent).toMatchObject({
      type: 'error',
      pkgName: 'diagnostics-async-shared',
      lifecycle: 'loadShareSync',
      recovered: undefined,
      availableVersions: [],
    });
    expect(errorEvent?.error).toBeInstanceOf(Error);
  });
});
