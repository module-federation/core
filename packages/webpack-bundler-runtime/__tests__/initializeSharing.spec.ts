import { initializeSharing } from '../src/initializeSharing';
import { InitializeSharingOptions } from '../src/types';
import { FEDERATION_SUPPORTED_TYPES } from '../src/constant';

// Mock the attachShareScopeMap function
jest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: jest.fn(),
}));

describe('initializeSharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle circular init calls', () => {
    // Setup
    const mockInitToken = { test: { from: 'test-app' } };
    const mockInitScope = [mockInitToken];
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: jest.fn().mockReturnValue([]),
            options: {
              shareStrategy: 'eager',
            },
          },
        },
        o: jest.fn(),
      } as any,
      initPromises: {},
      initTokens: {
        default: mockInitToken,
      },
      initScope: mockInitScope,
    };

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeUndefined();
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).not.toHaveBeenCalled();
  });

  test('should return existing promise if already initializing', () => {
    // Setup
    const mockPromise = Promise.resolve(true);
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: jest.fn().mockReturnValue([]),
            options: {
              shareStrategy: 'eager',
            },
          },
        },
        o: jest.fn(),
      } as any,
      initPromises: {
        default: mockPromise,
      },
      initTokens: {},
      initScope: [],
    };

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBe(mockPromise);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).not.toHaveBeenCalled();
  });

  test('should initialize sharing with no promises', () => {
    // Setup
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: jest.fn().mockReturnValue([]),
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {},
              idToExternalAndNameMapping: {},
            },
          },
        },
        o: jest.fn(),
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [],
    };

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBe(true);
    expect(mockOptions.initPromises.default).toBe(true);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).toHaveBeenCalledWith('default', {
      strategy: 'eager',
      initScope: expect.any(Array),
      from: 'build',
    });
  });

  test('should initialize sharing with promises', async () => {
    // Setup
    const mockPromise = Promise.resolve();
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: jest.fn().mockReturnValue([mockPromise]),
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {},
              idToExternalAndNameMapping: {},
            },
          },
        },
        o: jest.fn(),
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [],
    };

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).toHaveBeenCalledWith('default', {
      strategy: 'eager',
      initScope: expect.any(Array),
      from: 'build',
    });
  });

  test('should initialize external modules that are not supported federation types', () => {
    // Setup
    const mockExternalModule = { init: jest.fn() };
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: jest.fn().mockReturnValue([]),
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                'module-1': [
                  { externalType: 'unsupported-type', name: 'module1' },
                ],
              },
              idToExternalAndNameMapping: {
                'module-1': ['scope', 'name', 'external-id'],
              },
            },
          },
        },
        o: jest.fn(),
        S: {
          default: {},
        },
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [],
    };

    // Mock webpack require to return our mock module
    mockOptions.webpackRequire = {
      ...mockOptions.webpackRequire,
      // Mock the require function
      'external-id': mockExternalModule,
    } as any;

    // Execute
    initializeSharing(mockOptions);

    // Verify - should have attempted to initialize the external module
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).toHaveBeenCalled();
  });

  // New test to cover the error handling in initExternal (lines 33-40)
  test('should handle errors when initializing external module', () => {
    // Setup
    // Spy on console.warn
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;

    // Mock a module that throws an error when required
    const mockRequire = jest.fn().mockImplementation((id) => {
      if (id === 'errorModule') {
        throw new Error('Module load error');
      }
      return {
        init: jest.fn(),
      };
    });

    const mockInitializeSharing = jest.fn().mockReturnValue([]);
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        S: { default: {} },
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: mockInitializeSharing,
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                errorModule: [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                errorModule: [null, null, 'errorModule'],
              },
            },
          },
        },
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [{ test: { from: 'test-app' } }],
    };

    // Replace the webpackRequire function
    mockOptions.webpackRequire = Object.assign(
      mockRequire,
      mockOptions.webpackRequire,
    );

    // Execute
    initializeSharing(mockOptions);

    // Verify
    expect(mockRequire).toHaveBeenCalledWith('errorModule');
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Initialization of sharing external failed'),
    );

    // Restore console.warn
    console.warn = originalConsoleWarn;
  });

  // Fixed test to cover the case when a module has a then method but fails (line 37)
  test('should handle promise rejection from external module init', () => {
    // Setup
    // Spy on console.warn
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;

    // Mock a module with a then method that safely simulates a rejection
    const mockPromise = {
      then: jest.fn((onResolve, onReject) => {
        // Instead of actually rejecting, just call the handler
        if (onReject) {
          onReject(new Error('Promise rejected'));
        }
        // Return a resolved promise for test safety
        return Promise.resolve();
      }),
    };

    const mockRequire = jest.fn().mockReturnValue(mockPromise);
    const mockInitializeSharing = jest.fn().mockReturnValue([]);
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        S: { default: {} },
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: mockInitializeSharing,
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                promiseModule: [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                promiseModule: [null, null, 'promiseModule'],
              },
            },
          },
        },
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [{ test: { from: 'test-app' } }],
    };

    // Replace the webpackRequire function
    mockOptions.webpackRequire = Object.assign(
      mockRequire,
      mockOptions.webpackRequire,
    );

    // Execute
    initializeSharing(mockOptions);

    // Verify
    expect(mockRequire).toHaveBeenCalledWith('promiseModule');
    expect(mockPromise.then).toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Initialization of sharing external failed'),
    );

    // Restore console.warn
    console.warn = originalConsoleWarn;
  });

  // New test to cover the case when init returns a thenable (line 39-40)
  test('should handle thenable result from module init', () => {
    // Setup
    // Spy on console.warn
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;

    // Mock a thenable that safely simulates a rejection
    const mockThenable = {
      then: jest.fn(),
      catch: jest.fn((handler) => {
        // Call the handler but don't actually throw
        handler(new Error('Thenable error'));
        return { then: jest.fn() };
      }),
    };

    // Mock a init function that returns a thenable
    const mockInit = jest.fn().mockReturnValue(mockThenable);

    const mockModule = {
      init: mockInit,
    };

    const mockRequire = jest.fn().mockReturnValue(mockModule);
    const mockInitializeSharing = jest.fn().mockReturnValue([]);
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        S: { default: {} },
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: mockInitializeSharing,
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                thenableModule: [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                thenableModule: [null, null, 'thenableModule'],
              },
            },
          },
        },
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [{ test: { from: 'test-app' } }],
    };

    // Replace the webpackRequire function
    mockOptions.webpackRequire = Object.assign(
      mockRequire,
      mockOptions.webpackRequire,
    );

    // Execute
    initializeSharing(mockOptions);

    // Verify
    expect(mockRequire).toHaveBeenCalledWith('thenableModule');
    expect(mockInit).toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Initialization of sharing external failed'),
    );

    // Restore console.warn
    console.warn = originalConsoleWarn;
  });

  // New test to cover the case with multiple remotes (line 64)
  test('should initialize multiple remotes of different types', () => {
    // Setup
    const mockInit = jest.fn();
    const mockModule = { init: mockInit };
    const mockRequire = jest.fn().mockReturnValue(mockModule);
    const mockInitializeSharing = jest.fn().mockReturnValue([]);

    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        S: { default: {} },
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: mockInitializeSharing,
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                multipleRemotesModule: [
                  { externalType: 'default' },
                  { externalType: 'script' },
                  { externalType: 'unknown' },
                ],
                supportedTypeModule: [{ externalType: 'script' }],
              },
              idToExternalAndNameMapping: {
                multipleRemotesModule: [
                  null,
                  null,
                  'multipleRemotesExternalId',
                ],
                supportedTypeModule: [null, null, 'supportedTypeExternalId'],
              },
            },
          },
        },
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [{ test: { from: 'test-app' } }],
    };

    // Replace the webpackRequire function
    mockOptions.webpackRequire = Object.assign(
      mockRequire,
      mockOptions.webpackRequire,
    );

    // Execute
    initializeSharing(mockOptions);

    // Verify - for modules with multiple remotes, we should call initExternal
    expect(mockRequire).toHaveBeenCalledWith('multipleRemotesExternalId');
    expect(mockInit).toHaveBeenCalled();

    // For modules with supported types only, we should not call initExternal
    expect(mockRequire).not.toHaveBeenCalledWith('supportedTypeExternalId');
  });

  // New test to cover the case when initScope is undefined (line 12)
  test('should handle undefined initScope', () => {
    // Setup
    const mockInitializeSharing = jest.fn().mockReturnValue([]);
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: mockInitializeSharing,
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {},
              idToExternalAndNameMapping: {},
            },
          },
        },
        o: jest.fn(),
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: undefined as any,
    };

    // Execute
    initializeSharing(mockOptions);

    // Verify - initScope should include an initialization token with the federation instance name
    expect(mockInitializeSharing).toHaveBeenCalledWith('default', {
      strategy: 'eager',
      initScope: [{ from: 'test-app' }], // The actual implementation adds a token
      from: 'build',
    });
  });

  // New test to cover the case when a module is required but is undefined (line 32)
  test('should handle undefined module when initializing external', () => {
    // Setup
    // Spy on console.warn
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;

    // Mock a module that returns undefined when required
    const nonExistentModuleId = 'module-does-not-exist';
    const mockRequire = jest.fn().mockImplementation((id) => {
      if (id === nonExistentModuleId) {
        return undefined; // Return undefined for this module
      }
      return {
        init: jest.fn(),
      };
    });

    const mockInitializeSharing = jest.fn().mockReturnValue([]);
    const mockOptions: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire: {
        S: { default: {} },
        federation: {
          instance: {
            name: 'test-app',
            initializeSharing: mockInitializeSharing,
            options: {
              shareStrategy: 'eager',
            },
          },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                missingModule: [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                missingModule: [null, null, nonExistentModuleId],
              },
            },
          },
        },
      } as any,
      initPromises: {},
      initTokens: {},
      initScope: [],
    };

    // Replace the webpackRequire function
    mockOptions.webpackRequire = Object.assign(
      mockRequire,
      mockOptions.webpackRequire,
    );

    // Execute
    initializeSharing(mockOptions);

    // Verify
    expect(mockRequire).toHaveBeenCalledWith(nonExistentModuleId);
    // No warning should be logged since we're exiting early
    expect(mockConsoleWarn).not.toHaveBeenCalled();

    // Restore console.warn
    console.warn = originalConsoleWarn;
  });
});
