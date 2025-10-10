// @ts-nocheck
/*
 * @jest-environment node
 */

jest.mock(
  '../../../src/lib/container/runtime/EmbedFederationRuntimePlugin',
  () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({ apply: jest.fn() })),
  }),
);

jest.mock('../../../src/lib/container/HoistContainerReferencesPlugin', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ apply: jest.fn() })),
}));

jest.mock('../../../src/lib/container/runtime/FederationModulesPlugin', () => {
  const mock = jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
  mock.getCompilationHooks = jest.fn(() => ({
    addContainerEntryDependency: { call: jest.fn() },
    addFederationRuntimeDependency: { call: jest.fn() },
    addRemoteDependency: { call: jest.fn() },
  }));
  return {
    __esModule: true,
    default: mock,
  };
});

import { createMockCompiler } from '../utils';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import FederationRuntimePlugin from '../../../src/lib/container/runtime/FederationRuntimePlugin';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const embedMock = jest.requireMock(
  '../../../src/lib/container/runtime/EmbedFederationRuntimePlugin',
).default as jest.Mock;
const hoistMock = jest.requireMock(
  '../../../src/lib/container/HoistContainerReferencesPlugin',
).default as jest.Mock;
const federationModulesMock = jest.requireMock(
  '../../../src/lib/container/runtime/FederationModulesPlugin',
).default as jest.Mock & { getCompilationHooks: jest.Mock };

describe('FederationRuntimePlugin compiler async runtime integration', () => {
  beforeEach(() => {
    embedMock.mockClear();
    hoistMock.mockClear();
    federationModulesMock.mockClear();
    federationModulesMock.getCompilationHooks.mockClear();
  });

  const initCompiler = () => {
    const compiler = createMockCompiler();
    compiler.options.output = { uniqueName: 'mf-test' } as any;
    return compiler;
  };
  const createRuntimeRequirementTracker = () => {
    const calls: string[] = [];
    const map = new Map<string, { tap: jest.Mock }>();
    return {
      tracker: jest.fn((key: string) => {
        calls.push(key);
        if (!map.has(key)) {
          map.set(key, { tap: jest.fn() });
        }
        return map.get(key)!;
      }),
      getKeys: () => calls,
      getTapFor: (key: string) => map.get(key)?.tap || jest.fn(),
    };
  };

  it('assigns a dedicated runtime chunk to async entrypoints and copies requirements', () => {
    const compiler = initCompiler();
    compiler.options.optimization = { runtimeChunk: 'single' } as any;
    compiler.options.plugins = [];
    compiler.options.resolve = { alias: {} } as any;

    const sharedRuntimeChunk: any = {
      name: 'mf-runtime',
      hasRuntime: () => true,
    };
    const entryChunkOne: any = { name: 'async-worker' };
    const entryChunkTwo: any = { name: 'async-analytics' };

    let runtimeChunkOne = sharedRuntimeChunk;
    let runtimeChunkTwo = sharedRuntimeChunk;

    const entrypointOne = {
      isInitial: () => false,
      getEntrypointChunk: () => entryChunkOne,
      getRuntimeChunk: jest.fn(() => runtimeChunkOne),
      setRuntimeChunk: jest.fn((chunk) => {
        runtimeChunkOne = chunk;
      }),
      options: { name: 'asyncWorker' },
    };

    const entrypointTwo = {
      isInitial: () => false,
      getEntrypointChunk: () => entryChunkTwo,
      getRuntimeChunk: jest.fn(() => runtimeChunkTwo),
      setRuntimeChunk: jest.fn((chunk) => {
        runtimeChunkTwo = chunk;
      }),
      options: { name: 'asyncAnalytics' },
    };

    const runtimeModules = [{ id: 'runtime-a' }, { id: 'runtime-b' }];

    const modulesPerChunk = new Map<any, any[]>([
      [sharedRuntimeChunk, []],
      [entryChunkOne, []],
      [entryChunkTwo, []],
    ]);
    const runtimeModulesPerChunk = new Map<any, any[]>([
      [sharedRuntimeChunk, [...runtimeModules]],
      [entryChunkOne, []],
      [entryChunkTwo, []],
    ]);

    const runtimeRequirementTracker = createRuntimeRequirementTracker();

    const chunkGraph = {
      getChunkRuntimeRequirements: jest.fn(
        (chunk: any) =>
          new Set(chunk === sharedRuntimeChunk ? ['remote-runtime'] : []),
      ),
      addChunkRuntimeRequirements: jest.fn(
        (chunk: any, requirements: Set<string>) => {
          modulesPerChunk.set(chunk, modulesPerChunk.get(chunk) || []);
        },
      ),
      getTreeRuntimeRequirements: jest.fn(
        (chunk: any) =>
          new Set(chunk === sharedRuntimeChunk ? ['tree-runtime'] : []),
      ),
      addTreeRuntimeRequirements: jest.fn(),
      getChunkModulesIterable: jest.fn(
        (chunk: any) => modulesPerChunk.get(chunk) || [],
      ),
      isModuleInChunk: jest.fn((module: any, chunk: any) =>
        (modulesPerChunk.get(chunk) || []).includes(module),
      ),
      connectChunkAndModule: jest.fn((chunk: any, module: any) => {
        const list = modulesPerChunk.get(chunk);
        if (list) {
          list.push(module);
        } else {
          modulesPerChunk.set(chunk, [module]);
        }
      }),
      getChunkRuntimeModulesIterable: jest.fn(
        (chunk: any) => runtimeModulesPerChunk.get(chunk) || [],
      ),
      connectChunkAndRuntimeModule: jest.fn(),
      disconnectChunkAndRuntimeModule: jest.fn(),
    };

    const entrypoints = new Map<string, any>([
      ['asyncWorker', entrypointOne],
      ['asyncAnalytics', entrypointTwo],
    ]);

    const optimizeCallbacks: Array<() => void> = [];

    const compilation: any = {
      compiler,
      options: compiler.options,
      entrypoints,
      chunkGraph,
      dependencyFactories: new Map(),
      dependencyTemplates: new Map(),
      hooks: {
        optimizeChunks: {
          tap: jest.fn((_opts: any, handler: () => void) => {
            optimizeCallbacks.push(handler);
          }),
        },
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
        runtimeRequirementInTree: {
          for: runtimeRequirementTracker.tracker,
        },
      },
      addRuntimeModule: jest.fn(),
    };

    federationModulesMock.getCompilationHooks.mockReturnValue({
      addContainerEntryDependency: { call: jest.fn() },
      addFederationRuntimeDependency: { call: jest.fn() },
      addRemoteDependency: { call: jest.fn() },
    });

    const plugin = new FederationRuntimePlugin({ name: 'host', remotes: {} });
    plugin.apply(compiler as any);

    const thisCompilationCalls = (
      compiler.hooks.thisCompilation.tap as jest.Mock
    ).mock.calls;
    expect(thisCompilationCalls.length).toBeGreaterThan(0);

    for (const [, handler] of thisCompilationCalls) {
      handler(compilation, { normalModuleFactory: {} });
    }

    expect(optimizeCallbacks).toHaveLength(1);

    optimizeCallbacks[0]!();

    expect(entrypointOne.setRuntimeChunk).toHaveBeenCalledWith(entryChunkOne);
    expect(entrypointTwo.setRuntimeChunk).toHaveBeenCalledWith(entryChunkTwo);
    expect(runtimeChunkOne).toBe(entryChunkOne);
    expect(runtimeChunkTwo).toBe(entryChunkTwo);

    expect(entrypointOne.options.runtime).toBe('async-worker');
    expect(entrypointTwo.options.runtime).toBe('async-analytics');
    expect(entryChunkOne.runtime).toBe('async-worker');
    expect(entryChunkTwo.runtime).toBe('async-analytics');

    const addChunkCalls = chunkGraph.addChunkRuntimeRequirements.mock.calls;
    const clonedRequirements = addChunkCalls.find(
      ([chunk]: [any]) => chunk === entryChunkOne,
    );
    expect(clonedRequirements?.[1]).toEqual(new Set(['remote-runtime']));

    const addTreeCalls = chunkGraph.addTreeRuntimeRequirements.mock.calls;
    const clonedTreeRequirements = addTreeCalls.find(
      ([chunk]: [any]) => chunk === entryChunkOne,
    );
    expect(clonedTreeRequirements?.[1]).toBeInstanceOf(Set);
    expect(Array.from(clonedTreeRequirements?.[1] || [])).toEqual([
      'tree-runtime',
    ]);

    expect(chunkGraph.connectChunkAndRuntimeModule).not.toHaveBeenCalled();
    expect(runtimeModulesPerChunk.get(entryChunkOne)).toEqual([]);
    expect(runtimeModulesPerChunk.get(entryChunkTwo)).toEqual([]);
    expect(chunkGraph.disconnectChunkAndRuntimeModule).not.toHaveBeenCalled();

    const requirementKeys = runtimeRequirementTracker.getKeys();
    expect(requirementKeys).toEqual(
      expect.arrayContaining([
        RuntimeGlobals.initializeSharing,
        RuntimeGlobals.currentRemoteGetScope,
        RuntimeGlobals.shareScopeMap,
        RuntimeGlobals.ensureChunkHandlers,
      ]),
    );
    expect(
      requirementKeys.some((key) => key.toLowerCase().includes('federation')),
    ).toBe(true);
  });

  it('skips reassignment when async entry already owns the runtime chunk', () => {
    const compiler = initCompiler();
    compiler.options.optimization = { runtimeChunk: 'single' } as any;
    compiler.options.plugins = [];
    compiler.options.resolve = { alias: {} } as any;

    const entryChunk: any = { name: 'async-self', runtime: 'async-self' };
    const entrypoint = {
      isInitial: () => false,
      getEntrypointChunk: () => entryChunk,
      getRuntimeChunk: () => entryChunk,
      setRuntimeChunk: jest.fn(),
      options: { name: 'asyncSelf' },
    };

    const chunkGraph = {
      getChunkRuntimeRequirements: jest.fn(() => new Set()),
      addChunkRuntimeRequirements: jest.fn(),
      getTreeRuntimeRequirements: jest.fn(() => new Set()),
      addTreeRuntimeRequirements: jest.fn(),
      getChunkModulesIterable: jest.fn(() => []),
      isModuleInChunk: jest.fn(() => false),
      connectChunkAndModule: jest.fn(),
      getChunkRuntimeModulesIterable: jest.fn(() => []),
      connectChunkAndRuntimeModule: jest.fn(),
      disconnectChunkAndRuntimeModule: jest.fn(),
    };

    const optimizeCallbacks: Array<() => void> = [];
    const compilation: any = {
      compiler,
      options: compiler.options,
      entrypoints: new Map([['asyncSelf', entrypoint]]),
      chunkGraph,
      dependencyFactories: new Map(),
      dependencyTemplates: new Map(),
      hooks: {
        optimizeChunks: {
          tap: jest.fn((_opts: any, handler: () => void) => {
            optimizeCallbacks.push(handler);
          }),
        },
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
        runtimeRequirementInTree: {
          for: jest.fn().mockReturnValue({ tap: jest.fn() }),
        },
      },
      addRuntimeModule: jest.fn(),
    };

    federationModulesMock.getCompilationHooks.mockReturnValue({
      addContainerEntryDependency: { call: jest.fn() },
      addFederationRuntimeDependency: { call: jest.fn() },
      addRemoteDependency: { call: jest.fn() },
    });

    const plugin = new FederationRuntimePlugin({ name: 'host', remotes: {} });
    plugin.apply(compiler as any);
    (compiler.hooks.thisCompilation.tap as jest.Mock).mock.calls.forEach(
      ([, handler]: any) => handler(compilation, { normalModuleFactory: {} }),
    );

    expect(optimizeCallbacks).toHaveLength(1);
    optimizeCallbacks[0]!();

    expect(entrypoint.setRuntimeChunk).not.toHaveBeenCalled();
    expect(chunkGraph.addChunkRuntimeRequirements).not.toHaveBeenCalled();
    expect(chunkGraph.connectChunkAndModule).not.toHaveBeenCalled();
    expect(chunkGraph.connectChunkAndRuntimeModule).not.toHaveBeenCalled();
  });

  it('copies standard modules from the shared runtime chunk if missing', () => {
    const compiler = initCompiler();
    compiler.options.optimization = { runtimeChunk: 'single' } as any;
    compiler.options.plugins = [];
    compiler.options.resolve = { alias: {} } as any;

    const sharedRuntimeChunk: any = {
      name: 'mf-runtime',
      hasRuntime: () => true,
    };
    const entryChunk: any = { name: 'async-modules' };
    const otherEntryChunk: any = { name: 'secondary' };
    const moduleA = { identifier: () => 'module-a' };

    const entrypoint = {
      isInitial: () => false,
      getEntrypointChunk: () => entryChunk,
      getRuntimeChunk: jest.fn(() => sharedRuntimeChunk),
      setRuntimeChunk: jest.fn(),
      options: { name: 'asyncModules' },
    };
    const secondaryEntrypoint = {
      isInitial: () => false,
      getEntrypointChunk: () => otherEntryChunk,
      getRuntimeChunk: jest.fn(() => sharedRuntimeChunk),
      setRuntimeChunk: jest.fn(),
      options: { name: 'secondary' },
    };

    const chunkGraph = {
      getChunkRuntimeRequirements: jest.fn(() => new Set(['remote-runtime'])),
      addChunkRuntimeRequirements: jest.fn(),
      getTreeRuntimeRequirements: jest.fn(() => new Set(['tree-runtime'])),
      addTreeRuntimeRequirements: jest.fn(),
      getChunkModulesIterable: jest.fn((chunk: any) =>
        chunk === sharedRuntimeChunk ? [moduleA] : [],
      ),
      isModuleInChunk: jest.fn(() => false),
      connectChunkAndModule: jest.fn(),
      getChunkRuntimeModulesIterable: jest.fn(() => []),
      connectChunkAndRuntimeModule: jest.fn(),
      disconnectChunkAndRuntimeModule: jest.fn(),
    };

    const optimizeCallbacks: Array<() => void> = [];
    const compilation: any = {
      compiler,
      options: compiler.options,
      entrypoints: new Map([
        [entrypoint.options.name, entrypoint],
        [secondaryEntrypoint.options.name, secondaryEntrypoint],
      ]),
      chunkGraph,
      dependencyFactories: new Map(),
      dependencyTemplates: new Map(),
      hooks: {
        optimizeChunks: {
          tap: jest.fn((_opts: any, handler: () => void) => {
            optimizeCallbacks.push(handler);
          }),
        },
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
        runtimeRequirementInTree: {
          for: jest.fn().mockReturnValue({ tap: jest.fn() }),
        },
      },
      addRuntimeModule: jest.fn(),
    };

    federationModulesMock.getCompilationHooks.mockReturnValue({
      addContainerEntryDependency: { call: jest.fn() },
      addFederationRuntimeDependency: { call: jest.fn() },
      addRemoteDependency: { call: jest.fn() },
    });

    const plugin = new FederationRuntimePlugin({ name: 'host', remotes: {} });
    plugin.apply(compiler as any);
    (compiler.hooks.thisCompilation.tap as jest.Mock).mock.calls.forEach(
      ([, handler]: any) => handler(compilation, { normalModuleFactory: {} }),
    );

    optimizeCallbacks[0]!();

    expect(chunkGraph.connectChunkAndModule).toHaveBeenCalledWith(
      entryChunk,
      moduleA,
    );
    expect(chunkGraph.connectChunkAndModule).toHaveBeenCalledWith(
      otherEntryChunk,
      moduleA,
    );
  });

  it('derives a stable runtime name when the entry chunk is unnamed', () => {
    const compiler = initCompiler();
    compiler.options.optimization = { runtimeChunk: 'single' } as any;
    compiler.options.plugins = [];
    compiler.options.resolve = { alias: {} } as any;

    const sharedRuntimeChunk: any = {
      name: 'mf-runtime',
      hasRuntime: () => true,
    };
    const entryChunk: any = { id: 42 };
    const siblingChunk: any = { name: 'sibling-runtime' };
    const entrypoint = {
      isInitial: () => false,
      getEntrypointChunk: () => entryChunk,
      getRuntimeChunk: jest.fn(() => sharedRuntimeChunk),
      setRuntimeChunk: jest.fn((chunk: any) => {
        entrypoint._chunk = chunk;
      }),
      options: {},
      _chunk: sharedRuntimeChunk,
    } as any;
    const siblingEntrypoint = {
      isInitial: () => false,
      getEntrypointChunk: () => siblingChunk,
      getRuntimeChunk: jest.fn(() => sharedRuntimeChunk),
      setRuntimeChunk: jest.fn(),
      options: { name: 'sibling' },
    };

    const chunkGraph = {
      getChunkRuntimeRequirements: jest.fn(() => new Set()),
      addChunkRuntimeRequirements: jest.fn(),
      getTreeRuntimeRequirements: jest.fn(() => new Set()),
      addTreeRuntimeRequirements: jest.fn(),
      getChunkModulesIterable: jest.fn(() => []),
      isModuleInChunk: jest.fn(() => false),
      connectChunkAndModule: jest.fn(),
      getChunkRuntimeModulesIterable: jest.fn(() => []),
      connectChunkAndRuntimeModule: jest.fn(),
      disconnectChunkAndRuntimeModule: jest.fn(),
    };

    const optimizeCallbacks: Array<() => void> = [];
    const compilation: any = {
      compiler,
      options: compiler.options,
      entrypoints: new Map([
        [undefined, entrypoint],
        ['sibling', siblingEntrypoint],
      ]),
      chunkGraph,
      dependencyFactories: new Map(),
      dependencyTemplates: new Map(),
      hooks: {
        optimizeChunks: {
          tap: jest.fn((_opts: any, handler: () => void) => {
            optimizeCallbacks.push(handler);
          }),
        },
        additionalTreeRuntimeRequirements: { tap: jest.fn() },
        runtimeRequirementInTree: {
          for: jest.fn().mockReturnValue({ tap: jest.fn() }),
        },
      },
      addRuntimeModule: jest.fn(),
    };

    federationModulesMock.getCompilationHooks.mockReturnValue({
      addContainerEntryDependency: { call: jest.fn() },
      addFederationRuntimeDependency: { call: jest.fn() },
      addRemoteDependency: { call: jest.fn() },
    });

    const plugin = new FederationRuntimePlugin({ name: undefined });
    plugin.apply(compiler as any);
    (compiler.hooks.thisCompilation.tap as jest.Mock).mock.calls.forEach(
      ([, handler]: any) => handler(compilation, { normalModuleFactory: {} }),
    );

    optimizeCallbacks[0]!();

    expect(entrypoint.setRuntimeChunk).toHaveBeenCalledWith(entryChunk);
    expect(entryChunk.runtime).toBe(String(entryChunk.id));
  });
});
