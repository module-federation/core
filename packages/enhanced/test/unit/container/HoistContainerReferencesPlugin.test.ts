import HoistContainerReferences, {
  getAllReferencedModules,
} from '../../../src/lib/container/HoistContainerReferencesPlugin';
import FederationModulesPlugin from '../../../src/lib/container/runtime/FederationModulesPlugin';
import type { Compiler, Compilation, Chunk, Module } from 'webpack';

jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: (path: string) => path,
  getWebpackPath: jest.fn(() => 'webpack'),
}));

describe('HoistContainerReferencesPlugin', () => {
  let plugin: HoistContainerReferences;
  let compiler: any;
  let compilation: any;

  beforeEach(() => {
    plugin = new HoistContainerReferences();

    compiler = {
      hooks: {
        thisCompilation: {
          tap: jest.fn(),
        },
      },
      webpack: {
        util: {
          runtime: {
            forEachRuntime: jest.fn((runtimeSpec, callback) => {
              if (runtimeSpec) {
                callback('main');
              }
            }),
          },
        },
      },
    };

    compilation = {
      hooks: {
        optimizeChunks: {
          tap: jest.fn(),
        },
        processAssets: {
          tap: jest.fn(),
        },
      },
      chunkGraph: {
        getModuleChunks: jest.fn(() => []),
        getModuleRuntimes: jest.fn(() => []),
        isModuleInChunk: jest.fn(() => false),
        connectChunkAndModule: jest.fn(),
        disconnectChunkAndModule: jest.fn(),
      },
      moduleGraph: {
        getModule: jest.fn(),
        getParentBlock: jest.fn(),
        _getModuleGraphModule: jest.fn(),
      },
      namedChunks: new Map(),
      chunks: [],
      getLogger: jest.fn(() => ({
        warn: jest.fn(),
      })),
      compiler,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('should tap into thisCompilation hook', () => {
      plugin.apply(compiler as Compiler);

      expect(compiler.hooks.thisCompilation.tap).toHaveBeenCalledWith(
        'HoistContainerReferences',
        expect.any(Function),
      );
    });

    it('should tap into compilation hooks when thisCompilation is called', () => {
      plugin.apply(compiler as Compiler);

      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      expect(compilation.hooks.optimizeChunks.tap).toHaveBeenCalledWith(
        {
          name: 'HoistContainerReferences',
          stage: 11,
        },
        expect.any(Function),
      );
    });

    it('should register hooks with FederationModulesPlugin', () => {
      const mockHooks = {
        addContainerEntryDependency: { tap: jest.fn() },
        addFederationRuntimeDependency: { tap: jest.fn() },
        addRemoteDependency: { tap: jest.fn() },
      };

      jest
        .spyOn(FederationModulesPlugin, 'getCompilationHooks')
        .mockReturnValue(mockHooks as any);

      plugin.apply(compiler as Compiler);
      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      expect(mockHooks.addContainerEntryDependency.tap).toHaveBeenCalledWith(
        'HoistContainerReferences',
        expect.any(Function),
      );
      expect(mockHooks.addFederationRuntimeDependency.tap).toHaveBeenCalledWith(
        'HoistContainerReferences',
        expect.any(Function),
      );
      expect(mockHooks.addRemoteDependency.tap).toHaveBeenCalledWith(
        'HoistContainerReferences',
        expect.any(Function),
      );
    });
  });

  describe('getRuntimeChunks', () => {
    it('should identify runtime chunks correctly', () => {
      const runtimeChunk = {
        hasRuntime: jest.fn(() => true),
        name: 'runtime',
      };
      const normalChunk = {
        hasRuntime: jest.fn(() => false),
        name: 'normal',
      };

      compilation.chunks = [runtimeChunk, normalChunk];

      plugin.apply(compiler as Compiler);
      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      const optimizeChunksCallback =
        compilation.hooks.optimizeChunks.tap.mock.calls[0][1];
      optimizeChunksCallback(compilation.chunks);

      expect(runtimeChunk.hasRuntime).toHaveBeenCalled();
      expect(normalChunk.hasRuntime).toHaveBeenCalled();
    });

    it('should return empty set when no runtime chunks exist', () => {
      const normalChunk = {
        hasRuntime: jest.fn(() => false),
        name: 'normal',
      };

      compilation.chunks = [normalChunk];

      plugin.apply(compiler as Compiler);
      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      const optimizeChunksCallback =
        compilation.hooks.optimizeChunks.tap.mock.calls[0][1];
      optimizeChunksCallback(compilation.chunks);

      expect(normalChunk.hasRuntime).toHaveBeenCalled();
    });
  });

  describe('hoistModulesInChunks', () => {
    it('should connect modules to runtime chunks', () => {
      const runtimeChunk = {
        hasRuntime: jest.fn(() => true),
        name: 'runtime',
        runtime: ['main'],
      };

      const mockModule = {
        identifier: () => 'test-module',
      };

      const mockDependency = {
        type: 'container-entry',
      };

      compilation.chunks = [runtimeChunk];
      compilation.chunkGraph.getModuleChunks.mockReturnValue([runtimeChunk]);
      compilation.chunkGraph.getModuleRuntimes.mockReturnValue(['main']);
      compilation.moduleGraph.getModule.mockReturnValue(mockModule);
      compilation.moduleGraph._getModuleGraphModule.mockReturnValue({
        outgoingConnections: [],
      });

      const mockHooks = {
        addContainerEntryDependency: { tap: jest.fn() },
        addFederationRuntimeDependency: { tap: jest.fn() },
        addRemoteDependency: { tap: jest.fn() },
      };

      jest
        .spyOn(FederationModulesPlugin, 'getCompilationHooks')
        .mockReturnValue(mockHooks as any);

      plugin.apply(compiler as Compiler);
      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      // Trigger container entry dependency
      const containerCallback =
        mockHooks.addContainerEntryDependency.tap.mock.calls[0][1];
      containerCallback(mockDependency);

      const optimizeChunksCallback =
        compilation.hooks.optimizeChunks.tap.mock.calls[0][1];
      optimizeChunksCallback(compilation.chunks);

      expect(compilation.chunkGraph.connectChunkAndModule).toHaveBeenCalled();
    });

    it('should handle runtime names provided as a string', () => {
      const runtimeChunk = {
        hasRuntime: jest.fn(() => true),
        name: 'runtime',
        runtime: 'main',
      };

      const mockModule = {
        identifier: () => 'test-module',
      };

      compilation.namedChunks.set('main', runtimeChunk as unknown as Chunk);
      compilation.chunks = [runtimeChunk];
      compilation.chunkGraph.getModuleChunks.mockReturnValue([]);
      compilation.chunkGraph.getModuleRuntimes.mockReturnValue(['main']);
      compilation.moduleGraph.getModule.mockReturnValue(mockModule);
      compilation.moduleGraph._getModuleGraphModule.mockReturnValue({
        outgoingConnections: [],
      });

      const mockHooks = {
        addContainerEntryDependency: { tap: jest.fn() },
        addFederationRuntimeDependency: { tap: jest.fn() },
        addRemoteDependency: { tap: jest.fn() },
      };

      jest
        .spyOn(FederationModulesPlugin, 'getCompilationHooks')
        .mockReturnValue(mockHooks as any);

      plugin.apply(compiler as Compiler);
      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      const runtimeCallback =
        mockHooks.addFederationRuntimeDependency.tap.mock.calls[0][1];
      runtimeCallback({ type: 'runtime' });

      const optimizeChunksCallback =
        compilation.hooks.optimizeChunks.tap.mock.calls[0][1];
      optimizeChunksCallback(compilation.chunks);

      expect(compilation.chunkGraph.connectChunkAndModule).toHaveBeenCalledWith(
        runtimeChunk,
        mockModule,
      );
    });

    it('should handle worker runtime dependencies separately', () => {
      const FederationWorkerRuntimeDependency =
        require('../../../src/lib/container/runtime/FederationWorkerRuntimeDependency').default;

      const workerDep = new FederationWorkerRuntimeDependency(
        'worker-entry.js',
      );
      const mockModule = {
        identifier: () => 'worker-module',
      };

      const runtimeChunk = {
        hasRuntime: jest.fn(() => true),
        name: 'worker-chunk',
        runtime: ['worker'],
      };

      compilation.chunks = [runtimeChunk];
      compilation.chunkGraph.getModuleChunks.mockReturnValue([runtimeChunk]);
      compilation.chunkGraph.getModuleRuntimes.mockReturnValue(['worker']);
      compilation.moduleGraph.getModule.mockReturnValue(mockModule);
      compilation.moduleGraph._getModuleGraphModule.mockReturnValue({
        outgoingConnections: [],
      });

      const mockHooks = {
        addContainerEntryDependency: { tap: jest.fn() },
        addFederationRuntimeDependency: { tap: jest.fn() },
        addRemoteDependency: { tap: jest.fn() },
      };

      jest
        .spyOn(FederationModulesPlugin, 'getCompilationHooks')
        .mockReturnValue(mockHooks as any);

      plugin.apply(compiler as Compiler);
      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      const runtimeCallback =
        mockHooks.addFederationRuntimeDependency.tap.mock.calls[0][1];
      runtimeCallback(workerDep);

      const optimizeChunksCallback =
        compilation.hooks.optimizeChunks.tap.mock.calls[0][1];
      optimizeChunksCallback(compilation.chunks);

      expect(compilation.moduleGraph.getModule).toHaveBeenCalledWith(workerDep);
    });
  });

  describe('cleanUpChunks', () => {
    it('should disconnect modules from non-runtime chunks', () => {
      const runtimeChunk = {
        hasRuntime: jest.fn(() => true),
        name: 'runtime',
      };
      const nonRuntimeChunk = {
        hasRuntime: jest.fn(() => false),
        name: 'normal',
      };

      const mockModule = {
        identifier: () => 'test-module',
      };

      compilation.chunks = [runtimeChunk, nonRuntimeChunk];
      compilation.chunkGraph.getModuleChunks.mockReturnValue([nonRuntimeChunk]);
      compilation.moduleGraph.getModule.mockReturnValue(mockModule);
      compilation.moduleGraph._getModuleGraphModule.mockReturnValue({
        outgoingConnections: [],
      });

      const mockHooks = {
        addContainerEntryDependency: { tap: jest.fn() },
        addFederationRuntimeDependency: { tap: jest.fn() },
        addRemoteDependency: { tap: jest.fn() },
      };

      jest
        .spyOn(FederationModulesPlugin, 'getCompilationHooks')
        .mockReturnValue(mockHooks as any);

      plugin.apply(compiler as Compiler);
      const thisCompilationCallback =
        compiler.hooks.thisCompilation.tap.mock.calls[0][1];
      thisCompilationCallback(compilation);

      const containerCallback =
        mockHooks.addContainerEntryDependency.tap.mock.calls[0][1];
      containerCallback({ type: 'container-entry' });

      const optimizeChunksCallback =
        compilation.hooks.optimizeChunks.tap.mock.calls[0][1];
      optimizeChunksCallback(compilation.chunks);

      expect(
        compilation.chunkGraph.disconnectChunkAndModule,
      ).toHaveBeenCalledWith(nonRuntimeChunk, mockModule);
    });
  });

  describe('getAllReferencedModules', () => {
    let mockCompilation: any;

    beforeEach(() => {
      mockCompilation = {
        moduleGraph: {
          getParentBlock: jest.fn(),
          _getModuleGraphModule: jest.fn(),
        },
      };
    });

    it('should collect all referenced modules with type "all"', () => {
      const mockModule = {
        identifier: () => 'root-module',
      };

      const connectedModule = {
        identifier: () => 'connected-module',
      };

      mockCompilation.moduleGraph._getModuleGraphModule.mockReturnValue({
        outgoingConnections: [
          {
            module: connectedModule,
            dependency: {},
          },
        ],
      });

      const result = getAllReferencedModules(
        mockCompilation,
        mockModule as Module,
        'all',
      );

      expect(result.has(mockModule as Module)).toBe(true);
      expect(result.has(connectedModule as Module)).toBe(true);
      expect(result.size).toBe(2);
    });

    it('should skip async blocks when type is "initial"', () => {
      const AsyncDependenciesBlock = require('webpack').AsyncDependenciesBlock;

      const mockModule = {
        identifier: () => 'root-module',
      };

      const asyncModule = {
        identifier: () => 'async-module',
      };

      const asyncBlock = new AsyncDependenciesBlock({}, null, 'async');

      mockCompilation.moduleGraph._getModuleGraphModule
        .mockReturnValueOnce({
          outgoingConnections: [
            {
              module: asyncModule,
              dependency: {},
            },
          ],
        })
        .mockReturnValueOnce({
          outgoingConnections: [],
        });

      mockCompilation.moduleGraph.getParentBlock.mockReturnValue(asyncBlock);

      const result = getAllReferencedModules(
        mockCompilation,
        mockModule as Module,
        'initial',
      );

      expect(result.has(mockModule as Module)).toBe(true);
      expect(result.has(asyncModule as Module)).toBe(false);
      expect(result.size).toBe(1);
    });

    it('should collect only external modules when type is "external"', () => {
      const ExternalModule = require('webpack').ExternalModule;

      const mockModule = {
        identifier: () => 'root-module',
      };

      const externalModule = new ExternalModule(
        'external-lib',
        'commonjs',
        'external-lib',
      );

      const normalModule = {
        identifier: () => 'normal-module',
      };

      mockCompilation.moduleGraph._getModuleGraphModule
        .mockReturnValueOnce({
          outgoingConnections: [
            {
              module: externalModule,
              dependency: {},
            },
            {
              module: normalModule,
              dependency: {},
            },
          ],
        })
        .mockReturnValue({
          outgoingConnections: [],
        });

      const result = getAllReferencedModules(
        mockCompilation,
        mockModule as Module,
        'external',
      );

      expect(result.has(mockModule as Module)).toBe(true);
      expect(result.has(externalModule as Module)).toBe(true);
      expect(result.has(normalModule as Module)).toBe(false);
    });

    it('should handle modules with no outgoing connections', () => {
      const mockModule = {
        identifier: () => 'isolated-module',
      };

      mockCompilation.moduleGraph._getModuleGraphModule.mockReturnValue({
        outgoingConnections: [],
      });

      const result = getAllReferencedModules(
        mockCompilation,
        mockModule as Module,
        'all',
      );

      expect(result.has(mockModule as Module)).toBe(true);
      expect(result.size).toBe(1);
    });

    it('should avoid circular references', () => {
      const moduleA = {
        identifier: () => 'module-a',
      };

      const moduleB = {
        identifier: () => 'module-b',
      };

      mockCompilation.moduleGraph._getModuleGraphModule.mockImplementation(
        (module: any) => {
          if (module === moduleA) {
            return {
              outgoingConnections: [
                {
                  module: moduleB,
                  dependency: {},
                },
              ],
            };
          } else if (module === moduleB) {
            return {
              outgoingConnections: [
                {
                  module: moduleA, // Circular reference
                  dependency: {},
                },
              ],
            };
          }
          return { outgoingConnections: [] };
        },
      );

      const result = getAllReferencedModules(
        mockCompilation,
        moduleA as Module,
        'all',
      );

      expect(result.has(moduleA as Module)).toBe(true);
      expect(result.has(moduleB as Module)).toBe(true);
      expect(result.size).toBe(2);
    });
  });
});
