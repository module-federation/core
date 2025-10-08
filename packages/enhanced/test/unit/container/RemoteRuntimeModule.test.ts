/*
 * @jest-environment node
 */

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from '../../../src/lib/container/runtime/utils';
import { createMockCompilation } from './utils';

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

describe('RemoteRuntimeModule', () => {
  let mockCompilation: any;
  let mockChunkGraph: any;
  let mockModuleGraph: any;
  let mockRuntimeTemplate: any;
  let mockChunk: any;
  let remoteRuntimeModule: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock runtime template
    mockRuntimeTemplate = {
      basicFunction: jest.fn(
        (args, body) =>
          `function(${args}) { ${Array.isArray(body) ? body.join('\n') : body} }`,
      ),
    };

    // Setup mock compilation
    mockCompilation = {
      runtimeTemplate: mockRuntimeTemplate,
      moduleGraph: {},
    };

    // Mock chunkGraph and moduleGraph
    mockChunkGraph = {
      getChunkModulesIterableBySourceType: jest.fn(),
      getModuleId: jest.fn(),
    };

    mockModuleGraph = {
      getModule: jest.fn(),
    };

    mockCompilation.moduleGraph = mockModuleGraph;

    // Mock chunk with necessary functionality
    mockChunk = {
      id: 'chunk1',
      getAllReferencedChunks: jest
        .fn()
        .mockReturnValue(new Set([{ id: 'chunk1' }, { id: 'chunk2' }])),
    };

    // Create the RemoteRuntimeModule instance
    remoteRuntimeModule = new RemoteRuntimeModule();
    remoteRuntimeModule.compilation = mockCompilation;
    remoteRuntimeModule.chunkGraph = mockChunkGraph;
    remoteRuntimeModule.chunk = mockChunk;
  });

  describe('constructor', () => {
    it('should initialize with the correct name', () => {
      expect(remoteRuntimeModule.name).toBe('remotes loading');
    });
  });

  describe('generate', () => {
    it('should return null when no remote modules are found', () => {
      // Mock no modules found
      mockChunkGraph.getChunkModulesIterableBySourceType.mockReturnValue(null);

      // Call generate and check result
      const result = remoteRuntimeModule.generate();

      // Verify Template.asString was called with expected arguments
      expect(result).toContain('var chunkMapping = {}');
      expect(result).toContain('var idToExternalAndNameMapping = {}');
      expect(result).toContain('var idToRemoteMap = {}');
    });

    it('should process remote modules and generate correct runtime code', () => {
      // Mock RemoteModule instances
      const mockRemoteModule1 = {
        internalRequest: './component1',
        shareScope: 'default',
        dependencies: [
          {
            /* mock dependency */
          },
        ],
      };

      const mockRemoteModule2 = {
        internalRequest: './component2',
        shareScope: 'custom',
        dependencies: [
          {
            /* mock dependency */
          },
        ],
      };

      // Mock external modules
      const mockExternalModule1 = {
        externalType: 'script',
        request: 'app1@http://localhost:3001/remoteEntry.js',
        dependencies: [],
      };

      const mockExternalModule2 = {
        externalType: 'var',
        request: 'app2',
        dependencies: [],
      };

      // Mock the extractUrlAndGlobal function
      mockExtractUrlAndGlobal.mockImplementation((request) => {
        if (request === 'app1@http://localhost:3001/remoteEntry.js') {
          return ['http://localhost:3001/remoteEntry.js', 'app1'];
        }
        throw new Error('Unable to extract');
      });

      // Setup module IDs
      mockChunkGraph.getModuleId.mockImplementation((module) => {
        if (module === mockRemoteModule1) return 'module1';
        if (module === mockRemoteModule2) return 'module2';
        if (module === mockExternalModule1) return 'external1';
        if (module === mockExternalModule2) return 'external2';
        return undefined;
      });

      // Setup moduleGraph to return external modules
      mockModuleGraph.getModule.mockImplementation((dep) => {
        if (dep === mockRemoteModule1.dependencies[0])
          return mockExternalModule1;
        if (dep === mockRemoteModule2.dependencies[0])
          return mockExternalModule2;
        return null;
      });

      // Setup mock modules for each chunk
      mockChunkGraph.getChunkModulesIterableBySourceType.mockImplementation(
        (chunk, type) => {
          if (type === 'remote') {
            if (chunk.id === 'chunk1') return [mockRemoteModule1];
            if (chunk.id === 'chunk2') return [mockRemoteModule2];
          }
          return null;
        },
      );

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
      const mockRemoteModule = {
        internalRequest: './component',
        shareScope: 'default',
        dependencies: [
          {
            /* mock dependency */
          },
        ],
      };

      // Mock fallback module with requests
      const mockFallbackModule = {
        requests: true,
        dependencies: [
          {
            /* mock dependency 1 */
          },
          {
            /* mock dependency 2 */
          },
        ],
      };

      // Mock external modules
      const mockExternalModule1 = {
        externalType: 'script',
        request: 'app1@http://localhost:3001/remoteEntry.js',
        dependencies: [],
      };

      const mockExternalModule2 = {
        externalType: 'var',
        request: 'app2',
        dependencies: [],
      };

      // Mock the extractUrlAndGlobal function
      mockExtractUrlAndGlobal.mockImplementation((request) => {
        if (request === 'app1@http://localhost:3001/remoteEntry.js') {
          return ['http://localhost:3001/remoteEntry.js', 'app1'];
        }
        throw new Error('Unable to extract');
      });

      // Setup module IDs
      mockChunkGraph.getModuleId.mockImplementation((module) => {
        if (module === mockRemoteModule) return 'module1';
        if (module === mockFallbackModule) return 'fallback1';
        if (module === mockExternalModule1) return 'external1';
        if (module === mockExternalModule2) return 'external2';
        return undefined;
      });

      // Setup moduleGraph to return modules
      mockModuleGraph.getModule.mockImplementation((dep) => {
        if (dep === mockRemoteModule.dependencies[0]) return mockFallbackModule;
        if (dep === mockFallbackModule.dependencies[0])
          return mockExternalModule1;
        if (dep === mockFallbackModule.dependencies[1])
          return mockExternalModule2;
        return null;
      });

      // Setup mock modules for each chunk
      mockChunkGraph.getChunkModulesIterableBySourceType.mockImplementation(
        (chunk, type) => {
          if (type === 'remote' && chunk.id === 'chunk1') {
            return [mockRemoteModule];
          }
          return null;
        },
      );

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
      const mockRemoteModule = {
        internalRequest: './component',
        shareScope: 'default',
        dependencies: [
          {
            /* mock dependency */
          },
        ],
      };

      // Mock external module that will cause extractUrlAndGlobal to throw
      const mockExternalModule = {
        externalType: 'script',
        request: 'invalid-format',
        dependencies: [],
      };

      // Mock extractUrlAndGlobal to throw an error
      mockExtractUrlAndGlobal.mockImplementation(() => {
        throw new Error('Invalid format');
      });

      // Setup module IDs
      mockChunkGraph.getModuleId.mockImplementation((module) => {
        if (module === mockRemoteModule) return 'module1';
        if (module === mockExternalModule) return 'external1';
        return undefined;
      });

      // Setup moduleGraph to return external module
      mockModuleGraph.getModule.mockImplementation((dep) => {
        if (dep === mockRemoteModule.dependencies[0]) return mockExternalModule;
        return null;
      });

      // Setup mock modules for each chunk
      mockChunkGraph.getChunkModulesIterableBySourceType.mockImplementation(
        (chunk, type) => {
          if (type === 'remote' && chunk.id === 'chunk1') {
            return [mockRemoteModule];
          }
          return null;
        },
      );

      // Call generate and check result
      const result = remoteRuntimeModule.generate();

      // Verify the generated code contains the expected mappings with empty name
      expect(result).toContain('"module1": [');
      expect(result).toContain('"externalType": "script"');
      expect(result).toContain('"name": ""');
    });
  });
});
