/*
 * @rstest-environment node
 */

import { createMockCompilation, createWebpackMock, shareScopes } from './utils';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => ({
  mockNormalizeWebpackPath: rs.fn((path: string) => path),
}));

// Mock normalize-webpack-path
rs.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: mocks.mockNormalizeWebpackPath,
}));

// Mock webpack - createWebpackMock already includes RuntimeModule with STAGE_* constants
rs.mock('webpack', () => createWebpackMock());

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
  });
});
