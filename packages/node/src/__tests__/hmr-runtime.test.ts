import * as fs from 'fs';
import * as path from 'path';
import {
  createHMRRuntime,
  createApplyHandler,
  createLoadUpdateChunk,
  createHMRManifestLoader,
  createHMRHandlers,
} from '../utils/hmr-runtime';
import type {
  HMRWebpackRequire,
  HMRState,
  ApplyOptions,
  InstalledChunks,
  InMemoryChunks,
  ManifestRef,
} from '../types/hmr';

describe('Advanced HMR Runtime Tests', () => {
  let mockWebpackRequire: HMRWebpackRequire;
  let originalWebpackRequire: any;
  let testDistDir: string;

  beforeAll(() => {
    originalWebpackRequire = (global as any).__webpack_require__;
    
    // Create test HMR update files in test dist directory for filesystem testing
    testDistDir = path.join(__dirname, 'test-dist');
    
    // Ensure test dist directory exists
    if (!fs.existsSync(testDistDir)) {
      fs.mkdirSync(testDistDir, { recursive: true });
    }
    
    // Create sample HMR update files
    const sampleUpdateContent = `
      exports.modules = {
        './src/test-module.js': function(module, exports, require) {
          module.exports = { updated: true, timestamp: ${Date.now()} };
        }
      };
      exports.runtime = function(__webpack_require__) {
        console.log('Test HMR runtime executed');
      };
    `;
    
    fs.writeFileSync(path.join(testDistDir, 'index.hot-update.js'), sampleUpdateContent);
    fs.writeFileSync(path.join(testDistDir, 'vendor.hot-update.js'), sampleUpdateContent);
    fs.writeFileSync(path.join(testDistDir, 'main.hot-update.js'), sampleUpdateContent);
    fs.writeFileSync(path.join(testDistDir, 'test-chunk.hot-update.js'), sampleUpdateContent);
    
    // Create test manifest file
    const testManifestContent = JSON.stringify({
      h: 'fs-test-hash',
      c: ['fs-chunk'],
      r: [],
      m: ['fs-module']
    });
    fs.writeFileSync(path.join(testDistDir, 'test.hot-update.json'), testManifestContent);
  });

  afterAll(() => {
    if (originalWebpackRequire) {
      (global as any).__webpack_require__ = originalWebpackRequire;
    } else {
      delete (global as any).__webpack_require__;
    }
    
    // Clean up test HMR update files
    const testFiles = [
      'index.hot-update.js',
      'vendor.hot-update.js', 
      'main.hot-update.js',
      'test-chunk.hot-update.js',
      'test.hot-update.json'
    ];
    
    testFiles.forEach(file => {
      const filePath = path.join(testDistDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    // Remove test directory
    if (fs.existsSync(testDistDir)) {
      fs.rmSync(testDistDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    mockWebpackRequire = {
      h: jest.fn(() => 'runtime-test-hash'),
      hmrS_readFileVm: { index: 0, vendor: 0 },
      c: {},
      m: {
        './src/test-module.js': function(module: any, exports: any, require: any) {
          module.exports = { test: true };
        }
      },
      hmrD: {},
      hmrF: jest.fn(() => path.relative(path.join(__dirname, '..', 'utils'), path.join(testDistDir, 'test.hot-update.json'))),
      hmrI: {},
      hmrC: {},
      hmrM: jest.fn(),
      o: jest.fn((obj: any, key: string) => Object.prototype.hasOwnProperty.call(obj, key)),
      f: {
        readFileVmHmr: jest.fn((chunkId: string, promises: Promise<any>[]) => {
          promises.push(Promise.resolve());
          return Promise.resolve();
        })
      },
      hu: jest.fn((chunkId: string) => path.relative(path.join(__dirname, '..', 'utils'), path.join(testDistDir, `${chunkId}.hot-update.js`))),
      setInMemoryManifest: jest.fn(),
      setInMemoryChunk: jest.fn(),
    } as any;

    (global as any).__webpack_require__ = mockWebpackRequire;
  });

  afterEach(() => {
    delete (global as any).__webpack_require__;
  });

  describe('createLoadUpdateChunk', () => {
    it('should load chunk from in-memory storage when available', async () => {
      const inMemoryChunks: InMemoryChunks = {
        'memory-chunk': `
          exports.modules = {
            './src/memory-module.js': function(module, exports, require) {
              module.exports = { fromMemory: true };
            }
          };
          exports.runtime = function(__webpack_require__) {
            console.log('Memory chunk runtime executed');
          };
        `
      };
      
      // Initialize state as hmrC would do
      const state: HMRState = {
        currentUpdate: {}, // This needs to be initialized for loadUpdateChunk to work
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
        currentUpdateChunks: undefined,
      };

      const loadUpdateChunk = createLoadUpdateChunk(mockWebpackRequire, inMemoryChunks, state);

      await loadUpdateChunk('memory-chunk');

      expect(state.currentUpdate!['./src/memory-module.js']).toBeDefined();
      expect(state.currentUpdateRuntime).toHaveLength(1);
    });

    it('should load chunk from filesystem when not in memory', async () => {
      const inMemoryChunks: InMemoryChunks = {};
      // Initialize state as hmrC would do  
      const state: HMRState = {
        currentUpdate: {}, // This needs to be initialized for loadUpdateChunk to work
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
        currentUpdateChunks: undefined,
      };

      const loadUpdateChunk = createLoadUpdateChunk(mockWebpackRequire, inMemoryChunks, state);

      await loadUpdateChunk('index');

      expect(state.currentUpdate!['./src/test-module.js']).toBeDefined();
      expect(state.currentUpdateRuntime).toHaveLength(1);
    });

    it('should handle file read errors gracefully', async () => {
      const inMemoryChunks: InMemoryChunks = {};
      // Initialize state as hmrC would do
      const state: HMRState = {
        currentUpdate: {}, // This needs to be initialized for loadUpdateChunk to work
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
        currentUpdateChunks: undefined,
      };

      // Mock hu to return a non-existent file
      mockWebpackRequire.hu = jest.fn(() => path.relative(path.join(__dirname, '..', 'utils'), path.join(testDistDir, 'non-existent-file.js')));

      const loadUpdateChunk = createLoadUpdateChunk(mockWebpackRequire, inMemoryChunks, state);

      await expect(loadUpdateChunk('non-existent')).rejects.toThrow();
    });
  });

  describe('createApplyHandler', () => {
    it('should create apply handler that processes module updates', () => {
      const installedChunks: InstalledChunks = {};
      const state: HMRState = {
        currentUpdate: {
          './src/test-module.js': function(module: any, exports: any, require: any) {
            module.exports = { updated: true };
          }
        },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
        currentUpdateChunks: undefined,
      };

      const applyHandler = createApplyHandler(mockWebpackRequire, installedChunks, state);
      const options: ApplyOptions = {
        ignoreUnaccepted: false,
        ignoreDeclined: false,
        ignoreErrored: false,
        onUnaccepted: jest.fn(),
        onDeclined: jest.fn(),
        onErrored: jest.fn(),
      };

      const result = applyHandler(options);

      expect(result).toHaveProperty('dispose');
      expect(result).toHaveProperty('apply');
      expect(typeof result.dispose).toBe('function');
      expect(typeof result.apply).toBe('function');
    });

    it('should handle module disposal correctly', () => {
      const installedChunks: InstalledChunks = {};
      const state: HMRState = {
        currentUpdate: {
          './src/test-module.js': false as any // false indicates module removal
        },
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: ['test-chunk'],
        currentUpdateChunks: undefined,
      };

      // Set up mock module with dispose handlers
      const mockDisposeHandler = jest.fn();
      mockWebpackRequire.c = {
        './src/test-module.js': {
          id: './src/test-module.js',
          hot: {
            _disposeHandlers: [mockDisposeHandler],
            active: true,
            status: jest.fn(() => 'idle'),
            check: jest.fn(),
            accept: jest.fn(),
            decline: jest.fn(),
            dispose: jest.fn(),
            addDisposeHandler: jest.fn(),
            removeDisposeHandler: jest.fn(),
            _selfAccepted: false,
            _selfDeclined: false,
            _selfInvalidated: false,
            _acceptedDependencies: {},
            _declinedDependencies: {},
            _acceptedErrorHandlers: {},
            _main: false,
            _requireSelf: jest.fn(),
          } as any,
          children: [],
          parents: [],
        }
      };

      const applyHandler = createApplyHandler(mockWebpackRequire, installedChunks, state);
      const options: ApplyOptions = {
        ignoreUnaccepted: false,
        ignoreDeclined: false,
        ignoreErrored: false,
      };

      const result = applyHandler(options);
      result.dispose?.();

      expect(mockDisposeHandler).toHaveBeenCalled();
    });
  });

  describe('createHMRManifestLoader', () => {
    it('should load manifest from in-memory storage when available', async () => {
      const manifestRef: ManifestRef = {
        value: JSON.stringify({
          h: 'test-hash',
          c: ['test-chunk'],
          r: [],
          m: ['test-module']
        })
      };

      const hmrManifestLoader = createHMRManifestLoader(mockWebpackRequire, manifestRef);
      const manifest = await hmrManifestLoader();

      expect(manifest).toHaveProperty('h', 'test-hash');
      expect(manifest).toHaveProperty('c');
      expect(manifest?.c).toContain('test-chunk');
    });

    it('should load manifest from filesystem when not in memory', async () => {
      const manifestRef: ManifestRef = { value: null };

      const hmrManifestLoader = createHMRManifestLoader(mockWebpackRequire, manifestRef);
      const manifest = await hmrManifestLoader();

      expect(manifest).toHaveProperty('h', 'fs-test-hash');
    });

    it('should handle missing manifest file gracefully', async () => {
      const manifestRef: ManifestRef = { value: null };
      
      // Mock hmrF to return a non-existent file
      mockWebpackRequire.hmrF = jest.fn(() => path.relative(path.join(__dirname, '..', 'utils'), path.join(testDistDir, 'non-existent-manifest.json')));

      const hmrManifestLoader = createHMRManifestLoader(mockWebpackRequire, manifestRef);
      const manifest = await hmrManifestLoader();

      expect(manifest).toBeUndefined();
    });

    it('should handle invalid JSON gracefully', async () => {
      const manifestRef: ManifestRef = {
        value: 'invalid json content'
      };

      const hmrManifestLoader = createHMRManifestLoader(mockWebpackRequire, manifestRef);

      await expect(hmrManifestLoader()).rejects.toThrow();
    });
  });

  describe('createHMRHandlers', () => {
    it('should create HMR handlers with hmrI and hmrC functions', () => {
      const installedChunks: InstalledChunks = {};
      const inMemoryChunks: InMemoryChunks = {};
      const state: HMRState = {
        currentUpdate: {},
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
        currentUpdateChunks: undefined,
      };

      const loadUpdateChunk = createLoadUpdateChunk(mockWebpackRequire, inMemoryChunks, state);
      const applyHandler = createApplyHandler(mockWebpackRequire, installedChunks, state);
      const hmrHandlers = createHMRHandlers(
        mockWebpackRequire,
        installedChunks,
        loadUpdateChunk,
        applyHandler,
        state
      );

      expect(hmrHandlers).toHaveProperty('hmrI');
      expect(hmrHandlers).toHaveProperty('hmrC');
      expect(typeof hmrHandlers.hmrI).toBe('function');
      expect(typeof hmrHandlers.hmrC).toBe('function');
    });

    it('should handle hmrI calls correctly', () => {
      const installedChunks: InstalledChunks = {};
      const inMemoryChunks: InMemoryChunks = {};
      const state: HMRState = {
        currentUpdate: undefined,
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
        currentUpdateChunks: undefined,
      };

      const loadUpdateChunk = createLoadUpdateChunk(mockWebpackRequire, inMemoryChunks, state);
      const applyHandler = createApplyHandler(mockWebpackRequire, installedChunks, state);
      const hmrHandlers = createHMRHandlers(
        mockWebpackRequire,
        installedChunks,
        loadUpdateChunk,
        applyHandler,
        state
      );

      const applyHandlers: any[] = [];
      hmrHandlers.hmrI('./src/test-module.js', applyHandlers);

      expect(state.currentUpdate).toBeDefined();
      expect(applyHandlers).toHaveLength(1);
    });

    it('should handle hmrC calls correctly', () => {
      const installedChunks: InstalledChunks = { 'test-chunk': 0 };
      const inMemoryChunks: InMemoryChunks = {};
      const state: HMRState = {
        currentUpdate: {},
        currentUpdateRuntime: [],
        currentUpdateRemovedChunks: [],
        currentUpdateChunks: undefined,
      };

      const loadUpdateChunk = createLoadUpdateChunk(mockWebpackRequire, inMemoryChunks, state);
      const applyHandler = createApplyHandler(mockWebpackRequire, installedChunks, state);
      const hmrHandlers = createHMRHandlers(
        mockWebpackRequire,
        installedChunks,
        loadUpdateChunk,
        applyHandler,
        state
      );

      const chunkIds = ['test-chunk'];
      const removedChunks = ['old-chunk'];
      const removedModules = ['./src/old-module.js'];
      const promises: Promise<any>[] = [];
      const applyHandlers: any[] = [];
      const updatedModulesList: string[] = [];

      hmrHandlers.hmrC(chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList);

      expect(state.currentUpdateChunks).toBeDefined();
      expect(state.currentUpdateRemovedChunks).toEqual(removedChunks);
      expect(promises).toHaveLength(1); // Should add a promise for the chunk
    });
  });

  describe('createHMRRuntime', () => {
    it('should create complete HMR runtime with all functions', () => {
      const installedChunks: InstalledChunks = {};
      const inMemoryChunks: InMemoryChunks = {};
      const manifestRef: ManifestRef = { value: null };

      const hmrRuntime = createHMRRuntime(
        mockWebpackRequire,
        installedChunks,
        inMemoryChunks,
        manifestRef
      );

      expect(hmrRuntime).toHaveProperty('loadUpdateChunk');
      expect(hmrRuntime).toHaveProperty('applyHandler');
      expect(hmrRuntime).toHaveProperty('hmrHandlers');
      expect(hmrRuntime).toHaveProperty('hmrManifestLoader');
      
      expect(typeof hmrRuntime.loadUpdateChunk).toBe('function');
      expect(typeof hmrRuntime.applyHandler).toBe('function');
      expect(typeof hmrRuntime.hmrManifestLoader).toBe('function');
      expect(hmrRuntime.hmrHandlers).toHaveProperty('hmrI');
      expect(hmrRuntime.hmrHandlers).toHaveProperty('hmrC');
    });

    it('should maintain shared state across all runtime functions', () => {
      const installedChunks: InstalledChunks = {};
      const inMemoryChunks: InMemoryChunks = {
        'shared-test': `
          exports.modules = {
            './src/shared-module.js': function(module, exports, require) {
              module.exports = { shared: true };
            }
          };
          exports.runtime = function(__webpack_require__) {
            console.log('Shared runtime executed');
          };
        `
      };
      const manifestRef: ManifestRef = { value: null };

      const hmrRuntime = createHMRRuntime(
        mockWebpackRequire,
        installedChunks,
        inMemoryChunks,
        manifestRef
      );

      // Test that state is shared between functions
      const applyHandlers: any[] = [];
      hmrRuntime.hmrHandlers.hmrI('./src/shared-module.js', applyHandlers);
      // Call hmrC which always adds an apply handler to test shared state
      hmrRuntime.hmrHandlers.hmrC(['shared-test'], [], [], [], applyHandlers, []);

      // The apply handler should be added by hmrC (hmrI doesn't add when currentUpdate already exists)
      expect(applyHandlers).toHaveLength(1);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete HMR update workflow', async () => {
      const installedChunks: InstalledChunks = { 'integration-test': 0 };
      const inMemoryChunks: InMemoryChunks = {
        'integration-test': `
          exports.modules = {
            './src/integration-module.js': function(module, exports, require) {
              module.exports = { integration: true, updated: true };
            }
          };
          exports.runtime = function(__webpack_require__) {
            console.log('Integration test runtime executed');
          };
        `
      };
      const manifestRef: ManifestRef = {
        value: JSON.stringify({
          h: 'integration-hash',
          c: ['integration-test'],
          r: [],
          m: ['./src/integration-module.js']
        })
      };

      const hmrRuntime = createHMRRuntime(
        mockWebpackRequire,
        installedChunks,
        inMemoryChunks,
        manifestRef
      );

      // 1. Load manifest
      const manifest = await hmrRuntime.hmrManifestLoader();
      expect(manifest).toHaveProperty('h', 'integration-hash');

      // 2. Process chunk updates via hmrC
      const promises: Promise<any>[] = [];
      const applyHandlers: any[] = [];
      const updatedModulesList: string[] = [];

      hmrRuntime.hmrHandlers.hmrC(
        ['integration-test'],
        [],
        [],
        promises,
        applyHandlers,
        updatedModulesList
      );

      // Wait for chunk loading to complete
      await Promise.all(promises);

      expect(updatedModulesList).toContain('./src/integration-module.js');
      expect(applyHandlers).toHaveLength(1);

      // 3. Apply the updates
      const applyOptions = {
        ignoreUnaccepted: false,
        ignoreDeclined: false,
        ignoreErrored: false,
      };

      const applyResult = applyHandlers[0](applyOptions);
      expect(applyResult).toHaveProperty('dispose');
      expect(applyResult).toHaveProperty('apply');

      // The module should be updated in webpack's module cache
      applyResult.apply(jest.fn());
      expect(mockWebpackRequire.m['./src/integration-module.js']).toBeDefined();
    });
  });
});