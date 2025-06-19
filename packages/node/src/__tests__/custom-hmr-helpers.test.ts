import {
  applyInMemoryHotUpdate,
  applyHotUpdateFromStringsByPatching,
} from '../utils/custom-hmr-helpers';
import { createHMRRuntime } from '../utils/hmr-runtime';
import type { ModuleObject, HMRWebpackRequire } from '../types/hmr';

describe('Custom HMR Helpers Integration Tests', () => {
  let mockWebpackRequire: HMRWebpackRequire;
  let mockModule: ModuleObject;
  let originalConsoleLog: typeof console.log;
  let logMessages: string[];

  beforeAll(() => {
    // Capture console.log for testing
    originalConsoleLog = console.log;
    logMessages = [];
    console.log = (...args: any[]) => {
      logMessages.push(args.join(' '));
      originalConsoleLog(...args);
    };
  });

  afterAll(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    logMessages = [];

    // Enhanced mock webpack require for integration testing
    mockWebpackRequire = {
      h: jest.fn(() => 'integration-test-hash'),
      hmrS_readFileVm: {
        index: 0,
        main: 0,
        vendor: 0,
      },
      c: {
        './src/index.js': {
          id: './src/index.js',
          hot: {
            _selfAccepted: true,
            _selfInvalidated: false,
            status: jest.fn(() => 'idle'),
            _disposeHandlers: [],
            _acceptedDependencies: {},
            _acceptedErrorHandlers: {},
            _declinedDependencies: {},
            _requireSelf: jest.fn(),
            active: true,
          } as any,
          parents: [],
          children: [],
        },
      },
      m: {
        './src/index.js': jest.fn((module: any, exports: any, require: any) => {
          module.exports = { test: true };
        }),
      },
      hmrD: {},
      hmrF: jest.fn(() => 'integration-test-hash'),
      hmrI: {},
      hmrC: {},
      hmrM: jest.fn(),
      o: jest.fn((obj: any, key: string) => Object.prototype.hasOwnProperty.call(obj, key)),
      f: {},
      setInMemoryManifest: jest.fn(),
      setInMemoryChunk: jest.fn(),
    } as any;

    // Mock module with hot support
    mockModule = {
      hot: {
        status: jest.fn(() => 'idle'),
        check: jest.fn(async (autoApply: boolean) => {
          if (autoApply) {
            // Simulate successful HMR application
            return ['./src/index.js'];
          }
          return true;
        }),
        apply: jest.fn(async () => {
          return ['./src/index.js'];
        }),
        _selfAccepted: false,
        _selfDeclined: false,
        _selfInvalidated: false,
        _acceptedDependencies: {},
        _declinedDependencies: {},
        _acceptedErrorHandlers: {},
        _disposeHandlers: [],
        _main: false,
        active: true,
      } as any,
      exports: {},
    };

    // Set up global mocks
    (global as any).__webpack_require__ = mockWebpackRequire;
    (global as any).module = mockModule;
  });

  afterEach(() => {
    // Clean up global state
    delete (global as any).__webpack_require__;
    delete (global as any).module;
  });

  describe('applyInMemoryHotUpdate', () => {
    it('should successfully apply HMR update with valid data', async () => {
      const manifestJsonString = JSON.stringify({
        h: 'test-hash-123',
        c: ['index'],
        r: [],
        m: ['./src/index.js'],
      });

      const chunkJsStringsMap = {
        index: `
          exports.modules = {
            './src/index.js': function(module, exports, require) {
              module.exports = { updated: true, timestamp: ${Date.now()} };
            }
          };
          exports.runtime = function(__webpack_require__) {
            console.log('HMR runtime executed for test');
          };
        `,
      };

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      expect(result).toEqual(['./src/index.js']);
      expect(mockWebpackRequire.setInMemoryManifest).toHaveBeenCalledWith(manifestJsonString);
      expect(mockWebpackRequire.setInMemoryChunk).toHaveBeenCalledWith('index', chunkJsStringsMap.index);
      expect(mockModule.hot?.check).toHaveBeenCalledWith(true);
    });

    it('should handle missing module.hot gracefully', async () => {
      delete mockModule.hot;

      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = { index: 'test content' };

      await expect(applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      )).rejects.toThrow('[HMR] Hot Module Replacement is disabled.');
    });

    it('should handle missing webpack require gracefully', async () => {
      await expect(applyInMemoryHotUpdate(
        mockModule,
        null,
        '{}',
        {}
      )).rejects.toThrow('[HMR] __webpack_require__ is not available.');
    });

    it('should inject runtime when setInMemoryManifest is not available', async () => {
      delete mockWebpackRequire.setInMemoryManifest;
      delete mockWebpackRequire.setInMemoryChunk;

      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = { index: 'test content' };

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      expect(result).toEqual(['./src/index.js']);
      expect(mockWebpackRequire.setInMemoryManifest).toBeDefined();
      expect(mockWebpackRequire.setInMemoryChunk).toBeDefined();
    });

    it('should handle HMR check failures', async () => {
      mockModule.hot!.check = jest.fn().mockRejectedValue(new Error('HMR check failed'));

      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = { index: 'test content' };

      await expect(applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      )).rejects.toThrow('HMR check failed');
    });

    it('should handle non-idle HMR status', async () => {
      mockModule.hot!.status = jest.fn(() => 'prepare');

      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = { index: 'test content' };

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      expect(result).toEqual([]);
      expect(mockModule.hot?.check).not.toHaveBeenCalled();
    });

    it('should handle null check results', async () => {
      mockModule.hot!.check = jest.fn().mockResolvedValue(null);

      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = { index: 'test content' };

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      expect(result).toEqual([]);
    });
  });

  describe('applyHotUpdateFromStringsByPatching (backward compatibility)', () => {
    it('should be an alias for applyInMemoryHotUpdate', () => {
      expect(applyHotUpdateFromStringsByPatching).toBe(applyInMemoryHotUpdate);
    });
  });

  describe('HMR Runtime Integration', () => {
    it('should work with createHMRRuntime', async () => {
      const installedChunks = { index: 0 };
      const inMemoryChunks = {
        index: `
          exports.modules = {
            './src/runtime-test.js': function(module, exports, require) {
              module.exports = { runtimeIntegration: true };
            }
          };
          exports.runtime = function(__webpack_require__) {
            console.log('Runtime integration test executed');
          };
        `,
      };
      const manifestRef = {
        value: JSON.stringify({
          h: 'runtime-integration-hash',
          c: ['index'],
          r: [],
          m: ['./src/runtime-test.js'],
        }),
      };

      const hmrRuntime = createHMRRuntime(
        mockWebpackRequire,
        installedChunks,
        inMemoryChunks,
        manifestRef
      );

      // Set up HMR handlers
      mockWebpackRequire.hmrI['readFileVm'] = hmrRuntime.hmrHandlers.hmrI;
      mockWebpackRequire.hmrC['readFileVm'] = hmrRuntime.hmrHandlers.hmrC;
      mockWebpackRequire.hmrM = hmrRuntime.hmrManifestLoader;
      mockWebpackRequire.setInMemoryManifest = jest.fn((content: string) => {
        manifestRef.value = content;
      });
      mockWebpackRequire.setInMemoryChunk = jest.fn((chunkId: string, content: string) => {
        (inMemoryChunks as any)[chunkId] = content;
      });

      const manifestJsonString = JSON.stringify({
        h: 'updated-hash',
        c: ['index'],
        r: [],
        m: ['./src/runtime-test.js'],
      });

      const chunkJsStringsMap = {
        index: `
          exports.modules = {
            './src/runtime-test.js': function(module, exports, require) {
              module.exports = { runtimeIntegration: true, updated: true };
            }
          };
          exports.runtime = function(__webpack_require__) {
            console.log('Updated runtime integration test executed');
          };
        `,
      };

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      expect(result).toEqual(['./src/index.js']);
      expect(mockWebpackRequire.setInMemoryManifest).toHaveBeenCalledWith(manifestJsonString);
      expect(mockWebpackRequire.setInMemoryChunk).toHaveBeenCalledWith('index', chunkJsStringsMap.index);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed manifest JSON', async () => {
      const manifestJsonString = 'invalid json {';
      const chunkJsStringsMap = { index: 'test content' };

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      expect(result).toEqual(['./src/index.js']); // Should still work with patched runtime
    });

    it('should handle empty chunk map', async () => {
      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: [],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = {};

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      expect(result).toEqual(['./src/index.js']);
    });

    it('should handle HMR status transitions', async () => {
      let statusCallCount = 0;
      mockModule.hot!.status = jest.fn(() => {
        statusCallCount++;
        return statusCallCount === 1 ? 'idle' : 'prepare';
      });

      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = { index: 'test content' };

      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      // First call checks status and finds it's idle, proceeds with check()
      // Subsequent calls may find it in prepare state
      expect(Array.isArray(result)).toBe(true);
      expect(mockModule.hot?.status).toHaveBeenCalled();
    });

    it('should log appropriate messages during HMR process', async () => {
      const manifestJsonString = JSON.stringify({
        h: 'test-hash',
        c: ['index'],
        r: [],
        m: [],
      });
      const chunkJsStringsMap = { index: 'test content' };

      await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );

      const logMessage = logMessages.find(msg => 
        msg.includes('[Custom HMR Helper] Current HMR status:')
      );
      expect(logMessage).toBeDefined();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large chunk updates efficiently', async () => {
      const largeChunkContent = `
        exports.modules = {
          ${Array.from({ length: 100 }, (_, i) => 
            `'./src/module-${i}.js': function(module, exports, require) {
              module.exports = { id: ${i}, updated: true };
            }`
          ).join(',\n')}
        };
        exports.runtime = function(__webpack_require__) {
          console.log('Large chunk runtime executed');
        };
      `;

      const manifestJsonString = JSON.stringify({
        h: 'large-test-hash',
        c: ['large-chunk'],
        r: [],
        m: Array.from({ length: 100 }, (_, i) => `./src/module-${i}.js`),
      });

      const chunkJsStringsMap = {
        'large-chunk': largeChunkContent,
      };

      const startTime = Date.now();
      const result = await applyInMemoryHotUpdate(
        mockModule,
        mockWebpackRequire,
        manifestJsonString,
        chunkJsStringsMap
      );
      const endTime = Date.now();

      expect(result).toEqual(['./src/index.js']);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent updates', async () => {
      const updates = Array.from({ length: 5 }, (_, i) => ({
        manifest: JSON.stringify({
          h: `concurrent-hash-${i}`,
          c: [`chunk-${i}`],
          r: [],
          m: [`./src/concurrent-module-${i}.js`],
        }),
        chunks: {
          [`chunk-${i}`]: `
            exports.modules = {
              './src/concurrent-module-${i}.js': function(module, exports, require) {
                module.exports = { id: ${i}, concurrent: true };
              }
            };
            exports.runtime = function(__webpack_require__) {
              console.log('Concurrent runtime ${i} executed');
            };
          `,
        },
      }));

      const promises = updates.map(update =>
        applyInMemoryHotUpdate(
          mockModule,
          mockWebpackRequire,
          update.manifest,
          update.chunks
        )
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toEqual(['./src/index.js']);
      });
    });
  });
});