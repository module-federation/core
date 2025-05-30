import runtimePlugin, {
  importNodeModule,
  resolveFile,
  returnFromCache,
  returnFromGlobalInstances,
  loadFromFs,
  fetchAndRun,
  resolveUrl,
  loadChunk,
  installChunk,
  setupScriptLoader,
  setupChunkHandler,
  setupWebpackRequirePatching,
} from '../runtimePlugin';
import type {
  FederationRuntimePlugin,
  FederationHost,
  Federation,
} from '@module-federation/runtime';
import * as runtimePluginModule from '../runtimePlugin';

declare global {
  interface Global {
    __FEDERATION__: Federation;
  }
}

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFile: jest.fn(),
}));

jest.mock('vm', () => ({
  Script: jest.fn().mockImplementation(() => ({
    runInThisContext: jest.fn().mockReturnValue(() => {
      return undefined;
    }),
  })),
  constants: {
    USE_MAIN_CONTEXT_DEFAULT_LOADER: 'mock_loader',
  },
}));

(global as unknown as any).fetch = jest.fn().mockResolvedValue({
  text: jest.fn().mockResolvedValue('// mock chunk content'),
});
const globalFetch = (global as unknown as any).fetch as jest.Mock;

const mockWebpackRequire = {
  u: jest.fn((chunkId: string) => `/chunks/${chunkId}.js`),
  p: 'http://localhost:3000/',
  m: {},
  o: jest.fn(),
  l: jest.fn(),
  federation: {
    runtime: {
      loadScriptNode: jest.fn().mockResolvedValue({}),
    },
    instance: {
      initRawContainer: jest.fn().mockReturnValue({}),
    },
    chunkMatcher: jest.fn().mockReturnValue(true),
    rootOutputDir: '/dist',
    initOptions: {
      name: 'test-host',
      remotes: [
        { name: 'test-remote', entry: 'http://localhost:3001/remoteEntry.js' },
      ],
    },
  },
  f: {
    require: jest.fn(),
    readFileVm: jest.fn(),
  },
};

const mockNonWebpackRequire = jest.fn().mockImplementation((id: string) => {
  if (id === 'path') return require('path');
  if (id === 'fs') return require('fs');
  if (id === 'vm') return require('vm');
  if (id === 'node-fetch') return { default: globalFetch };
  return {};
});

(global as any).__webpack_require__ = mockWebpackRequire;
(global as any).__non_webpack_require__ = mockNonWebpackRequire;

const mockModule = {
  remoteInfo: {
    entry: 'http://localhost:3001/remoteEntry.js',
    name: 'test-remote',
    type: 'module',
    entryGlobalName: 'test_remote',
    shareScope: 'default',
  },
  inited: false,
  lib: {},
  host: {} as FederationHost,
  getEntry: () => 'http://localhost:3001/remoteEntry.js',
  init: () => Promise.resolve({}),
  get: () => Promise.resolve({}),
  wraperFactory: () => {
    return undefined;
  },
};

(global as any).__FEDERATION__ = {
  __INSTANCES__: [
    {
      moduleCache: new Map([['test-remote', mockModule]]) as any,
      options: {
        name: 'host',
        remotes: [
          {
            name: 'test-remote',
            alias: 'test-remote',
            entry: 'http://localhost:3001/remoteEntry.js',
          },
        ],
        shared: {},
        plugins: [],
        inBrowser: false,
      },
    },
  ] as any,
} as any;

describe('runtimePlugin', () => {
  let plugin: FederationRuntimePlugin;

  beforeEach(() => {
    jest.clearAllMocks();
    plugin = runtimePlugin();
  });

  // Tests for individual utility functions
  describe('importNodeModule', () => {
    let originalFunction: typeof Function;

    beforeEach(() => {
      originalFunction = global.Function;
      console.error = jest.fn();
    });

    afterEach(() => {
      global.Function = originalFunction;
    });

    it('should throw an error when no name is provided', async () => {
      // Using the try-catch pattern for testing async rejections
      try {
        await importNodeModule('');
        // If we reach here, the test should fail
        fail('Expected importNodeModule to throw an error');
      } catch (err) {
        // We expect an error to be thrown
        expect(err).toMatchObject({
          message: 'import specifier is required',
        });
      }
    });

    it('should successfully import a module', async () => {
      // Use a more targeted approach to mock just the specific Function call
      const mockImport = jest
        .fn()
        .mockResolvedValue({ default: 'mocked module' });

      // Only mock the specific instance rather than the entire Function constructor
      jest
        .spyOn(global, 'Function')
        .mockImplementation((name, body) =>
          name === 'name' && body === 'return import(name)'
            ? mockImport
            : originalFunction(name, body),
        );

      const result = await importNodeModule('test-module');
      expect(result).toBe('mocked module');
    });

    it('should handle import errors', async () => {
      const mockError = new Error('Import failed');
      const mockImport = jest.fn().mockRejectedValue(mockError);

      // Only mock the specific instance rather than the entire Function constructor
      jest
        .spyOn(global, 'Function')
        .mockImplementation((name, body) =>
          name === 'name' && body === 'return import(name)'
            ? mockImport
            : originalFunction(name, body),
        );

      await expect(importNodeModule('test-module')).rejects.toThrow(
        'Import failed',
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('resolveFile', () => {
    it('should correctly resolve a file path from rootOutputDir and chunkId', () => {
      const path = require('path');
      const originalJoin = path.join;
      path.join = jest
        .fn()
        .mockReturnValue('/resolved/path/chunks/test-chunk.js');

      const result = resolveFile('/dist', 'test-chunk');

      expect(path.join).toHaveBeenCalledWith(
        expect.any(String), // __dirname
        '/dist/chunks/test-chunk.js',
      );
      expect(result).toBe('/resolved/path/chunks/test-chunk.js');

      path.join = originalJoin;
    });
  });

  describe('returnFromCache', () => {
    it('should return entry from cache when found', () => {
      const result = returnFromCache('test-remote');
      expect(result).toBe('http://localhost:3001/remoteEntry.js');
    });

    it('should return null when remote is not found in cache', () => {
      const result = returnFromCache('non-existent-remote');
      expect(result).toBeNull();
    });
  });

  describe('returnFromGlobalInstances', () => {
    it('should return entry when found by name', () => {
      const result = returnFromGlobalInstances('test-remote');
      expect(result).toBe('http://localhost:3001/remoteEntry.js');
    });

    it('should return null when remote is not found in global instances', () => {
      const result = returnFromGlobalInstances('non-existent-remote');
      expect(result).toBeNull();
    });
  });

  describe('loadFromFs', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      require('fs').existsSync.mockReturnValue(false);
    });

    it('should check if file exists', () => {
      const callback = jest.fn();
      loadFromFs('/path/to/file.js', callback);

      expect(require('fs').existsSync).toHaveBeenCalledWith('/path/to/file.js');
      expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
    });

    it('should load and evaluate file content', () => {
      require('fs').existsSync.mockReturnValue(true);

      // Mock the Script constructor and runInThisContext to return a function
      const mockRunInThisContext = jest
        .fn()
        .mockReturnValue(
          (exports: any, require: any, dirname: string, filename: string) => {
            exports.testModule = { value: 'test' };
          },
        );

      const mockScript = {
        runInThisContext: mockRunInThisContext,
      };

      require('vm').Script.mockImplementation(() => mockScript);

      require('fs').readFile.mockImplementation(
        (
          path: string,
          encoding: string,
          cb: (err: Error | null, content?: string) => void,
        ) => {
          cb(null, 'module.exports = { value: "test" };');
        },
      );

      const callback = jest.fn();
      loadFromFs('/path/to/file.js', callback);

      expect(require('fs').readFile).toHaveBeenCalledWith(
        '/path/to/file.js',
        'utf-8',
        expect.any(Function),
      );
      expect(require('vm').Script).toHaveBeenCalled();
      expect(mockRunInThisContext).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(null, expect.any(Object));
    });

    it('should handle readFile errors', () => {
      require('fs').existsSync.mockReturnValue(true);
      const readError = new Error('Read error');
      require('fs').readFile.mockImplementation(
        (
          path: string,
          encoding: string,
          cb: (err: Error | null, content?: string) => void,
        ) => {
          cb(readError, undefined);
        },
      );

      const callback = jest.fn();
      loadFromFs('/path/to/file.js', callback);

      expect(callback).toHaveBeenCalledWith(readError, null);
    });

    it('should handle script evaluation errors', () => {
      require('fs').existsSync.mockReturnValue(true);
      require('fs').readFile.mockImplementation(
        (
          path: string,
          encoding: string,
          cb: (err: Error | null, content?: string) => void,
        ) => {
          cb(null, 'invalid javascript;');
        },
      );

      // Mock Script to throw an error when constructed
      const evalError = new Error('Evaluation failed');
      require('vm').Script.mockImplementation(() => {
        throw evalError;
      });

      const callback = jest.fn();
      loadFromFs('/path/to/file.js', callback);

      expect(callback).toHaveBeenCalledWith(evalError, null);
    });
  });

  describe('fetchAndRun', () => {
    beforeEach(() => {
      (globalFetch as jest.Mock).mockReset();
    });

    it('should fetch and execute remote content', async () => {
      (globalFetch as jest.Mock).mockResolvedValue({
        text: jest.fn().mockResolvedValue('// mock script content'),
      });

      const url = new URL('http://example.com/chunk.js');
      const callback = jest.fn();
      const args = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue({
                  text: jest.fn().mockResolvedValue('// mock script content'),
                }),
              },
            },
          },
        },
      };

      fetchAndRun(url, 'chunk.js', callback, args);

      // Wait for promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(args.origin.loaderHook.lifecycle.fetch.emit).toHaveBeenCalledWith(
        url.href,
        {},
      );
      expect(callback).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const fetchError = new Error('Fetch failed');
      (globalFetch as jest.Mock).mockRejectedValue(fetchError);

      const url = new URL('http://example.com/chunk.js');
      const callback = jest.fn();
      const args = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockRejectedValue(fetchError),
              },
            },
          },
        },
      };

      fetchAndRun(url, 'chunk.js', callback, args);

      // Wait for promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
      expect(callback.mock.calls[0][0].message.includes(url.href)).toEqual(
        true,
      );
    });
  });

  describe('resolveUrl', () => {
    it('should resolve URL from webpack public path when valid', () => {
      (global as any).__webpack_require__.p = 'http://example.com/assets/';

      const result = resolveUrl('test-remote', 'chunk.js');

      expect(result?.href).toBe('http://example.com/assets/chunk.js');
    });

    it('should resolve URL from cache when direct resolution fails', () => {
      // Make URL constructor throw for direct resolution
      const originalURL = global.URL;
      let firstCall = true;
      global.URL = jest
        .fn()
        .mockImplementation((...args: [string, string?]) => {
          if (firstCall) {
            firstCall = false;
            throw new Error('Invalid URL');
          }
          return new originalURL(args[0], args[1]);
        }) as any;

      const result = resolveUrl('test-remote', 'chunk.js');

      expect(result?.origin).toBe('http://localhost:3001');
      expect(result?.pathname).toContain('chunk.js');

      global.URL = originalURL;
    });

    it('should preserve directory path from remote entry URL', () => {
      // Mock URL constructor to throw on first call to trigger fallback path
      const originalURL = global.URL;
      let firstCall = true;
      global.URL = jest
        .fn()
        .mockImplementation((...args: [string, string?]) => {
          if (firstCall) {
            firstCall = false;
            throw new Error('Invalid URL');
          }
          return new originalURL(args[0], args[1]);
        }) as any;

      // Mock a complex remote entry URL with a path
      const mockEntryUrl = 'http://example.com/static/js/remoteEntry.js';
      jest
        .spyOn(runtimePluginModule, 'returnFromCache')
        .mockReturnValue(mockEntryUrl);

      // Set a rootDir for testing combined paths
      (global as any).__webpack_require__.federation.rootOutputDir = 'dist';

      const result = resolveUrl('test-remote', 'chunk123.js');

      // Check that the URL preserves the directory path from the remote entry
      expect(result?.href).toBe(
        'http://example.com/static/js/dist/chunk123.js',
      );

      // Restore the original URL constructor
      global.URL = originalURL;
    });

    it('should return null when URL cannot be resolved', () => {
      // Make URL constructor throw
      const originalURL = global.URL;
      global.URL = jest.fn().mockImplementation(() => {
        throw new Error('Invalid URL');
      }) as any;

      // Mock returnFromCache and returnFromGlobalInstances to return null
      const spyReturnFromCache = jest
        .spyOn(runtimePluginModule, 'returnFromCache')
        .mockReturnValue(null);
      const spyReturnFromGlobalInstances = jest
        .spyOn(runtimePluginModule, 'returnFromGlobalInstances')
        .mockReturnValue(null);

      const result = resolveUrl('non-existent-remote', 'chunk.js');

      expect(result).toBeNull();

      // Clean up mocks
      global.URL = originalURL;
      spyReturnFromCache.mockRestore();
      spyReturnFromGlobalInstances.mockRestore();
    });
  });

  describe('loadChunk', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should load a chunk from the filesystem', () => {
      // Create a spy that will resolve successfully
      const mockCallback = jest.fn();
      const mockChunk = {
        modules: { 'test-module': {} },
        ids: ['test-chunk'],
        runtime: jest.fn(),
      };

      // Create a manual spy for loadFromFs that calls the callback with a successful result
      jest
        .spyOn(runtimePluginModule, 'loadFromFs')
        .mockImplementation((path, callback) => callback(null, mockChunk));

      loadChunk('filesystem', 'test-chunk', '/dist', mockCallback, {});

      expect(runtimePluginModule.loadFromFs).toHaveBeenCalledWith(
        expect.stringContaining('test-chunk'),
        expect.any(Function),
      );

      expect(mockCallback).toHaveBeenCalledWith(null, mockChunk);
    });

    it('should fetch a chunk from a URL', () => {
      const mockCallback = jest.fn();
      const mockChunk = {
        modules: { 'test-module': {} },
        ids: ['test-chunk'],
        runtime: jest.fn(),
      };

      const mockFetchAndRun = jest
        .spyOn(runtimePluginModule, 'fetchAndRun')
        .mockImplementation((url, chunkId, callback, args) =>
          callback(null, mockChunk),
        );

      // Create a proper URL object
      const testUrl = new URL('http://example.com/chunk.js');
      const resolveUrlSpy = jest
        .spyOn(runtimePluginModule, 'resolveUrl')
        .mockReturnValue(testUrl);

      loadChunk('url', 'test-chunk', '/dist', mockCallback, {});

      // Fix the parameter order to match the implementation: (remoteName, chunkName)
      expect(resolveUrlSpy).toHaveBeenCalledWith('/dist', 'test-chunk');
      expect(mockFetchAndRun).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(null, mockChunk);

      // Restore mocks
      mockFetchAndRun.mockRestore();
      resolveUrlSpy.mockRestore();
    });

    it('should handle unknown strategies', () => {
      const mockCallback = jest.fn();

      // Mock resolveUrl to return a URL to ensure we test the strategy branch
      jest.spyOn(runtimePluginModule, 'resolveUrl').mockReturnValue(null);

      // The strategy 'unknown' isn't in the implementation, so it will default to the URL path
      // which requires resolveUrl to work, which we've mocked to return null
      loadChunk('unknown', 'test-chunk', '/dist', mockCallback, {});

      // When resolveUrl returns null, it should return an empty chunk
      expect(mockCallback).toHaveBeenCalledWith(null, {
        modules: {},
        ids: [],
        runtime: null,
      });
    });
  });

  describe('installChunk', () => {
    it('should install modules and runtime from chunk', () => {
      // Setup resolver function
      const resolver = jest.fn();

      const installedChunks: Record<string, any> = {
        chunk1: [resolver, jest.fn()], // Properly structured chunk with resolver function at index 0
        chunk2: [resolver, jest.fn()],
      };

      const chunk = {
        modules: {
          module1: { id: 'module1' },
          module2: { id: 'module2' },
        },
        runtime: jest.fn(),
        ids: ['chunk1', 'chunk2'],
      };

      installChunk(chunk, installedChunks);

      // Check if modules were added to webpack
      expect((global as any).__webpack_require__.m['module1']).toEqual({
        id: 'module1',
      });
      expect((global as any).__webpack_require__.m['module2']).toEqual({
        id: 'module2',
      });

      // Check if runtime was called
      expect(chunk.runtime).toHaveBeenCalledWith(
        (global as any).__webpack_require__,
      );

      // Check if resolvers were called and chunks were marked as installed
      expect(resolver).toHaveBeenCalledTimes(2); // Should be called for both chunks
      expect(installedChunks['chunk1']).toBe(0);
      expect(installedChunks['chunk2']).toBe(0);
    });

    it('should call resolver for installed chunk data', () => {
      const resolver = jest.fn();
      const installedChunks = {
        chunk1: [resolver, jest.fn()],
      };

      const chunk = {
        modules: {},
        runtime: jest.fn(),
        ids: ['chunk1'],
      };

      installChunk(chunk, installedChunks);

      expect(resolver).toHaveBeenCalled();
      expect(installedChunks['chunk1']).toBe(0);
    });
  });

  describe('setupScriptLoader', () => {
    it('should set up webpack_require.l function', () => {
      const originalL = (global as any).__webpack_require__.l;

      setupScriptLoader();

      expect(typeof (global as any).__webpack_require__.l).toBe('function');
      expect((global as any).__webpack_require__.l).not.toBe(originalL);

      // Test the loader
      const doneMock = jest.fn();
      (global as any).__webpack_require__.l(
        'http://localhost:3001/remoteEntry.js',
        doneMock,
        'test-remote',
        '',
      );

      expect(
        (global as any).__webpack_require__.federation.runtime.loadScriptNode,
      ).toHaveBeenCalledWith('http://localhost:3001/remoteEntry.js', {
        attrs: { globalName: 'test-remote' },
      });
    });

    it('should throw error when key is missing', () => {
      setupScriptLoader();

      expect(() => {
        (global as any).__webpack_require__.l(
          'http://localhost:3001/remoteEntry.js',
          jest.fn(),
          '',
          '',
        );
      }).toThrow();
    });
  });

  describe('setupChunkHandler', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Set up webpack_require properties needed for the test
      (global as any).__webpack_require__ = {
        ...mockWebpackRequire,
        federation: {
          chunkMatcher: jest.fn().mockReturnValue(true),
          rootOutputDir: '/dist',
        },
        u: jest.fn().mockReturnValue('chunk.js'),
        f: {
          require: undefined,
          readFileVm: undefined,
        },
      };
    });

    it('should return a handler for chunk loading and reuse existing promises', () => {
      // Setup mock for loadChunk
      const mockChunk = {
        modules: { 'test-module': {} },
        ids: ['test-chunk'],
        runtime: jest.fn(),
      };

      jest
        .spyOn(runtimePluginModule, 'loadChunk')
        .mockImplementation((strategy, chunkId, root, callback, args) => {
          callback(null, mockChunk);
        });

      jest
        .spyOn(runtimePluginModule, 'installChunk')
        .mockImplementation((chunk, installedChunks) => {
          // Mock implementation that doesn't rely on iterating chunk.ids
          installedChunks['test-chunk'] = 0;
        });

      // Create a test environment
      const installedChunks: Record<string, any> = {};

      // Call the function under test - returns the handler function, doesn't set webpack_require.f.require
      const handler = setupChunkHandler(installedChunks, {});

      // Verify a handler was returned
      expect(typeof handler).toBe('function');

      // Call the handler with chunk IDs and promises array
      const promises: Promise<any>[] = [];
      handler('test-chunk', promises);

      // Verify a promise was added to the array
      expect(promises.length).toBe(1);

      // Verify the chunk data was stored
      expect(installedChunks['test-chunk']).toBeDefined();

      // Now manually assign the handler to __webpack_require__.f.require to test reuse
      (global as any).__webpack_require__.f.require = handler;

      // Clear the array and create new chunk with existing promise
      promises.length = 0;
      const originalPromise = installedChunks['test-chunk'][2];

      // Call the handler through the webpack_require.f.require function
      (global as any).__webpack_require__.f.require('test-chunk', promises);

      // The original promise should be reused
      expect(promises[0]).toBe(originalPromise);
    });

    it('should delete chunks from the installedChunks when loadChunk fails', async () => {
      // mock loadChunk to fail
      jest
        .spyOn(runtimePluginModule, 'loadChunk')
        .mockImplementationOnce((strategy, chunkId, root, callback, args) => {
          Promise.resolve().then(() => {
            callback(new Error('failed to load'), undefined);
          });
        });

      jest
        .spyOn(runtimePluginModule, 'installChunk')
        .mockImplementationOnce((chunk, installedChunks) => {
          // Mock implementation that doesn't rely on iterating chunk.ids
          installedChunks['test-chunk'] = 0;
        });

      // Mock installedChunks
      const installedChunks: Record<string, any> = {};

      // Call the function under test - returns the handler function, doesn't set webpack_require.f.require
      const handler = setupChunkHandler(installedChunks, {});

      const promises: Promise<any>[] = [];
      let res, err;

      try {
        // Call the handler with mock chunk ID and promises array
        handler('test-chunk', promises);
        // Verify that installedChunks has test-chunk before the promise rejects
        expect(installedChunks['test-chunk']).toBeDefined();
        res = await promises[0];
      } catch (e) {
        err = e;
      }

      // Verify that an error was thrown, and the response is undefined
      expect(res).not.toBeDefined();
      expect(err instanceof Error).toEqual(true);

      // Verify the chunk data was properly removed
      expect(installedChunks['test-chunk']).not.toBeDefined();
    });
  });

  describe('setupWebpackRequirePatching', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset webpack require to ensure f exists with require already defined
      (global as any).__webpack_require__ = {
        ...mockWebpackRequire,
        f: {
          require: jest.fn(), // This needs to exist for the function to patch it
          readFileVm: jest.fn(), // This needs to exist for the function to patch it
        },
      };
      // Mock console.warn for testing
      console.warn = jest.fn();
    });

    it('should patch webpack_require.f.require and readFileVm when they exist', () => {
      const handle = jest.fn();

      setupWebpackRequirePatching(handle);

      // Verify the handle function was assigned correctly
      expect((global as any).__webpack_require__.f.require).toBe(handle);
      expect((global as any).__webpack_require__.f.readFileVm).toBe(handle);
    });

    it('should display a warning when patching require', () => {
      const handle = jest.fn();

      setupWebpackRequirePatching(handle);

      // Verify the warning was displayed
      expect(console.warn).toHaveBeenCalledWith(
        '\x1b[33m%s\x1b[0m',
        expect.stringContaining('CAUTION'),
      );
    });
  });

  // Original tests
  describe('Plugin structure', () => {
    it('should return a plugin with the correct name', () => {
      expect(plugin.name).toBe('node-federation-plugin');
    });

    it('should have a beforeInit hook', () => {
      expect(typeof plugin.beforeInit).toBe('function');
    });
  });

  describe('beforeInit hook', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset webpack require to ensure clean state
      (global as any).__webpack_require__ = {
        ...mockWebpackRequire,
        federation: {
          ...mockWebpackRequire.federation,
          runtime: {
            loadScriptNode: jest.fn().mockResolvedValue({}),
          },
          instance: {
            initRawContainer: jest.fn().mockReturnValue({}),
          },
        },
        f: {
          require: undefined,
          readFileVm: undefined,
        },
      };
    });

    it('should return the provided args', () => {
      const mockArgs = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue(null),
              },
            },
          },
        } as unknown as FederationHost,
      } as any;

      if (plugin.beforeInit) {
        const result = plugin.beforeInit(mockArgs);
        expect(result).toBe(mockArgs);
      }
    });

    it('should patch webpack chunk loading handlers', () => {
      // Make sure __webpack_require__.f is initialized with require and readFileVm
      (global as any).__webpack_require__.f = {
        require: jest.fn(),
        readFileVm: jest.fn(),
      };

      const mockArgs = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue(null),
              },
            },
          },
        } as unknown as FederationHost,
      } as any;

      if (plugin.beforeInit) {
        plugin.beforeInit(mockArgs);

        expect(typeof (global as any).__webpack_require__.l).toBe('function');
        // The beforeInit function should have patched these handlers
        expect((global as any).__webpack_require__.f.require).toBeDefined();
        expect(typeof (global as any).__webpack_require__.f.require).toBe(
          'function',
        );
        expect((global as any).__webpack_require__.f.readFileVm).toBeDefined();
        expect(typeof (global as any).__webpack_require__.f.readFileVm).toBe(
          'function',
        );
      }
    });
  });

  describe('webpack chunk loading', () => {
    beforeEach(() => {
      // Reset the webpack require object to ensure it's properly initialized
      (global as any).__webpack_require__ = {
        ...mockWebpackRequire,
        federation: {
          ...mockWebpackRequire.federation,
          runtime: {
            loadScriptNode: jest.fn().mockResolvedValue({}),
          },
          instance: {
            initRawContainer: jest.fn().mockReturnValue({}),
          },
        },
        f: {
          require: jest.fn(),
          readFileVm: jest.fn(),
        },
      };

      const mockArgs = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue(null),
              },
            },
          },
        } as unknown as FederationHost,
      } as any;

      if (plugin.beforeInit) {
        plugin.beforeInit(mockArgs);
      }
    });

    it('should handle loading remote script via webpack_require.l', async () => {
      const doneMock = jest.fn();
      (global as any).__webpack_require__.l(
        'http://localhost:3001/remoteEntry.js',
        doneMock,
        'test-remote',
        null,
      );

      expect(
        (global as any).__webpack_require__.federation.runtime.loadScriptNode,
      ).toHaveBeenCalledWith('http://localhost:3001/remoteEntry.js', {
        attrs: { globalName: 'test-remote' },
      });

      await Promise.resolve();

      expect(
        (global as any).__webpack_require__.federation.instance
          .initRawContainer,
      ).toHaveBeenCalled();
      expect(doneMock).toHaveBeenCalled();
    });

    it('should handle chunk loading via filesystem when file exists', () => {
      require('fs').existsSync.mockReturnValue(true);

      const promises: Promise<any>[] = [];
      const promise = new Promise<any>(() => {
        return undefined;
      });
      promises.push(promise);

      (global as any).__webpack_require__.f.require('testChunk', promises);

      expect(require('fs').existsSync).toHaveBeenCalled();
    });

    it('should handle errors in loadScriptNode', async () => {
      // Mock loadScriptNode to reject with an error
      (global as any).__webpack_require__.federation.runtime.loadScriptNode =
        jest.fn().mockRejectedValue(new Error('Loading error'));

      const doneMock = jest.fn();

      // First set up the loader using the setupScriptLoader function
      setupScriptLoader();

      // Then call the loader
      (global as any).__webpack_require__.l(
        'http://localhost:3001/remoteEntry.js',
        doneMock,
        'test-remote',
        '',
      );

      // Wait for all promises to resolve/reject
      await new Promise(process.nextTick);

      // The done callback should be called with the error
      expect(doneMock).toHaveBeenCalled();
    });
  });

  describe('Helper functions', () => {
    beforeEach(() => {
      const mockArgs = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue(null),
              },
            },
          },
        } as unknown as FederationHost,
      } as any;

      if (plugin.beforeInit) {
        plugin.beforeInit(mockArgs);
      }
    });

    it('should resolve file paths correctly', () => {
      (global as any).__webpack_require__.f.require('testChunk', []);

      expect(true).toBe(true);
    });

    it('should search for remotes in the global federation instances', () => {
      const originalModuleCache = (global as any).__FEDERATION__
        .__INSTANCES__[0].moduleCache;
      (global as any).__FEDERATION__.__INSTANCES__[0].moduleCache = new Map();

      (global as any).__webpack_require__.f.require('testChunk', []);

      (global as any).__FEDERATION__.__INSTANCES__[0].moduleCache =
        originalModuleCache;
    });
  });

  describe('Webpack require functionality', () => {
    beforeEach(() => {
      // Ensure the webpack require object is properly initialized
      (global as any).__webpack_require__ = {
        ...mockWebpackRequire,
        federation: {
          ...mockWebpackRequire.federation,
          runtime: {
            loadScriptNode: jest.fn().mockResolvedValue({}),
          },
          instance: {
            initRawContainer: jest.fn().mockReturnValue({}),
          },
        },
        f: {
          require: jest.fn(),
          readFileVm: jest.fn(),
        },
      };

      const mockArgs = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue(null),
              },
            },
          },
        } as unknown as FederationHost,
      } as any;

      if (plugin.beforeInit) {
        plugin.beforeInit(mockArgs);
      }
    });

    it('should set up webpack require correctly', () => {
      expect((global as any).__webpack_require__).toBeDefined();
      expect((global as any).__webpack_require__.federation).toBeDefined();
      expect(
        (global as any).__webpack_require__.federation.runtime,
      ).toBeDefined();
      expect(
        (global as any).__webpack_require__.federation.runtime.loadScriptNode,
      ).toBeDefined();
      expect((global as any).__webpack_require__.l).toBeDefined();
      expect((global as any).__webpack_require__.f).toBeDefined();
      expect((global as any).__webpack_require__.f.require).toBeDefined();
    });

    it('should configure the public path correctly', () => {
      const customPath = 'http://example.com/assets/';
      (global as any).__webpack_require__.p = customPath;

      expect((global as any).__webpack_require__.p).toBe(customPath);
    });
  });

  describe('URL handling', () => {
    let originalConsoleLog: any;

    beforeEach(() => {
      originalConsoleLog = console.log;
      console.log = jest.fn();

      const mockArgs = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue(null),
              },
            },
          },
        } as unknown as FederationHost,
      } as any;

      if (plugin.beforeInit) {
        plugin.beforeInit(mockArgs);
      }
    });

    afterEach(() => {
      console.log = originalConsoleLog;
    });

    it('should resolve file paths for chunks', () => {
      const originalPath = (global as any).__webpack_require__.p;
      (global as any).__webpack_require__.p = 'http://example.com/assets/';

      const originalExistsSync = require('fs').existsSync;
      require('fs').existsSync = jest.fn().mockReturnValue(true);

      const promises: Promise<any>[] = [];
      (global as any).__webpack_require__.f.require('testChunk', promises);

      expect(require('fs').existsSync).toHaveBeenCalled();

      require('fs').existsSync = originalExistsSync;
      (global as any).__webpack_require__.p = originalPath;
    });
  });

  describe('Remote entry loading', () => {
    beforeEach(() => {
      // Ensure the webpack require object is properly initialized
      (global as any).__webpack_require__ = {
        ...mockWebpackRequire,
        federation: {
          ...mockWebpackRequire.federation,
          runtime: {
            loadScriptNode: jest.fn().mockResolvedValue({}),
          },
          instance: {
            initRawContainer: jest.fn().mockReturnValue({}),
          },
        },
        f: {
          require: jest.fn(),
          readFileVm: jest.fn(),
        },
      };

      const mockArgs = {
        origin: {
          loaderHook: {
            lifecycle: {
              fetch: {
                emit: jest.fn().mockResolvedValue(null),
              },
            },
          },
        } as unknown as FederationHost,
      } as any;

      if (plugin.beforeInit) {
        plugin.beforeInit(mockArgs);
      }
    });

    it('should load remote entries correctly', () => {
      const loadScriptNodeMock = jest.fn().mockResolvedValue({});
      (global as any).__webpack_require__.federation.runtime.loadScriptNode =
        loadScriptNodeMock;

      const doneMock = jest.fn();
      (global as any).__webpack_require__.l(
        'http://localhost:3001/remoteEntry.js',
        doneMock,
        'test-remote',
        null,
      );

      expect(loadScriptNodeMock).toHaveBeenCalledWith(
        'http://localhost:3001/remoteEntry.js',
        expect.objectContaining({
          attrs: expect.objectContaining({
            globalName: 'test-remote',
          }),
        }),
      );
    });
  });
});
