/*
 * @jest-environment node
 */

import FederationRuntimePlugin from '../../../../src/lib/container/runtime/FederationRuntimePlugin';

const createAsyncEntrypoint = (
  name: string,
  entryChunk: any,
  sharedRuntimeChunk: any,
) => {
  return {
    isInitial: () => false,
    getEntrypointChunk: () => entryChunk,
    getRuntimeChunk: () => sharedRuntimeChunk,
    setRuntimeChunk: jest.fn(),
    options: { name },
  };
};

describe('FederationRuntimePlugin async runtime handling', () => {
  it('keeps runtime modules on the shared runtime chunk while cloning them to async entry chunks', () => {
    const plugin = new FederationRuntimePlugin({}) as any;

    const optimizeTaps: Array<() => void> = [];

    const entryChunkOne: any = { name: 'async-one-chunk' };
    const entryChunkTwo: any = { name: 'async-two-chunk' };
    const sharedRuntimeChunk: any = { name: 'shared-runtime' };

    const entrypointOne = createAsyncEntrypoint(
      'asyncOne',
      entryChunkOne,
      sharedRuntimeChunk,
    );
    const entrypointTwo = createAsyncEntrypoint(
      'asyncTwo',
      entryChunkTwo,
      sharedRuntimeChunk,
    );

    const runtimeModules = [{ id: 'runtime-a' }, { id: 'runtime-b' }];
    const normalModules = [{ id: 'module-a' }];
    const runtimeModulesByChunk = new Map<any, any[]>([
      [entryChunkOne, []],
      [entryChunkTwo, []],
    ]);
    const modulesByChunk = new Map<any, any[]>([
      [entryChunkOne, []],
      [entryChunkTwo, []],
    ]);

    const chunkGraph = {
      getChunkRuntimeRequirements: jest.fn(() => new Set(['runtime-required'])),
      addChunkRuntimeRequirements: jest.fn(),
      getTreeRuntimeRequirements: jest.fn(() => new Set(['tree-required'])),
      addTreeRuntimeRequirements: jest.fn(),
      getChunkModulesIterable: jest.fn(() => normalModules),
      isModuleInChunk: jest.fn((module: any, chunk: any) => {
        const list = modulesByChunk.get(chunk) || [];
        return list.includes(module);
      }),
      connectChunkAndModule: jest.fn((chunk: any, module: any) => {
        const list = modulesByChunk.get(chunk);
        if (list) {
          list.push(module);
        }
      }),
      getChunkRuntimeModulesIterable: jest.fn(() => runtimeModules),
      connectChunkAndRuntimeModule: jest.fn(
        (chunk: any, runtimeModule: any) => {
          const list = runtimeModulesByChunk.get(chunk);
          if (list) {
            list.push(runtimeModule);
          }
        },
      ),
      disconnectChunkAndRuntimeModule: jest.fn(),
    };

    const compilation: any = {
      entrypoints: new Map([
        ['asyncOne', entrypointOne],
        ['asyncTwo', entrypointTwo],
      ]),
      chunkGraph,
      hooks: {
        optimizeChunks: {
          tap: jest.fn((_opts: any, cb: () => void) => optimizeTaps.push(cb)),
        },
      },
    };

    const compiler: any = {
      options: {
        optimization: {
          runtimeChunk: 'single',
        },
      },
    };

    plugin['ensureAsyncEntrypointsHaveDedicatedRuntime'](compiler, compilation);

    expect(optimizeTaps).toHaveLength(1);
    optimizeTaps[0]!();

    expect(entrypointOne.setRuntimeChunk).toHaveBeenCalledWith(entryChunkOne);
    expect(entrypointTwo.setRuntimeChunk).toHaveBeenCalledWith(entryChunkTwo);

    expect(chunkGraph.connectChunkAndRuntimeModule).toHaveBeenCalledTimes(
      runtimeModules.length * 2,
    );
    expect(chunkGraph.disconnectChunkAndRuntimeModule).not.toHaveBeenCalled();

    expect(runtimeModulesByChunk.get(entryChunkOne)).toEqual(runtimeModules);
    expect(runtimeModulesByChunk.get(entryChunkTwo)).toEqual(runtimeModules);
  });
});
