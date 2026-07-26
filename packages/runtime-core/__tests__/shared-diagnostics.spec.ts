import { beforeEach, describe, expect, it } from '@rstest/core';
import { RUNTIME_005 } from '@module-federation/error-codes';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type {
  ModuleFederationRuntimePlugin,
  Shared,
  SharedLoadContext,
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

type RawSharedEvent =
  | {
      type: 'registration';
      pkgName: string;
      scope: string;
      shared: Shared;
      previousShared?: Shared;
      registeredShared?: Shared;
      trigger: string;
    }
  | {
      type: 'selection';
      pkgName: string;
      selectedShared?: Shared;
      context?: SharedLoadContext;
      availableVersions: string[];
    }
  | {
      type: 'after';
      pkgName: string;
      selectedShared?: Partial<Shared>;
      context?: SharedLoadContext;
    }
  | {
      type: 'error';
      pkgName: string;
      context?: SharedLoadContext;
      error?: unknown;
    };

const createRawSharedObserver = (
  events: RawSharedEvent[],
): ModuleFederationRuntimePlugin => {
  let operationCounter = 0;
  const ensureContext = (context?: SharedLoadContext) => {
    const nextContext = context || {};
    if (!nextContext.operationId) {
      operationCounter += 1;
      nextContext.operationId = `observer-shared-${operationCounter}`;
    }
    return nextContext;
  };

  return {
    name: 'raw-shared-observer',
    afterRegisterShare(args) {
      events.push({
        type: 'registration',
        pkgName: args.pkgName,
        scope: args.scope,
        shared: args.shared,
        previousShared: args.previousShared,
        registeredShared: args.registeredShared,
        trigger: args.trigger,
      });
    },
    beforeLoadShare(args) {
      return {
        ...args,
        loadContext: ensureContext(args.loadContext),
      };
    },
    resolveShare(args) {
      const context = ensureContext(args.loadContext);
      const resolver = args.resolver;
      return {
        ...args,
        loadContext: context,
        resolver: () => {
          const result = resolver();
          events.push({
            type: 'selection',
            pkgName: args.pkgName,
            selectedShared: result?.shared,
            context,
            availableVersions: Object.keys(
              args.shareScopeMap[args.scope]?.[args.pkgName] || {},
            ),
          });
          return result;
        },
      };
    },
    afterLoadShare(args) {
      events.push({
        type: 'after',
        pkgName: args.pkgName,
        selectedShared: args.selectedShared,
        context: args.loadContext,
      });
    },
    errorLoadShare(args) {
      events.push({
        type: 'error',
        pkgName: args.pkgName,
        context: args.loadContext,
        error: args.error,
      });
    },
  };
};

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

describe('raw shared observation hooks', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
  });

  it('emits raw registration inputs and the actual registered value', () => {
    const events: RawSharedEvent[] = [];
    const mf = new ModuleFederation({
      name: 'registration-host',
      remotes: [],
      plugins: [createRawSharedObserver(events)],
      shared: {
        initial: {
          version: '1.0.0',
          lib: () => ({ initial: true }),
        },
      },
    });

    const initialEvent = events[0];
    expect(initialEvent).toMatchObject({
      type: 'registration',
      pkgName: 'initial',
      scope: 'default',
      trigger: 'runtime',
      shared: {
        version: '1.0.0',
        from: 'registration-host',
      },
      registeredShared: {
        version: '1.0.0',
        from: 'registration-host',
      },
    });

    const previous = createRuntimeShared({
      from: 'a-provider',
      loaded: true,
      lib: () => ({ previous: true }),
    });
    const candidate = createRuntimeShared({ from: 'z-provider' });
    mf.shareScopeMap.default.protected = { '1.0.0': previous };
    mf.options.shared.protected = [candidate];
    mf.initializeSharing('default', { from: 'build' });

    expect(events.at(-1)).toMatchObject({
      type: 'registration',
      pkgName: 'protected',
      previousShared: previous,
      registeredShared: previous,
      shared: candidate,
      trigger: 'build',
    });
  });

  it('lets an observer wrap the resolver and derive selection details', async () => {
    const events: RawSharedEvent[] = [];
    const mf = new ModuleFederation({
      name: 'selection-host',
      remotes: [],
      plugins: [createRawSharedObserver(events)],
      shared: {},
    });
    mf.options.shared.react = [];
    mf.shareScopeMap.default = {
      react: {
        '1.0.0': createRuntimeShared({
          version: '1.0.0',
          from: 'old-provider',
        }),
        '2.0.0': createRuntimeShared({
          version: '2.0.0',
          from: 'new-provider',
        }),
      },
    };

    const factory = await mf.loadShare<{ version: string }>('react', {
      customShareInfo: {
        version: '0.0.0',
        scope: ['default'],
        strategy: 'version-first',
        shareConfig: {
          requiredVersion: '*',
          singleton: false,
          strictVersion: false,
          eager: false,
        },
      },
      context: { requestId: 'request-1' },
    });

    expect(factory?.()).toEqual({ version: '2.0.0' });
    expect(events.find((event) => event.type === 'selection')).toMatchObject({
      type: 'selection',
      pkgName: 'react',
      selectedShared: {
        version: '2.0.0',
        from: 'selection-host',
      },
      availableVersions: ['1.0.0', '2.0.0'],
      context: {
        requestId: 'request-1',
        operationId: 'observer-shared-1',
      },
    });
  });

  it('preserves observer-provided correlation across concurrent loads', async () => {
    const events: RawSharedEvent[] = [];
    const mf = new ModuleFederation({
      name: 'context-host',
      remotes: [],
      plugins: [createRawSharedObserver(events)],
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

    const afterEvents = events.filter(
      (event): event is Extract<RawSharedEvent, { type: 'after' }> =>
        event.type === 'after',
    );
    expect(afterEvents).toHaveLength(2);
    expect(afterEvents.map((event) => event.context)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          moduleId: 10,
          chunkId: 'chunk-a',
        }),
        expect.objectContaining({
          requestId: 'runtime-request',
        }),
      ]),
    );
    expect(
      new Set(afterEvents.map((event) => event.context?.operationId)).size,
    ).toBe(2);
  });

  it('emits raw container registration and synchronous selection facts', () => {
    const events: RawSharedEvent[] = [];
    const factory = () => ({ sync: true });
    const mf = new ModuleFederation({
      name: 'sync-host',
      remotes: [],
      plugins: [createRawSharedObserver(events)],
      shared: {
        eagerShared: {
          version: '1.0.0',
          eager: true,
          lib: factory,
        },
      },
    });
    const remoteShared = createRuntimeShared({
      version: '3.0.0',
      from: 'remote-provider',
    });

    mf.initShareScopeMap('remote-scope', {
      remotePackage: { '3.0.0': remoteShared },
    });
    const result = mf.loadShareSync<{ sync: boolean }>('eagerShared', {
      from: 'build',
      context: { moduleId: 'sync-module' },
    });

    expect(result).toBe(factory);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'registration',
          pkgName: 'remotePackage',
          scope: 'remote-scope',
          shared: remoteShared,
          registeredShared: remoteShared,
          trigger: 'container-init',
        }),
        expect.objectContaining({
          type: 'selection',
          pkgName: 'eagerShared',
          context: expect.objectContaining({
            moduleId: 'sync-module',
          }),
        }),
        expect.objectContaining({
          type: 'after',
          pkgName: 'eagerShared',
          context: expect.objectContaining({
            operationId: expect.stringMatching(/^observer-shared-/),
          }),
        }),
      ]),
    );
  });
});
