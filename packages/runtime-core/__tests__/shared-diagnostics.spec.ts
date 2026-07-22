import { beforeEach, describe, expect, it } from '@rstest/core';
import { RUNTIME_005 } from '@module-federation/error-codes';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type {
  ModuleFederationRuntimePlugin,
  Shared,
  SharedRegistrationResult,
  SharedSelectionResult,
} from '../src/type';

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

type DetailedSharedEvent =
  | { type: 'registration'; result: SharedRegistrationResult }
  | { type: 'selection'; result?: SharedSelectionResult }
  | { type: 'selection-error'; result?: SharedSelectionResult };

const createDetailedSharedPlugin = (
  events: DetailedSharedEvent[],
): ModuleFederationRuntimePlugin => ({
  name: 'detailed-shared-lifecycle-test-plugin',
  afterRegisterShare(args) {
    events.push({ type: 'registration', result: args.registration });
  },
  afterLoadShare(args) {
    events.push({ type: 'selection', result: args.selectionResult });
  },
  errorLoadShare(args) {
    events.push({ type: 'selection-error', result: args.selectionResult });
  },
});

const createRuntimeShared = (overrides: Partial<Shared> = {}): Shared => ({
  version: '1.0.0',
  get: () => () => ({ version: overrides.version || '1.0.0' }),
  shareConfig: {
    requiredVersion: '*',
    singleton: false,
    strictVersion: false,
    eager: false,
  },
  scope: ['default'],
  useIn: [],
  from: 'provider',
  deps: [],
  strategy: 'version-first',
  ...overrides,
});

describe('detailed shared diagnostics', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('reports registered, reused, replaced, and ignored registration results', () => {
    const events: DetailedSharedEvent[] = [];
    const mf = new ModuleFederation({
      name: 'z-host',
      remotes: [],
      plugins: [createDetailedSharedPlugin(events)],
      shared: {
        initial: {
          version: '1.0.0',
          lib: () => ({ initial: true }),
        },
      },
    });

    expect(events[0]).toMatchObject({
      type: 'registration',
      result: {
        action: 'registered',
        reason: 'first-registration',
        candidate: {
          version: '1.0.0',
          provider: 'z-host',
        },
      },
    });

    mf.registerShared({
      initial: {
        version: '1.0.0',
        lib: () => ({ initial: true }),
      },
    });
    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      result: {
        action: 'reused',
        reason: 'same-version-same-provider',
      },
    });

    const eagerCandidate = createRuntimeShared({
      from: 'remote-eager',
      eager: true,
      shareConfig: {
        requiredVersion: '*',
        singleton: false,
        strictVersion: false,
        eager: true,
      },
    });
    mf.options.shared.eager = [eagerCandidate];
    mf.shareScopeMap.default.eager = {
      '1.0.0': createRuntimeShared({ from: 'remote-lazy' }),
    };
    mf.initializeSharing('default', { from: 'build' });
    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      result: {
        action: 'replaced',
        reason: 'eager-preferred',
        effective: { provider: 'remote-eager', eager: true },
      },
    });

    mf.options.shared.providerPriority = [
      createRuntimeShared({ from: 'candidate-provider' }),
    ];
    mf.shareScopeMap.default.providerPriority = {
      '1.0.0': createRuntimeShared({ from: 'a-provider' }),
    };
    mf.initializeSharing('default', { from: 'build' });
    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      result: {
        action: 'replaced',
        reason: 'provider-name-preferred',
        effective: { provider: 'candidate-provider' },
      },
    });

    mf.options.shared.loadedFirst = [
      createRuntimeShared({ from: 'candidate-provider' }),
    ];
    mf.shareScopeMap.default.loadedFirst = {
      '1.0.0': createRuntimeShared({
        from: 'loaded-first-provider',
        strategy: 'loaded-first',
      }),
    };
    mf.initializeSharing('default', { from: 'build' });
    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      result: {
        action: 'ignored',
        reason: 'loaded-first-preserved',
        effective: { provider: 'loaded-first-provider' },
      },
    });

    const loaded = createRuntimeShared({
      from: 'loaded-provider',
      loaded: true,
      lib: () => ({ loaded: true }),
    });
    mf.options.shared.loaded = [
      createRuntimeShared({ from: 'replacement-provider' }),
    ];
    mf.shareScopeMap.default.loaded = { '1.0.0': loaded };
    mf.initializeSharing('default', { from: 'build' });
    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      result: {
        action: 'ignored',
        reason: 'loaded-version-preserved',
        effective: { provider: 'loaded-provider', loaded: true },
      },
    });

    const reused = createRuntimeShared({ from: 'same-provider' });
    mf.options.shared.reused = [reused];
    mf.shareScopeMap.default.reused = { '1.0.0': reused };
    mf.initializeSharing('default', { from: 'build' });
    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      result: {
        action: 'reused',
        reason: 'same-registration-reused',
      },
    });
  });

  it.each([
    {
      strategy: 'version-first' as const,
      expectedVersion: '2.0.0',
      expectedReason: 'version-first',
      rejectedVersion: '1.0.0',
      rejectionReason: 'lower-priority-version',
    },
    {
      strategy: 'loaded-first' as const,
      expectedVersion: '1.0.0',
      expectedReason: 'loaded-first',
      rejectedVersion: '2.0.0',
      rejectionReason: 'not-loaded',
    },
  ])(
    'reports $strategy selection from all candidates',
    async ({
      strategy,
      expectedVersion,
      expectedReason,
      rejectedVersion,
      rejectionReason,
    }) => {
      const events: DetailedSharedEvent[] = [];
      const mf = new ModuleFederation({
        name: `selection-${strategy}`,
        remotes: [],
        plugins: [createDetailedSharedPlugin(events)],
        shared: {},
      });
      mf.options.shared.react = [];
      mf.shareScopeMap.default = {
        react: {
          '1.0.0': createRuntimeShared({
            version: '1.0.0',
            from: 'loaded-provider',
            loaded: strategy === 'loaded-first',
            lib:
              strategy === 'loaded-first'
                ? () => ({ version: '1.0.0' })
                : undefined,
            strategy,
          }),
          '2.0.0': createRuntimeShared({
            version: '2.0.0',
            from: 'new-provider',
            strategy,
          }),
        },
      };

      const factory = await mf.loadShare<{ version: string }>('react', {
        customShareInfo: {
          version: '0.0.0',
          scope: ['default'],
          strategy,
          shareConfig: {
            requiredVersion: '*',
            singleton: false,
            strictVersion: false,
            eager: false,
          },
        },
      });

      expect(factory && factory()).toEqual({ version: expectedVersion });
      expect(events.at(-1)).toMatchObject({
        type: 'selection',
        result: {
          reason: expectedReason,
          selected: { version: expectedVersion },
          candidates: [
            { version: '1.0.0', provider: 'loaded-provider' },
            { version: '2.0.0', provider: 'new-provider' },
          ],
          loadType: 'async',
          context: {
            trigger: 'runtime',
            operationId: expect.stringMatching(/^loadShare-/),
          },
        },
      });
      const selectionEvent = events.at(-1);
      expect(
        selectionEvent?.type === 'selection'
          ? selectionEvent.result?.candidates.find(
              (candidate) => candidate.version === rejectedVersion,
            )
          : undefined,
      ).toMatchObject({ rejectionReason });
    },
  );

  it('reports singleton selection and strict-version rejection', async () => {
    const events: DetailedSharedEvent[] = [];
    const mf = new ModuleFederation({
      name: 'singleton-host',
      remotes: [],
      plugins: [createDetailedSharedPlugin(events)],
      shared: {},
    });
    mf.options.shared.react = [];
    mf.shareScopeMap.default = {
      react: {
        '18.3.1': createRuntimeShared({
          version: '18.3.1',
          from: 'react-provider',
          loaded: true,
          lib: () => ({ version: '18.3.1' }),
        }),
      },
    };

    await mf.loadShare('react', {
      customShareInfo: {
        version: '18.0.0',
        scope: ['default'],
        shareConfig: {
          requiredVersion: '^18.0.0',
          singleton: true,
          strictVersion: true,
          eager: false,
        },
      },
    });
    expect(events.at(-1)).toMatchObject({
      type: 'selection',
      result: {
        reason: 'singleton-existing',
        selected: { version: '18.3.1', provider: 'react-provider' },
      },
    });

    await expect(
      mf.loadShare('react', {
        customShareInfo: {
          version: '19.0.0',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^19.0.0',
            singleton: true,
            strictVersion: true,
            eager: false,
          },
        },
      }),
    ).rejects.toThrow('does not satisfy');
    expect(events.at(-1)).toMatchObject({
      type: 'selection-error',
      result: {
        reason: 'strict-version-rejected',
        failureReason: 'strict-version-rejected',
        selected: undefined,
      },
    });
  });

  it('reports custom resolver and local fallback without changing return behavior', async () => {
    const events: DetailedSharedEvent[] = [];
    const localFactory = () => ({ version: 'local' });
    const mf = new ModuleFederation({
      name: 'resolver-host',
      remotes: [],
      plugins: [createDetailedSharedPlugin(events)],
      shared: {
        custom: [
          { version: '1.0.0', lib: () => ({ version: '1.0.0' }) },
          { version: '2.0.0', lib: () => ({ version: '2.0.0' }) },
        ],
        fallback: {
          version: '1.0.0',
          scope: 'local',
          lib: localFactory,
        },
      },
    });

    const customFactory = await mf.loadShare<{ version: string }>('custom', {
      resolver: (options) => options[0],
    });
    expect(customFactory && customFactory()).toEqual({ version: '1.0.0' });
    expect(events.at(-1)).toMatchObject({
      type: 'selection',
      result: { reason: 'custom-resolver' },
    });

    const fallbackFactory = await mf.loadShare<{ version: string }>(
      'fallback',
      {
        resolver: (options) => ({ ...options[0], scope: ['missing'] }),
      },
    );
    expect(fallbackFactory).toBe(localFactory);
    expect(events.at(-1)).toMatchObject({
      type: 'selection',
      result: {
        reason: 'local-fallback',
        fallback: true,
        selected: { version: '1.0.0', provider: 'resolver-host' },
      },
    });
  });

  it('keeps concurrent operations and explicit build context independent', async () => {
    const events: DetailedSharedEvent[] = [];
    const mf = new ModuleFederation({
      name: 'context-host',
      remotes: [],
      plugins: [createDetailedSharedPlugin(events)],
      shared: {
        slow: {
          version: '1.0.0',
          get: async () => {
            await Promise.resolve();
            return () => ({ slow: true });
          },
        },
      },
    });

    await Promise.all([
      mf.loadShare('slow', {
        from: 'build',
        context: { moduleId: 10, chunkId: 'chunk-a' },
      }),
      mf.loadShare('slow', {
        context: { requestId: 'runtime-request' },
      }),
    ]);

    const selections = events.filter(
      (event): event is Extract<DetailedSharedEvent, { type: 'selection' }> =>
        event.type === 'selection',
    );
    expect(selections).toHaveLength(2);
    expect(selections[0].result?.context).toMatchObject({
      trigger: 'build',
      moduleId: 10,
      chunkId: 'chunk-a',
    });
    expect(selections[1].result?.context).toMatchObject({
      trigger: 'runtime',
      requestId: 'runtime-request',
    });
    expect(selections[0].result?.context.operationId).not.toBe(
      selections[1].result?.context.operationId,
    );
  });

  it('reports the original asynchronous load failure with its selection', async () => {
    const events: DetailedSharedEvent[] = [];
    const originalError = new Error('shared factory failed');
    const mf = new ModuleFederation({
      name: 'async-error-host',
      remotes: [],
      plugins: [createDetailedSharedPlugin(events)],
      shared: {
        broken: {
          version: '1.0.0',
          get: async () => {
            throw originalError;
          },
        },
      },
    });

    await expect(mf.loadShare('broken')).rejects.toBe(originalError);
    expect(events.at(-1)).toMatchObject({
      type: 'selection-error',
      result: {
        selected: { version: '1.0.0', provider: 'async-error-host' },
        failureReason: 'load-error',
        loadType: 'async',
      },
    });
  });

  it('reports synchronous success and keeps its factory return unchanged', () => {
    const events: DetailedSharedEvent[] = [];
    const factory = () => ({ sync: true });
    const mf = new ModuleFederation({
      name: 'sync-success-host',
      remotes: [],
      plugins: [createDetailedSharedPlugin(events)],
      shared: {
        eagerShared: {
          version: '1.0.0',
          eager: true,
          lib: factory,
        },
      },
    });

    const result = mf.loadShareSync<{ sync: boolean }>('eagerShared', {
      from: 'build',
      context: { moduleId: 'sync-module' },
    });
    expect(result).toBe(factory);
    expect(result()).toEqual({ sync: true });
    expect(events.at(-1)).toMatchObject({
      type: 'selection',
      result: {
        loadType: 'sync',
        context: {
          trigger: 'build',
          moduleId: 'sync-module',
          operationId: expect.stringMatching(/^loadShareSync-/),
        },
      },
    });
  });

  it('reports container share-scope registration with safe summaries', () => {
    const events: DetailedSharedEvent[] = [];
    const mf = new ModuleFederation({
      name: 'container-host',
      remotes: [],
      plugins: [createDetailedSharedPlugin(events)],
      shared: {},
    });
    const remoteShared = createRuntimeShared({
      version: '3.0.0',
      from: 'remote-provider',
    });

    mf.initShareScopeMap('remote-scope', {
      remotePackage: { '3.0.0': remoteShared },
    });

    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      result: {
        trigger: 'container-init',
        action: 'registered',
        candidate: {
          scope: 'remote-scope',
          version: '3.0.0',
          provider: 'remote-provider',
        },
      },
    });
    expect(events.at(-1)).not.toHaveProperty('result.candidate.get');
    expect(events.at(-1)).not.toHaveProperty('result.candidate.lib');
    expect(events.at(-1)).not.toHaveProperty('result.candidate.loadingPromise');
  });
});
