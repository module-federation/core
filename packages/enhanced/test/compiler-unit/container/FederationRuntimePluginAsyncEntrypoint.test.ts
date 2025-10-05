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
import FederationRuntimePlugin from '../../../src/lib/container/runtime/FederationRuntimePlugin';

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

  it('clones shared runtime helpers onto async entry chunks when runtimeChunk is shared', () => {
    const compiler = createMockCompiler();
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
      connectChunkAndRuntimeModule: jest.fn(
        (chunk: any, runtimeModule: any) => {
          const list = runtimeModulesPerChunk.get(chunk);
          if (list) {
            list.push(runtimeModule);
          } else {
            runtimeModulesPerChunk.set(chunk, [runtimeModule]);
          }
        },
      ),
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

    expect(chunkGraph.connectChunkAndRuntimeModule).toHaveBeenCalledTimes(
      runtimeModules.length * 2,
    );
    expect(runtimeModulesPerChunk.get(entryChunkOne)).toEqual([
      ...runtimeModules,
    ]);
    expect(runtimeModulesPerChunk.get(entryChunkTwo)).toEqual([
      ...runtimeModules,
    ]);
    expect(chunkGraph.disconnectChunkAndRuntimeModule).not.toHaveBeenCalled();
  });
});
