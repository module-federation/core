/*
 * @jest-environment node
 */

import EmbedFederationRuntimePlugin from '../../../src/lib/container/runtime/EmbedFederationRuntimePlugin';
import EmbedFederationRuntimeModule from '../../../src/lib/container/runtime/EmbedFederationRuntimeModule';
import type { Compiler, Compilation, Chunk } from 'webpack';
import { rs } from '@rstest/core';

const jest = rs;

class MockConcatSource {
  private readonly parts: any[];

  constructor(...parts: any[]) {
    this.parts = parts;
  }

  toString(): string {
    return this.parts
      .map((part) =>
        typeof part === 'string' ? part : (part?.toString?.() ?? String(part)),
      )
      .join('');
  }
}

// Mock dependencies
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
}));

const { RuntimeGlobals } = require('webpack') as typeof import('webpack');

describe('EmbedFederationRuntimePlugin', () => {
  let mockCompiler: any;
  let mockCompilation: any;
  let mockChunk: any;
  let runtimeRequirementInTreeHandler: any;
  let renderStartupHandler: any;
  let additionalRuntimeHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();
    renderStartupHandler = undefined;
    additionalRuntimeHandler = undefined;

    // Mock chunk
    mockChunk = {
      name: 'test-chunk',
      id: 'test-chunk-id',
      hasRuntime: jest.fn().mockReturnValue(true),
      getEntryOptions: jest.fn(),
    };

    // Mock compilation
    mockCompilation = {
      outputOptions: {
        chunkLoading: 'jsonp',
      },
      addRuntimeModule: jest.fn(),
      compiler: {}, // Required by FederationModulesPlugin validation
      hooks: {
        processAssets: {
          tap: jest.fn(),
        },
        runtimeRequirementInTree: {
          for: jest.fn((requirement: string) => ({
            tap: jest.fn((pluginName: string, handler: Function) => {
              runtimeRequirementInTreeHandler = handler;
            }),
          })),
        },
        additionalChunkRuntimeRequirements: {
          tap: jest.fn((_pluginName: string, handler: Function) => {
            additionalRuntimeHandler = handler;
          }),
        },
      },
    };

    // Mock compiler
    mockCompiler = {
      webpack: {
        RuntimeModule: class MockRuntimeModule {
          static STAGE_NORMAL = 0;
          static STAGE_BASIC = 5;
          static STAGE_ATTACH = 10;
          static STAGE_TRIGGER = 20;
        },
        sources: {
          ConcatSource: MockConcatSource,
        },
        javascript: {
          JavascriptModulesPlugin: {
            getCompilationHooks: jest.fn().mockReturnValue({
              renderStartup: {
                tap: jest.fn((_pluginName: string, handler: Function) => {
                  renderStartupHandler = handler;
                }),
              },
            }),
          },
        },
      },
      hooks: {
        thisCompilation: {
          tap: jest.fn((pluginName: string, handler: Function) => {
            handler(mockCompilation);
          }),
          taps: [],
        },
      },
    };
  });

  describe('stage selection based on chunk loading type', () => {
    it('should use STAGE_ATTACH (10) for JSONP chunks', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      // Mock chunk with JSONP loading
      mockChunk.getEntryOptions.mockReturnValue({
        chunkLoading: 'jsonp',
      });

      const runtimeRequirements = new Set(['__webpack_require__.federation']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1);
      const addedModule = mockCompilation.addRuntimeModule.mock.calls[0][1];
      expect(addedModule).toBeInstanceOf(EmbedFederationRuntimeModule);
      expect(addedModule.stage).toBe(10); // STAGE_ATTACH
    });

    it('should use STAGE_BASIC (5) for import-scripts chunks (workers)', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      // Mock chunk with import-scripts loading
      mockChunk.getEntryOptions.mockReturnValue({
        chunkLoading: 'import-scripts',
      });

      const runtimeRequirements = new Set(['__webpack_require__.federation']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1);
      const addedModule = mockCompilation.addRuntimeModule.mock.calls[0][1];
      expect(addedModule).toBeInstanceOf(EmbedFederationRuntimeModule);
      expect(addedModule.stage).toBe(5); // STAGE_BASIC
    });

    it('should use STAGE_ATTACH (10) for other chunk loading types', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      // Mock chunk with async-node loading
      mockChunk.getEntryOptions.mockReturnValue({
        chunkLoading: 'async-node',
      });

      const runtimeRequirements = new Set(['__webpack_require__.federation']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1);
      const addedModule = mockCompilation.addRuntimeModule.mock.calls[0][1];
      expect(addedModule).toBeInstanceOf(EmbedFederationRuntimeModule);
      expect(addedModule.stage).toBe(10); // STAGE_ATTACH
    });

    it('should fallback to global chunkLoading when entry options is undefined', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      // Mock chunk with no entry options
      mockChunk.getEntryOptions.mockReturnValue(undefined);
      mockCompilation.outputOptions.chunkLoading = 'jsonp';

      const runtimeRequirements = new Set(['__webpack_require__.federation']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1);
      const addedModule = mockCompilation.addRuntimeModule.mock.calls[0][1];
      expect(addedModule.stage).toBe(10); // STAGE_ATTACH for JSONP
    });

    it('should fallback to global chunkLoading when entry chunkLoading is undefined', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      // Mock chunk with entry options but no chunkLoading
      mockChunk.getEntryOptions.mockReturnValue({});
      mockCompilation.outputOptions.chunkLoading = 'import-scripts';

      const runtimeRequirements = new Set(['__webpack_require__.federation']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1);
      const addedModule = mockCompilation.addRuntimeModule.mock.calls[0][1];
      expect(addedModule.stage).toBe(5); // STAGE_BASIC for import-scripts
    });

    it('should prefer entry chunkLoading over global chunkLoading', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      // Entry options has import-scripts, global is jsonp
      mockChunk.getEntryOptions.mockReturnValue({
        chunkLoading: 'import-scripts',
      });
      mockCompilation.outputOptions.chunkLoading = 'jsonp';

      const runtimeRequirements = new Set(['__webpack_require__.federation']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1);
      const addedModule = mockCompilation.addRuntimeModule.mock.calls[0][1];
      expect(addedModule.stage).toBe(5); // STAGE_BASIC for import-scripts from entry options
    });
  });

  describe('runtime requirement handling', () => {
    it('should not add runtime module when federation requirement is missing', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      const runtimeRequirements = new Set(['other-requirement']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(mockCompilation.addRuntimeModule).not.toHaveBeenCalled();
    });

    it('should add embeddedFederationRuntime requirement after adding module', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      mockChunk.getEntryOptions.mockReturnValue({ chunkLoading: 'jsonp' });

      const runtimeRequirements = new Set(['__webpack_require__.federation']);
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);

      expect(runtimeRequirements.has('embeddedFederationRuntime')).toBe(true);
    });

    it('should not add module twice for same chunk', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      mockChunk.getEntryOptions.mockReturnValue({ chunkLoading: 'jsonp' });

      const runtimeRequirements = new Set(['__webpack_require__.federation']);

      // First call
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);
      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1);

      // Second call with embeddedFederationRuntime already present
      runtimeRequirementInTreeHandler(mockChunk, runtimeRequirements);
      expect(mockCompilation.addRuntimeModule).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('renderStartup hook', () => {
    it('appends a startup call when the chunk would otherwise skip startup', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      expect(typeof renderStartupHandler).toBe('function');

      const runtimeRequirements = new Set<string>();
      const chunkGraph = {
        getTreeRuntimeRequirements: jest.fn(() => runtimeRequirements),
        getNumberOfEntryModules: jest.fn(() => 0),
      };

      const startupSource = {
        toString: () => '/* bootstrap */',
      };

      const result = renderStartupHandler(startupSource, undefined, {
        chunk: mockChunk,
        chunkGraph,
      });

      expect(result).not.toBe(startupSource);
      expect(result.toString()).toContain(`${RuntimeGlobals.startup}()`);
    });

    it('returns the original startup source when runtime already triggers startup', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      const runtimeRequirements = new Set<string>();
      const chunkGraph = {
        getTreeRuntimeRequirements: jest.fn(() => runtimeRequirements),
        getNumberOfEntryModules: jest.fn(() => 1),
      };

      const startupSource = {
        toString: () => '/* bootstrap */',
      };

      const result = renderStartupHandler(startupSource, undefined, {
        chunk: mockChunk,
        chunkGraph,
      });

      expect(result).toBe(startupSource);
    });
  });

  describe('additional runtime requirements', () => {
    it('registers startupOnlyBefore for eligible chunks', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      expect(typeof additionalRuntimeHandler).toBe('function');

      const runtimeRequirements = new Set<string>();
      additionalRuntimeHandler(mockChunk, runtimeRequirements);

      expect(runtimeRequirements.has(RuntimeGlobals.startupOnlyBefore)).toBe(
        true,
      );
    });

    it('skips startupOnlyBefore when the chunk has no runtime', () => {
      const plugin = new EmbedFederationRuntimePlugin();
      plugin.apply(mockCompiler as Compiler);

      mockChunk.hasRuntime.mockReturnValue(false);

      const runtimeRequirements = new Set<string>();
      additionalRuntimeHandler(mockChunk, runtimeRequirements);

      expect(runtimeRequirements.size).toBe(0);
    });
  });

  describe('plugin initialization', () => {
    it('should not double-tap if already applied', () => {
      const plugin = new EmbedFederationRuntimePlugin();

      // Mock existing tap
      mockCompiler.hooks.thisCompilation.taps = [
        { name: 'EmbedFederationRuntimePlugin' },
      ];

      const tapSpy = jest.spyOn(mockCompiler.hooks.thisCompilation, 'tap');
      plugin.apply(mockCompiler as Compiler);

      expect(tapSpy).not.toHaveBeenCalled();
    });

    it('should tap into thisCompilation if not already applied', () => {
      const plugin = new EmbedFederationRuntimePlugin();

      mockCompiler.hooks.thisCompilation.taps = [];

      const tapSpy = jest.spyOn(mockCompiler.hooks.thisCompilation, 'tap');
      plugin.apply(mockCompiler as Compiler);

      expect(tapSpy).toHaveBeenCalledWith(
        'EmbedFederationRuntimePlugin',
        expect.any(Function),
      );
    });
  });
});
