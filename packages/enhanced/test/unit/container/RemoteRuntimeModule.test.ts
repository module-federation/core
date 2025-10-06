/*
 * @jest-environment node
 */

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from '../../../src/lib/container/runtime/utils';
import { createMockCompilation, MockModuleDependency } from './utils';
import type Chunk from 'webpack/lib/Chunk';
import type ChunkGraph from 'webpack/lib/ChunkGraph';
import type Module from 'webpack/lib/Module';
import type ModuleGraph from 'webpack/lib/ModuleGraph';
import type Dependency from 'webpack/lib/Dependency';
import type ExternalModule from 'webpack/lib/ExternalModule';
import type FallbackModule from '../../../src/lib/container/FallbackModule';

// Mock necessary dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
}));

jest.mock('../../../src/lib/container/runtime/utils', () => ({
  getFederationGlobalScope: jest.fn(() => '__FEDERATION__'),
}));

// Mock extractUrlAndGlobal utility
const mockExtractUrlAndGlobal = jest.fn();
jest.mock(
  'webpack/lib/util/extractUrlAndGlobal',
  () => mockExtractUrlAndGlobal,
  { virtual: true },
);

// Mock webpack with necessary utilities
jest.mock(
  'webpack',
  () => {
    const Template = {
      asString: jest.fn((strings) => strings.join('\n')),
    };

    class RuntimeModule {
      name: string;
      compilation: any;
      chunk: any;
      chunkGraph: any;

      constructor(name: string) {
        this.name = name;
      }

      generate() {
        return null;
      }
    }

    return {
      Template,
      RuntimeModule,
      RuntimeGlobals: {
        require: '__webpack_require__',
        ensureChunkHandlers: '__webpack_require__.e',
      },
    };
  },
  { virtual: true },
);

// Import the module under test after mocks are setup
const RemoteRuntimeModule =
  require('../../../src/lib/container/RemoteRuntimeModule').default;

type RemoteModuleMock = Module & {
  internalRequest: string;
  shareScope: string;
  dependencies: Dependency[];
};

type ExternalModuleMock = ExternalModule & {
  request: string;
  dependencies: Dependency[];
  externalType: string;
};

type FallbackModuleMock = FallbackModule & {
  dependencies: Dependency[];
  requests: boolean;
};

type ModuleIdMock = jest.MockedFunction<
  (module: Module) => string | number | undefined
>;

describe('RemoteRuntimeModule', () => {
  let mockCompilation: ReturnType<
    typeof createMockCompilation
  >['mockCompilation'];
  let mockChunkGraph: ReturnType<
    typeof createMockCompilation
  >['mockChunkGraph'];
  let mockModuleGraph: ReturnType<
    typeof createMockCompilation
  >['mockModuleGraph'];
  let mockRuntimeTemplate: ReturnType<
    typeof createMockCompilation
  >['mockRuntimeTemplate'];
  let mockChunk: Chunk;
  let remoteRuntimeModule: InstanceType<typeof RemoteRuntimeModule>;
  let chunkModulesBySourceTypeMock: jest.MockedFunction<
    NonNullable<ChunkGraph['getChunkModulesIterableBySourceType']>
  >;
  let moduleIdMock: ModuleIdMock;
  let moduleGraphGetModuleMock: jest.MockedFunction<ModuleGraph['getModule']>;

  beforeEach(() => {
    jest.clearAllMocks();
    const mocks = createMockCompilation();
    mockCompilation = mocks.mockCompilation;
    mockChunkGraph = mocks.mockChunkGraph;
    mockModuleGraph = mocks.mockModuleGraph;
    mockRuntimeTemplate = mocks.mockRuntimeTemplate;

    chunkModulesBySourceTypeMock =
      mockChunkGraph.getChunkModulesIterableBySourceType as unknown as jest.MockedFunction<
        NonNullable<ChunkGraph['getChunkModulesIterableBySourceType']>
      >;
    moduleIdMock = mockChunkGraph.getModuleId as unknown as ModuleIdMock;
    moduleGraphGetModuleMock =
      mockModuleGraph.getModule as unknown as jest.MockedFunction<
        ModuleGraph['getModule']
      >;

    const secondaryChunk = {
      id: 'chunk2',
    } as Partial<Chunk> as Chunk;

    mockChunk = {
      id: 'chunk1',
      getAllReferencedChunks: jest.fn(),
    } as Partial<Chunk> as Chunk;

    (mockChunk.getAllReferencedChunks as jest.Mock).mockReturnValue(
      new Set<Chunk>([mockChunk, secondaryChunk]),
    );

    remoteRuntimeModule = new RemoteRuntimeModule();
    remoteRuntimeModule.compilation = mockCompilation;
    remoteRuntimeModule.chunkGraph = mockChunkGraph as unknown as ChunkGraph;
    remoteRuntimeModule.chunk = mockChunk;
  });

  describe('constructor', () => {
    it('should initialize with the correct name', () => {
      expect(remoteRuntimeModule.name).toBe('remotes loading');
    });
  });

  describe('generate', () => {
    it('should return scaffold when no remote modules are found (snapshot)', () => {
      // Mock no modules found
      chunkModulesBySourceTypeMock.mockReturnValue(undefined);

      // Call generate and check result
      const result = remoteRuntimeModule.generate();

      // Compare normalized output to stable expected string
      const { normalizeCode } = require('../../helpers/snapshots');
      const normalized = normalizeCode(result as string);

      expect(normalized).toContain(
        '__webpack_require__.e.remotes = function(chunkId, promises) { if(!__FEDERATION__.bundlerRuntime || !__FEDERATION__.bundlerRuntime.remotes){',
      );
      expect(normalized).toContain(
        "throw new Error('Module Federation: bundler runtime is required to load remote chunk \"' + chunkId + '\".');",
      );
      expect(normalized).toContain(
        '__FEDERATION__.bundlerRuntime.remotes({idToRemoteMap,chunkMapping, idToExternalAndNameMapping, chunkId, promises, webpackRequire:__webpack_require__}); }',
      );
    });

    it('should process remote modules and generate correct runtime code', () => {
      // Mock RemoteModule instances
      const remoteDependency1 = new MockModuleDependency(
        'remote-dep-1',
      ) as unknown as Dependency;
      const remoteDependency2 = new MockModuleDependency(
        'remote-dep-2',
      ) as unknown as Dependency;

      const mockRemoteModule1 = {
        internalRequest: './component1',
        shareScope: 'default',
        dependencies: [remoteDependency1],
      } as unknown as RemoteModuleMock;

      const mockRemoteModule2 = {
        internalRequest: './component2',
        shareScope: 'custom',
        dependencies: [remoteDependency2],
      } as unknown as RemoteModuleMock;

      // Mock external modules
      const mockExternalModule1 = {
        externalType: 'script',
        request: 'app1@http://localhost:3001/remoteEntry.js',
        dependencies: [] as Dependency[],
      } as unknown as ExternalModuleMock;

      const mockExternalModule2 = {
        externalType: 'var',
        request: 'app2',
        dependencies: [] as Dependency[],
      } as unknown as ExternalModuleMock;

      // Mock the extractUrlAndGlobal function
      mockExtractUrlAndGlobal.mockImplementation((request) => {
        if (request === 'app1@http://localhost:3001/remoteEntry.js') {
          return ['http://localhost:3001/remoteEntry.js', 'app1'];
        }
        throw new Error('Unable to extract');
      });

      // Setup module IDs
      moduleIdMock.mockImplementation((module) => {
        if (module === mockRemoteModule1) return 'module1';
        if (module === mockRemoteModule2) return 'module2';
        if (module === mockExternalModule1) return 'external1';
        if (module === mockExternalModule2) return 'external2';
        return undefined;
      });

      // Setup moduleGraph to return external modules
      moduleGraphGetModuleMock.mockImplementation((dep) => {
        if (dep === remoteDependency1) return mockExternalModule1;
        if (dep === remoteDependency2) return mockExternalModule2;
        return null;
      });

      // Setup mock modules for each chunk
      chunkModulesBySourceTypeMock.mockImplementation((chunk, type) => {
        if (type === 'remote') {
          if (chunk.id === 'chunk1') return [mockRemoteModule1];
          if (chunk.id === 'chunk2') return [mockRemoteModule2];
        }
        return undefined;
      });

      // Call generate and check result
      const result = remoteRuntimeModule.generate();

      // Verify the generated code contains the expected mappings
      expect(result).toContain('"chunk1": [');
      expect(result).toContain('"module1"');
      expect(result).toContain('"chunk2": [');
      expect(result).toContain('"module2"');

      // Verify idToExternalAndNameMapping contains correct data
      expect(result).toContain('"module1": [');
      expect(result).toContain('"default"');
      expect(result).toContain('"./component1"');
      expect(result).toContain('"external1"');

      expect(result).toContain('"module2": [');
      expect(result).toContain('"custom"');
      expect(result).toContain('"./component2"');
      expect(result).toContain('"external2"');

      // Verify idToRemoteMap contains correct data
      expect(result).toContain('"module1": [');
      expect(result).toContain('"externalType": "script"');
      expect(result).toContain('"name": "app1"');

      expect(result).toContain('"module2": [');
      expect(result).toContain('"externalType": "var"');
      expect(result).toContain('"name": ""');

      // Verify federation global scope is used
      expect(result).toContain('__FEDERATION__.bundlerRuntimeOptions.remotes');
      expect(result).toContain('__FEDERATION__.bundlerRuntime.remotes');
    });

    it('should handle fallback modules with requests', () => {
      // Mock RemoteModule instance
      const remoteDependency = new MockModuleDependency(
        'remote-dep',
      ) as unknown as Dependency;
      const fallbackDependency1 = new MockModuleDependency(
        'fallback-dep-1',
      ) as unknown as Dependency;
      const fallbackDependency2 = new MockModuleDependency(
        'fallback-dep-2',
      ) as unknown as Dependency;

      const mockRemoteModule = {
        internalRequest: './component',
        shareScope: 'default',
        dependencies: [remoteDependency],
      } as unknown as RemoteModuleMock;

      // Mock fallback module with requests
      const mockFallbackModule = {
        requests: true,
        dependencies: [fallbackDependency1, fallbackDependency2],
      } as unknown as FallbackModuleMock;

      // Mock external modules
      const mockExternalModule1 = {
        externalType: 'script',
        request: 'app1@http://localhost:3001/remoteEntry.js',
        dependencies: [] as Dependency[],
      } as unknown as ExternalModuleMock;

      const mockExternalModule2 = {
        externalType: 'var',
        request: 'app2',
        dependencies: [] as Dependency[],
      } as unknown as ExternalModuleMock;

      // Mock the extractUrlAndGlobal function
      mockExtractUrlAndGlobal.mockImplementation((request) => {
        if (request === 'app1@http://localhost:3001/remoteEntry.js') {
          return ['http://localhost:3001/remoteEntry.js', 'app1'];
        }
        throw new Error('Unable to extract');
      });

      // Setup module IDs
      moduleIdMock.mockImplementation((module) => {
        if (module === mockRemoteModule) return 'module1';
        if (module === mockFallbackModule) return 'fallback1';
        if (module === mockExternalModule1) return 'external1';
        if (module === mockExternalModule2) return 'external2';
        return undefined;
      });

      // Setup moduleGraph to return modules
      moduleGraphGetModuleMock.mockImplementation((dep) => {
        if (dep === remoteDependency) return mockFallbackModule;
        if (dep === fallbackDependency1) return mockExternalModule1;
        if (dep === fallbackDependency2) return mockExternalModule2;
        return null;
      });

      // Setup mock modules for each chunk
      chunkModulesBySourceTypeMock.mockImplementation((chunk, type) => {
        if (type === 'remote' && chunk.id === 'chunk1') {
          return [mockRemoteModule];
        }
        return undefined;
      });

      // Call generate and check result
      const result = remoteRuntimeModule.generate();

      // Verify the generated code contains the expected mappings
      expect(result).toContain('"chunk1": [');
      expect(result).toContain('"module1"');

      // Verify idToRemoteMap contains entries for both external modules
      expect(result).toContain('"module1": [');
      expect(result).toContain('"externalType": "script"');
      expect(result).toContain('"name": "app1"');
      expect(result).toContain('"externalType": "var"');
      expect(result).toContain('"name": ""');
    });

    it('should handle extractUrlAndGlobal errors gracefully', () => {
      // Mock RemoteModule instance
      const remoteDependency = new MockModuleDependency(
        'remote-dep',
      ) as unknown as Dependency;

      const mockRemoteModule = {
        internalRequest: './component',
        shareScope: 'default',
        dependencies: [remoteDependency],
      } as unknown as RemoteModuleMock;

      // Mock external module that will cause extractUrlAndGlobal to throw
      const mockExternalModule = {
        externalType: 'script',
        request: 'invalid-format',
        dependencies: [] as Dependency[],
      } as unknown as ExternalModuleMock;

      // Mock extractUrlAndGlobal to throw an error
      mockExtractUrlAndGlobal.mockImplementation(() => {
        throw new Error('Invalid format');
      });

      // Setup module IDs
      moduleIdMock.mockImplementation((module) => {
        if (module === mockRemoteModule) return 'module1';
        if (module === mockExternalModule) return 'external1';
        return undefined;
      });

      // Setup moduleGraph to return external module
      moduleGraphGetModuleMock.mockImplementation((dep) => {
        if (dep === remoteDependency) return mockExternalModule;
        return null;
      });

      // Setup mock modules for each chunk
      chunkModulesBySourceTypeMock.mockImplementation((chunk, type) => {
        if (type === 'remote' && chunk.id === 'chunk1') {
          return [mockRemoteModule];
        }
        return undefined;
      });

      // Call generate and check result
      const result = remoteRuntimeModule.generate();

      // Verify the generated code contains the expected mappings with empty name
      expect(result).toContain('"module1": [');
      expect(result).toContain('"externalType": "script"');
      expect(result).toContain('"name": ""');
    });
  });
});
