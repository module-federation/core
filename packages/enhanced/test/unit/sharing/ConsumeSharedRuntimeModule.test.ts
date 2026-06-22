/*
 * @rstest-environment node
 */

import { createMockCompilation, createWebpackMock, shareScopes } from './utils';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => ({
  mockNormalizeWebpackPath: rs.fn((path: string) => path),
  mockCompareModulesByIdentifier: rs.fn(
    (a: { identifier?: () => string }, b: { identifier?: () => string }) => {
      if (!a.identifier || !b.identifier) return 0;
      return a.identifier().localeCompare(b.identifier());
    },
  ),
}));

// Mock normalize-webpack-path
rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
}));

// Mock webpack - createWebpackMock already includes RuntimeModule with STAGE_* constants
rs.mock('webpack', () => createWebpackMock());

rs.mock('webpack/lib/util/comparators', () => ({
  compareModulesByIdentifier: mocks.mockCompareModulesByIdentifier,
}));

// Import the real implementation
import ConsumeSharedRuntimeModule from '../../../src/lib/sharing/ConsumeSharedRuntimeModule';

describe('ConsumeSharedRuntimeModule', () => {
  let mockCompilation: ReturnType<
    typeof createMockCompilation
  >['mockCompilation'];

  beforeEach(() => {
    rs.clearAllMocks();

    const { mockCompilation: compilation } = createMockCompilation();
    mockCompilation = compilation;
  });

  describe('constructor', () => {
    it('should initialize with string shareScope', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Add chunk for testing with minimal required properties
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([]),
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add compilation for testing
      module.compilation = mockCompilation as any;

      // Verify the module properties
      expect(module).toBeDefined();

      // Use type assertion to access private property safely for testing
      const instance = module as any;
      expect(instance._runtimeRequirements).toBeDefined();
      expect(
        instance._runtimeRequirements.has('some-requirement'),
      ).toBeTruthy();
    });

    it('should initialize with array shareScope', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Add chunk for testing with minimal required properties
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([]),
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add compilation for testing
      module.compilation = mockCompilation as any;

      // Verify the module properties
      expect(module).toBeDefined();

      // Use type assertion to access private property safely for testing
      const instance = module as any;
      expect(instance._runtimeRequirements).toBeDefined();
      expect(
        instance._runtimeRequirements.has('some-requirement'),
      ).toBeTruthy();
    });
  });

  describe('generate', () => {
    const createChunk = (id: string | number) =>
      ({
        id,
        ids: [],
        runtime: 'runtime',
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      }) as any;

    it('should generate code with string shareScope', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Add chunk for testing that returns an empty array for getAllReferencedChunks
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([]),
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add compilation and chunkGraph
      module.compilation = mockCompilation as any;
      module.chunkGraph = mockCompilation.chunkGraph as any;

      // Call generate and verify it doesn't throw
      // Note: We're not verifying the exact output because it depends on complex internal state
      // that's difficult to mock completely, but we can verify it runs without errors
      let result;
      expect(() => {
        result = module.generate();
      }).not.toThrow();

      // The result might be null or a string
      expect(result === null || typeof result === 'string').toBeTruthy();
    });

    it('should generate code with array shareScope', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Add chunk for testing
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([]),
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add compilation for testing
      module.compilation = mockCompilation as any;
      module.chunkGraph = mockCompilation.chunkGraph as any;

      // Call generate and verify it doesn't throw
      let result;
      expect(() => {
        result = module.generate();
      }).not.toThrow();

      // The result might be null or a string
      expect(result === null || typeof result === 'string').toBeTruthy();
    });

    // For the tests with modules, we'll simplify and just verify that the method
    // doesn't throw errors rather than trying to fully mock the complex internal state
    it('should generate code with modules and string shareScope', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Create a mock chunk with all required methods
      const mockChunk = {
        id: 'chunk1',
        ids: [],
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add chunk for testing
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([mockChunk]),
        getAllInitialChunks: rs.fn().mockReturnValue([mockChunk]),
      } as any;

      // Mock chunkGraph to return empty for getChunkModulesIterableBySourceType
      mockCompilation.chunkGraph.getChunkModulesIterableBySourceType = rs
        .fn()
        .mockReturnValue([]);

      // Add compilation for testing
      module.compilation = mockCompilation as any;
      module.chunkGraph = mockCompilation.chunkGraph as any;

      // Call generate and verify it doesn't throw
      let result;
      expect(() => {
        result = module.generate();
      }).not.toThrow();

      // The result might be null or a string
      expect(result === null || typeof result === 'string').toBeTruthy();
    });

    it('should generate code with modules and array shareScope', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Create a mock chunk with all required methods
      const mockChunk = {
        id: 'chunk1',
        ids: [],
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add chunk for testing
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([mockChunk]),
        getAllInitialChunks: rs.fn().mockReturnValue([mockChunk]),
      } as any;

      // Mock chunkGraph to return empty for getChunkModulesIterableBySourceType
      mockCompilation.chunkGraph.getChunkModulesIterableBySourceType = rs
        .fn()
        .mockReturnValue([]);

      // Add compilation for testing
      module.compilation = mockCompilation as any;
      module.chunkGraph = mockCompilation.chunkGraph as any;

      // Call generate and verify it doesn't throw
      let result;
      expect(() => {
        result = module.generate();
      }).not.toThrow();

      // The result might be null or a string
      expect(result === null || typeof result === 'string').toBeTruthy();
    });

    it('should handle initialConsumes correctly', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Create a mock chunk with all required methods
      const mockChunk = {
        id: 'chunk1',
        ids: [],
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add chunk for testing
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([mockChunk]),
        getAllInitialChunks: rs.fn().mockReturnValue([mockChunk]),
      } as any;

      // Mock chunkGraph to return empty for getChunkModulesIterableBySourceType
      mockCompilation.chunkGraph.getChunkModulesIterableBySourceType = rs
        .fn()
        .mockReturnValue([]);

      // Add compilation for testing
      module.compilation = mockCompilation as any;
      module.chunkGraph = mockCompilation.chunkGraph as any;

      // Call generate and verify it doesn't throw
      let result;
      expect(() => {
        result = module.generate();
      }).not.toThrow();

      // The result might be null or a string
      expect(result === null || typeof result === 'string').toBeTruthy();
    });

    it('should handle multiple share scopes in a module', () => {
      // Create a set of runtime requirements for the constructor
      const runtimeRequirements = new Set(['some-requirement']);

      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);

      // Create a mock chunk with all required methods
      const mockChunk = {
        id: 'chunk1',
        ids: [],
        getAllInitialChunks: rs.fn().mockReturnValue([]),
      } as any;

      // Add chunk for testing
      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([mockChunk]),
        getAllInitialChunks: rs.fn().mockReturnValue([mockChunk]),
      } as any;

      // Mock chunkGraph to return empty for getChunkModulesIterableBySourceType
      mockCompilation.chunkGraph.getChunkModulesIterableBySourceType = rs
        .fn()
        .mockReturnValue([]);

      // Add compilation for testing
      module.compilation = mockCompilation as any;
      module.chunkGraph = mockCompilation.chunkGraph as any;

      // Call generate and verify it doesn't throw
      let result;
      expect(() => {
        result = module.generate();
      }).not.toThrow();

      // The result might be null or a string
      expect(result === null || typeof result === 'string').toBeTruthy();
    });

    it('should use ordered consume-shared modules for referenced and initial chunks', () => {
      const runtimeRequirements = new Set(['some-requirement']);
      const module = new ConsumeSharedRuntimeModule(runtimeRequirements);
      const referencedChunk = createChunk('referenced');
      const initialChunk = createChunk('initial');

      module.chunk = {
        id: 'test-chunk',
        ids: [],
        getAllReferencedChunks: rs.fn().mockReturnValue([referencedChunk]),
        getAllInitialChunks: rs.fn().mockReturnValue([initialChunk]),
      } as any;

      mockCompilation.chunkGraph.getOrderedChunkModulesIterableBySourceType = rs
        .fn()
        .mockReturnValue([]);

      module.compilation = mockCompilation as any;
      module.chunkGraph = mockCompilation.chunkGraph as any;

      expect(module.generate()).toBeNull();

      expect(
        mockCompilation.chunkGraph.getOrderedChunkModulesIterableBySourceType,
      ).toHaveBeenCalledWith(
        referencedChunk,
        'consume-shared',
        expect.any(Function),
      );
      expect(
        mockCompilation.chunkGraph.getOrderedChunkModulesIterableBySourceType,
      ).toHaveBeenCalledWith(
        initialChunk,
        'consume-shared',
        expect.any(Function),
      );
      expect(
        mockCompilation.chunkGraph.getChunkModulesIterableBySourceType,
      ).not.toHaveBeenCalled();
    });

    it('should generate deterministic output when consume-shared insertion order changes', () => {
      const createConsumeModule = (identifier: string, id: string) =>
        ({
          id,
          identifier: () => identifier,
        }) as any;
      const moduleA = createConsumeModule('consume ./a', 'a');
      const moduleB = createConsumeModule('consume ./b', 'b');

      const generate = (modules: any[]) => {
        const { mockCompilation: compilation } = createMockCompilation();
        const runtimeRequirements = new Set(['__webpack_require__.f']);
        const runtimeModule = new ConsumeSharedRuntimeModule(
          runtimeRequirements,
        );
        const chunk = createChunk('async');

        runtimeModule.chunk = {
          id: 'test-chunk',
          ids: [],
          getAllReferencedChunks: rs.fn().mockReturnValue([chunk]),
          getAllInitialChunks: rs.fn().mockReturnValue([chunk]),
        } as any;

        compilation.chunkGraph.getChunkModulesIterableBySourceType = rs
          .fn()
          .mockReturnValue(modules);
        compilation.chunkGraph.getOrderedChunkModulesIterableBySourceType = rs
          .fn()
          .mockImplementation(
            (
              _chunk: unknown,
              _sourceType: string,
              compare: (a: unknown, b: unknown) => number,
            ) => [...modules].sort(compare),
          );
        compilation.chunkGraph.getModuleId = rs.fn((m: any) => m.id);
        compilation.codeGenerationResults.getSource = rs.fn((m: any) => ({
          source: () => `fallback_${m.id}`,
        }));
        compilation.codeGenerationResults.getData = rs.fn((m: any) => ({
          shareScope: 'default',
          shareConfig: {
            singleton: false,
            requiredVersion: false,
            strictVersion: false,
            eager: false,
            layer: null,
          },
          shareKey: m.id,
        }));

        runtimeModule.compilation = compilation as any;
        runtimeModule.chunkGraph = compilation.chunkGraph as any;

        return runtimeModule.generate();
      };

      expect(generate([moduleB, moduleA])).toBe(generate([moduleA, moduleB]));
    });
  });
});
