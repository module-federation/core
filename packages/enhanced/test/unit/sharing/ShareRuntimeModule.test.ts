/*
 * @jest-environment node
 */

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from '../../../src/lib/container/runtime/utils';
import { shareScopes, createMockCompilation, createWebpackMock } from './utils';

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
}));

jest.mock('../../../src/lib/container/runtime/utils', () => ({
  getFederationGlobalScope: jest.fn(() => '__FEDERATION__'),
}));

// Mock webpack
const webpack = createWebpackMock();
jest.mock('webpack', () => webpack, { virtual: true });

jest.mock(
  'webpack/lib/util/comparators',
  () => ({
    compareModulesByIdentifier: jest.fn((a, b) => {
      if (!a.identifier || !b.identifier) return 0;
      return a.identifier().localeCompare(b.identifier());
    }),
  }),
  { virtual: true },
);

// Import module after mocks
const ShareRuntimeModule =
  require('../../../src/lib/sharing/ShareRuntimeModule').default;

describe('ShareRuntimeModule', () => {
  let mockCompilation: ReturnType<
    typeof createMockCompilation
  >['mockCompilation'];
  let mockChunkGraph: ReturnType<
    typeof createMockCompilation
  >['mockChunkGraph'];

  beforeEach(() => {
    jest.clearAllMocks();
    const { mockCompilation: compilation, mockChunkGraph: chunkGraph } =
      createMockCompilation();
    mockCompilation = compilation;
    mockChunkGraph = chunkGraph;

    // Configure chunkGraph for ShareRuntimeModule
    mockChunkGraph.getChunkModulesIterableBySourceType.mockReturnValue([]);
    mockChunkGraph.getOrderedChunkModulesIterableBySourceType.mockReturnValue(
      [],
    );
  });

  describe('constructor', () => {
    it('should initialize with the correct name and stage', () => {
      const runtimeModule = new ShareRuntimeModule();
      expect(runtimeModule.name).toBe('sharing');
      expect(runtimeModule.stage).toBe(7);
    });
  });

  describe('generate', () => {
    it('should generate code with string shareScope', () => {
      // Create mock modules
      const mockModule1 = { id: 'module1' };

      // Setup ShareRuntimeModule
      const runtimeModule = new ShareRuntimeModule();
      runtimeModule.compilation = mockCompilation;
      runtimeModule.chunkGraph = mockChunkGraph;

      // Mock chunk with getAllReferencedChunks
      const mockChunk = {
        getAllReferencedChunks: jest.fn().mockReturnValue([{ id: 'chunk1' }]),
      };
      runtimeModule.chunk = mockChunk as any;

      // Setup module data that will be returned by getOrderedChunkModulesIterableBySourceType
      mockChunkGraph.getOrderedChunkModulesIterableBySourceType.mockReturnValue(
        [mockModule1],
      );

      // Setup getData to return share-init data
      mockCompilation.codeGenerationResults.getData.mockImplementation(
        (module, runtime, type) => {
          if (type === 'share-init') {
            return [
              {
                shareScope: shareScopes.string,
                initStage: 10,
                init: 'register("react", "17.0.2", getter);',
              },
            ];
          } else if (type === 'share-init-option') {
            return {
              name: 'react',
              version: '"17.0.2"',
              getter: 'getter',
              shareScope: shareScopes.string,
              shareConfig: {
                singleton: true,
                eager: false,
                requiredVersion: '^17.0.0',
                strictVersion: true,
              },
            };
          }
          return null;
        },
      );

      // Generate the code
      const result = runtimeModule.generate();

      // Verify result contains expected strings for a string shareScope
      expect(result).toContain('__FEDERATION__');
      expect(result).toContain('initOptions.shared');
      expect(result).toContain('react');
      expect(result).toContain('17.0.2');
      expect(result).toContain('singleton');
    });

    it('should generate code with array shareScope', () => {
      // Create mock modules
      const mockModule1 = { id: 'module1' };

      // Setup ShareRuntimeModule
      const runtimeModule = new ShareRuntimeModule();
      runtimeModule.compilation = mockCompilation;
      runtimeModule.chunkGraph = mockChunkGraph;

      // Mock chunk with getAllReferencedChunks
      const mockChunk = {
        getAllReferencedChunks: jest.fn().mockReturnValue([{ id: 'chunk1' }]),
      };
      runtimeModule.chunk = mockChunk as any;

      // Setup module data that will be returned by getOrderedChunkModulesIterableBySourceType
      mockChunkGraph.getOrderedChunkModulesIterableBySourceType.mockReturnValue(
        [mockModule1],
      );

      // Setup getData to return share-init data with array shareScope
      mockCompilation.codeGenerationResults.getData.mockImplementation(
        (module, runtime, type) => {
          if (type === 'share-init') {
            return [
              {
                shareScope: shareScopes.array,
                initStage: 10,
                init: 'register("react", "17.0.2", getter);',
              },
            ];
          } else if (type === 'share-init-option') {
            return {
              name: 'react',
              version: '"17.0.2"',
              getter: 'getter',
              shareScope: shareScopes.array,
              shareConfig: {
                singleton: true,
                eager: false,
                requiredVersion: '^17.0.0',
                strictVersion: true,
              },
            };
          }
          return null;
        },
      );

      // Generate the code
      const result = runtimeModule.generate();

      // Verify result contains expected strings for an array shareScope
      expect(result).toContain('__FEDERATION__');
      expect(result).toContain('initOptions.shared');
      expect(result).toContain('react');
      expect(result).toContain('17.0.2');
      expect(result).toContain('scope');
    });

    it('should handle multiple share scopes', () => {
      // Create mock modules for different share scopes
      const mockModule1 = { id: 'module1' };
      const mockModule2 = { id: 'module2' };

      // Setup ShareRuntimeModule
      const runtimeModule = new ShareRuntimeModule();
      runtimeModule.compilation = mockCompilation;
      runtimeModule.chunkGraph = mockChunkGraph;

      // Mock chunk with getAllReferencedChunks returning multiple chunks
      const mockChunk = {
        getAllReferencedChunks: jest
          .fn()
          .mockReturnValue([{ id: 'chunk1' }, { id: 'chunk2' }]),
      };
      runtimeModule.chunk = mockChunk as any;

      // Setup module data that will be returned by getOrderedChunkModulesIterableBySourceType
      mockChunkGraph.getOrderedChunkModulesIterableBySourceType
        .mockReturnValueOnce([mockModule1])
        .mockReturnValueOnce([mockModule2]);

      // Setup getData to return different share-init data for each module
      mockCompilation.codeGenerationResults.getData.mockImplementation(
        (module, runtime, type) => {
          if (type === 'share-init') {
            if (module === mockModule1) {
              return [
                {
                  shareScope: shareScopes.string,
                  initStage: 10,
                  init: 'register("react", "17.0.2", getter1);',
                },
              ];
            } else if (module === mockModule2) {
              return [
                {
                  shareScope: 'custom',
                  initStage: 20,
                  init: 'register("lodash", "4.17.21", getter2);',
                },
              ];
            }
          } else if (type === 'share-init-option') {
            if (module === mockModule1) {
              return {
                name: 'react',
                version: '"17.0.2"',
                getter: 'getter1',
                shareScope: shareScopes.string,
                shareConfig: {
                  singleton: true,
                  eager: false,
                  requiredVersion: '^17.0.0',
                  strictVersion: true,
                },
              };
            } else if (module === mockModule2) {
              return {
                name: 'lodash',
                version: '"4.17.21"',
                getter: 'getter2',
                shareScope: 'custom',
                shareConfig: {
                  singleton: false,
                  eager: true,
                  requiredVersion: '^4.17.0',
                  strictVersion: false,
                },
              };
            }
          }
          return null;
        },
      );

      // Generate the code
      const result = runtimeModule.generate();

      // Verify result contains data for both shareScopes
      expect(result).toContain('__FEDERATION__');
      expect(result).toContain('initOptions.shared');
      expect(result).toContain('react');
      expect(result).toContain('lodash');
      expect(result).toContain('17.0.2');
      expect(result).toContain('4.17.21');
      expect(result).toContain('custom');
    });

    it('should handle modules with different versions', () => {
      // Create mock modules for different versions
      const mockModule1 = { id: 'module1' };
      const mockModule2 = { id: 'module2' };

      // Setup ShareRuntimeModule
      const runtimeModule = new ShareRuntimeModule();
      runtimeModule.compilation = mockCompilation;
      runtimeModule.chunkGraph = mockChunkGraph;

      // Mock chunk with getAllReferencedChunks
      const mockChunk = {
        getAllReferencedChunks: jest.fn().mockReturnValue([{ id: 'chunk1' }]),
      };
      runtimeModule.chunk = mockChunk as any;

      // Setup module data that will be returned by getOrderedChunkModulesIterableBySourceType
      mockChunkGraph.getOrderedChunkModulesIterableBySourceType.mockReturnValue(
        [mockModule1, mockModule2],
      );

      // Setup getData to return different versions for the same module
      mockCompilation.codeGenerationResults.getData.mockImplementation(
        (module, runtime, type) => {
          if (type === 'share-init') {
            if (module === mockModule1) {
              return [
                {
                  shareScope: shareScopes.string,
                  initStage: 10,
                  init: 'register("react", "17.0.2", getter1);',
                },
              ];
            } else if (module === mockModule2) {
              return [
                {
                  shareScope: shareScopes.string,
                  initStage: 20,
                  init: 'register("react", "18.0.0", getter2);',
                },
              ];
            }
          } else if (type === 'share-init-option') {
            if (module === mockModule1) {
              return {
                name: 'react',
                version: '"17.0.2"',
                getter: 'getter1',
                shareScope: shareScopes.string,
                shareConfig: {
                  singleton: true,
                  eager: false,
                  requiredVersion: '^17.0.0',
                  strictVersion: true,
                },
              };
            } else if (module === mockModule2) {
              return {
                name: 'react',
                version: '"18.0.0"',
                getter: 'getter2',
                shareScope: shareScopes.string,
                shareConfig: {
                  singleton: true,
                  eager: false,
                  requiredVersion: '^18.0.0',
                  strictVersion: true,
                },
              };
            }
          }
          return null;
        },
      );

      // Generate the code
      const result = runtimeModule.generate();

      // Verify result contains both versions
      expect(result).toContain('17.0.2');
      expect(result).toContain('18.0.0');
    });

    it('should handle modules with same version but different layers', () => {
      // Create mock modules for different layers
      const mockModule1 = { id: 'module1' };
      const mockModule2 = { id: 'module2' };

      // Setup ShareRuntimeModule
      const runtimeModule = new ShareRuntimeModule();
      runtimeModule.compilation = mockCompilation;
      runtimeModule.chunkGraph = mockChunkGraph;

      // Mock chunk with getAllReferencedChunks
      const mockChunk = {
        getAllReferencedChunks: jest.fn().mockReturnValue([{ id: 'chunk1' }]),
      };
      runtimeModule.chunk = mockChunk as any;

      // Setup module data that will be returned by getOrderedChunkModulesIterableBySourceType
      mockChunkGraph.getOrderedChunkModulesIterableBySourceType.mockReturnValue(
        [mockModule1, mockModule2],
      );

      // Setup getData to return same version but different layers
      mockCompilation.codeGenerationResults.getData.mockImplementation(
        (module, runtime, type) => {
          if (type === 'share-init') {
            if (module === mockModule1) {
              return [
                {
                  shareScope: shareScopes.string,
                  initStage: 10,
                  init: 'register("lodash", "1.0.0", getter1);',
                },
              ];
            } else if (module === mockModule2) {
              return [
                {
                  shareScope: shareScopes.string,
                  initStage: 20,
                  init: 'register("lodash", "1.0.0", getter2);',
                },
              ];
            }
          } else if (type === 'share-init-option') {
            if (module === mockModule1) {
              return {
                name: 'lodash',
                version: '"1.0.0"',
                getter: 'getter1',
                shareScope: shareScopes.string,
                shareConfig: {
                  singleton: true,
                  eager: false,
                  requiredVersion: '^1.0.0',
                  strictVersion: true,
                  layer: 'layer1',
                },
              };
            } else if (module === mockModule2) {
              return {
                name: 'lodash',
                version: '"1.0.0"',
                getter: 'getter2',
                shareScope: shareScopes.string,
                shareConfig: {
                  singleton: true,
                  eager: false,
                  requiredVersion: '^1.0.0',
                  strictVersion: true,
                  layer: 'layer2',
                },
              };
            }
          }
          return null;
        },
      );

      // Generate the code
      const result = runtimeModule.generate();

      // Verify result contains layer information
      expect(result).toContain('"layer"');
      expect(result).toContain('layer1');
      expect(result).toContain('layer2');
    });
  });
});
