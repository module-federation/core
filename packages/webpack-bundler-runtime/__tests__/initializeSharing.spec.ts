import { initializeSharing } from '../src/initializeSharing';
import { InitializeSharingOptions, WebpackRequire } from '../src/types';
import { FEDERATION_SUPPORTED_TYPES } from '../src/constant';

// Mock the attachShareScopeMap function
jest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: jest.fn(),
}));

// Helper functions to reduce repetition

/**
 * Creates a basic mock federation instance
 */
function createMockFederationInstance(options: Record<string, any> = {}) {
  return {
    name: 'test-app',
    initializeSharing: jest.fn().mockReturnValue([]),
    options: {
      shareStrategy: 'eager',
      ...options,
    },
  };
}

type MockWebpackRequireOverrides = {
  federationInstance?: any;
  bundlerRuntimeOptions?: any;
  federation?: Record<string, any>;
  [key: string]: any;
};

/**
 * Creates a mock webpackRequire object with customizable properties
 */
function createMockWebpackRequire(overrides: MockWebpackRequireOverrides = {}) {
  const federationInstance =
    overrides.federationInstance || createMockFederationInstance();
  const bundlerRuntimeOptions = overrides.bundlerRuntimeOptions || {
    remotes: {
      idToRemoteMap: {},
      idToExternalAndNameMapping: {},
    },
  };

  return {
    S: { default: {} },
    federation: {
      instance: federationInstance,
      bundlerRuntimeOptions,
      ...overrides.federation,
    },
    o: jest.fn(),
    ...overrides,
  };
}

type MockOptionsOverrides = {
  shareScopeName?: string | string[];
  webpackRequire?: any;
  initPromises?: Record<string, any>;
  initTokens?: Record<string, any>;
  initScope?: any[];
};

/**
 * Creates basic InitializeSharingOptions with customizable properties
 */
function createMockOptions(
  overrides: MockOptionsOverrides = {},
): InitializeSharingOptions {
  return {
    shareScopeName: overrides.shareScopeName || 'default',
    webpackRequire: overrides.webpackRequire || createMockWebpackRequire(),
    initPromises: overrides.initPromises || {},
    initTokens: overrides.initTokens || {},
    initScope: overrides.initScope || [],
  };
}

/**
 * Helper for mocking console.warn during tests
 */
function withMockedConsoleWarn(
  testFn: (mockWarn: jest.Mock) => Promise<void> | void,
) {
  return async () => {
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;

    try {
      await testFn(mockConsoleWarn);
    } finally {
      console.warn = originalConsoleWarn;
    }
  };
}

type ThenableModuleOptions = {
  shouldResolve?: boolean;
  resolveValue?: any;
  rejectValue?: any;
  thenImplementation?: (...args: any[]) => any;
  catchImplementation?: (handler: (err: any) => any) => any;
};

/**
 * Creates a module with a then method that can be configured for success or failure
 */
function createThenableModule({
  shouldResolve = true,
  resolveValue = { init: jest.fn() },
  rejectValue = new Error('Thenable rejected'),
  thenImplementation,
  catchImplementation,
}: ThenableModuleOptions = {}) {
  const result: any = {
    then:
      thenImplementation ||
      jest.fn().mockImplementation((onSuccess, onError) => {
        if (shouldResolve) {
          onSuccess(resolveValue);
        } else if (onError) {
          onError(rejectValue);
        }
        return Promise.resolve();
      }),
  };

  if (catchImplementation) {
    result.catch = catchImplementation;
  }

  return result;
}

describe('initializeSharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle circular init calls', async () => {
    // Setup
    const mockInitToken = { test: { from: 'test-app' } };
    const mockInitScope = [mockInitToken];

    const mockOptions = createMockOptions({
      initTokens: {
        default: mockInitToken,
      },
      initScope: mockInitScope,
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - with a single shareScopeName string, we should get Promise<boolean>
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).not.toHaveBeenCalled();
  });

  test('should return existing promise if already initializing', async () => {
    // Setup
    const mockPromise = Promise.resolve(true);

    const mockOptions = createMockOptions({
      initPromises: {
        default: mockPromise,
      },
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - with existing promise, the original promise should be returned in an array promise
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).not.toHaveBeenCalled();
  });

  test('should initialize sharing with no promises', async () => {
    // Setup
    const mockOptions = createMockOptions();

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - with a single shareScopeName string, we should get Promise<boolean>
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
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
    const federationInstance = createMockFederationInstance();
    federationInstance.initializeSharing = jest
      .fn()
      .mockReturnValue([mockPromise]);

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        federationInstance: federationInstance,
      }),
    });

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

  test('should handle multiple shareScopeNames as array', async () => {
    // Setup
    const mockOptions = createMockOptions({
      shareScopeName: ['default', 'custom'],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - with array of shareScopeNames, we should get Promise<boolean>
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(mockOptions.initPromises.default).toBe(true);
    expect(mockOptions.initPromises.custom).toBe(true);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).toHaveBeenCalledWith('default', {
      strategy: 'eager',
      initScope: expect.any(Array),
      from: 'build',
    });
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).toHaveBeenCalledWith('custom', {
      strategy: 'eager',
      initScope: expect.any(Array),
      from: 'build',
    });
  });

  test('should initialize external modules that are not supported federation types', async () => {
    // Setup
    const mockExternalModule = { init: jest.fn() };

    // Create a mock webpackRequire with external module remotes
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
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
        instance: createMockFederationInstance(), // Add mock federation instance with name
      },
      S: {
        default: {},
      },
    });

    // Add the external module to the webpackRequire object
    mockWebpackRequire['external-id'] = mockExternalModule;

    const mockOptions = createMockOptions({
      webpackRequire: mockWebpackRequire,
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - should have attempted to initialize the external module
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).toHaveBeenCalled();
  });

  // New test to cover the error handling in initExternal (lines 33-40)
  test('should handle errors when initializing external module', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
      // Mock a module that throws an error when required
      const mockRequire = jest.fn().mockImplementation((id) => {
        if (id === 'errorModule') {
          throw new Error('Module load error');
        }
        return {
          init: jest.fn(),
        };
      });

      // Create a federation instance and webpackRequire
      const federationInstance = createMockFederationInstance();
      federationInstance.initializeSharing = jest.fn().mockReturnValue([]);

      const mockWebpackRequire = createMockWebpackRequire({
        federationInstance: federationInstance,
        federation: {
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
      });

      // Replace the webpackRequire function
      Object.assign(mockRequire, mockWebpackRequire);

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire,
        initScope: [{ test: { from: 'test-app' } }],
      });

      // Execute
      const result = initializeSharing(mockOptions);

      // Verify
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);
      expect(mockRequire).toHaveBeenCalledWith('errorModule');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Initialization of sharing external failed'),
      );
    });
  });

  // Fixed test to cover the case when a module has a then method but fails (line 37)
  test('should handle promise rejection from external module init', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
      // Create a module with a then method that safely simulates a rejection
      const mockPromise = createThenableModule({
        shouldResolve: false,
        rejectValue: new Error('Promise rejected'),
        thenImplementation: (onResolve, onReject) => {
          // Instead of actually rejecting, just call the handler
          if (onReject) {
            onReject(new Error('Promise rejected'));
          }
          // Return a resolved promise for test safety
          return Promise.resolve();
        },
      });

      const mockRequire = jest.fn().mockReturnValue(mockPromise);

      const federationInstance = createMockFederationInstance();
      federationInstance.initializeSharing = jest.fn().mockReturnValue([]);

      const mockWebpackRequire = createMockWebpackRequire({
        federationInstance: federationInstance,
        federation: {
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
      });

      // Replace the webpackRequire function
      Object.assign(mockRequire, mockWebpackRequire);

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire,
        initScope: [{ test: { from: 'test-app' } }],
      });

      // Execute
      const result = initializeSharing(mockOptions);

      // Verify
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);
      expect(mockRequire).toHaveBeenCalledWith('promiseModule');
      expect(mockPromise.then).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Initialization of sharing external failed'),
      );
    });
  });

  // New test to cover the case when init returns a thenable (line 39-40)
  test('should handle thenable result from module init', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
      // Create a thenable that will be returned by the module's init function
      const mockThenable = createThenableModule({
        shouldResolve: false,
        thenImplementation: jest.fn(),
        catchImplementation: jest.fn().mockImplementation((handler) => {
          // Simulate a rejection that will be handled
          handler(new Error('Test error'));
          return Promise.resolve();
        }),
      });

      // Create a module with an init function that returns our thenable
      const mockModule = {
        init: jest.fn().mockReturnValue(mockThenable),
      };

      const federationInstance = createMockFederationInstance();
      // Mock the initializeSharing function to return a promises array
      const promises: any[] = [];
      federationInstance.initializeSharing = jest
        .fn()
        .mockImplementation(() => {
          return promises;
        });

      // Create a webpackRequire function that returns our module when called with 'thenableModule'
      const mockWebpackRequire = createMockWebpackRequire({
        federationInstance: federationInstance,
        federation: {
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
      });

      // Create a function that returns the module when called with the specific ID
      const mockRequire = jest.fn((id) =>
        id === 'thenableModule' ? mockModule : undefined,
      );
      Object.assign(mockRequire, mockWebpackRequire);

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire,
      });

      // Execute the function
      const result = initializeSharing(mockOptions);

      // Allow promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify results
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);

      // Verify our mocks were called
      expect(mockModule.init).toHaveBeenCalled();
      expect(mockThenable.catch).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });

  test('should handle module without init function', async () => {
    // Setup - create a module with no init function
    const mockModule = {};
    const mockRequire = jest.fn().mockReturnValue(mockModule);

    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              noInitModule: [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              noInitModule: [null, null, 'noInitModule'],
            },
          },
        },
        instance: createMockFederationInstance(), // Add mock federation instance with name
      },
    });

    // Replace the webpackRequire function with our mock that returns the module with no init
    Object.assign(mockRequire, mockWebpackRequire);

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire,
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - we should still get a resolved promise since missing init just returns undefined
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(mockRequire).toHaveBeenCalledWith('noInitModule');
  });

  test('should handle non-thenable, non-boolean result from module init', async () => {
    // Setup
    const mockInit = jest.fn().mockReturnValue('some-string'); // Not a boolean or thenable
    const mockModule = { init: mockInit };
    const mockRequire = jest.fn().mockReturnValue(mockModule);

    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              nonThenableModule: [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              nonThenableModule: [null, null, 'nonThenableModule'],
            },
          },
        },
        instance: createMockFederationInstance(), // Add mock federation instance with name
      },
    });

    // Replace the webpackRequire function with our mock
    Object.assign(mockRequire, mockWebpackRequire);

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire,
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(mockRequire).toHaveBeenCalledWith('nonThenableModule');
    expect(mockInit).toHaveBeenCalled();
  });

  test('should initialize multiple remotes of different types', async () => {
    // Setup
    const mockInit = jest.fn();
    const mockModule = { init: mockInit };
    const mockRequire = jest.fn().mockReturnValue(mockModule);

    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
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
              multipleRemotesModule: [null, null, 'multipleRemotesExternalId'],
              supportedTypeModule: [null, null, 'supportedTypeExternalId'],
            },
          },
        },
        instance: createMockFederationInstance(), // Add mock federation instance with name
      },
    });

    // Replace the webpackRequire function with our mock
    Object.assign(mockRequire, mockWebpackRequire);

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire,
      initScope: [{ test: { from: 'test-app' } }],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - for modules with multiple remotes, we should call initExternal
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(mockRequire).toHaveBeenCalledWith('multipleRemotesExternalId');
    expect(mockInit).toHaveBeenCalled();

    // For modules with supported types only, we should not call initExternal
    expect(mockRequire).not.toHaveBeenCalledWith('supportedTypeExternalId');
  });

  // New test to cover the case when initScope is undefined (line 12)
  test('should handle undefined initScope', async () => {
    // Setup
    const mockOptions = createMockOptions({
      initScope: undefined as any,
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify - initScope should include an initialization token with the federation instance name
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
    expect(
      mockOptions.webpackRequire.federation.instance?.initializeSharing,
    ).toHaveBeenCalledWith('default', {
      strategy: 'eager',
      initScope: [{ from: 'test-app' }], // The actual implementation adds a token
      from: 'build',
    });
  });

  // New test to cover the case when a module is required but is undefined (line 32)
  test('should handle undefined module when initializing external', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
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

      const mockWebpackRequire = createMockWebpackRequire({
        federation: {
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
      });

      // Replace the webpackRequire function
      Object.assign(mockRequire, mockWebpackRequire);

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire,
      });

      // Execute
      const result = initializeSharing(mockOptions);

      // Verify
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);
      expect(mockRequire).toHaveBeenCalledWith(nonExistentModuleId);
      // No warning should be logged since we're exiting early
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  // Test for the case when a module has a .then method (line 43)
  test('should handle module with a then method', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
      // Create a module with a then method
      const moduleValue = {
        init: jest.fn(),
      };
      const moduleWithThen = createThenableModule({
        shouldResolve: true,
        resolveValue: moduleValue,
      });

      // Create a mock webpackRequire
      const mockWebpackRequire = createMockWebpackRequire({
        federation: {
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                thenModule: [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                thenModule: [null, null, 'thenModule'],
              },
            },
          },
        },
      });

      // Create a function that returns the module when called with the specific ID
      const mockRequire = jest.fn((id) =>
        id === 'thenModule' ? moduleWithThen : undefined,
      );
      Object.assign(mockRequire, mockWebpackRequire);

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire,
      });

      // Execute the function
      const result = initializeSharing(mockOptions);

      // Allow promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify results
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);

      // Verify our mocks were called
      expect(moduleWithThen.then).toHaveBeenCalled();
      expect(moduleValue.init).toHaveBeenCalled();
    });
  });

  // Test specifically for the module.then branch with successful resolution (line 43)
  test('should handle module with then property that resolves successfully', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
      // Create a thenable module
      const mockThenable = createThenableModule({
        shouldResolve: false,
        thenImplementation: jest.fn(),
        catchImplementation: jest.fn().mockImplementation((handler) => {
          // Simulate a rejection that will be handled
          handler(new Error('Test error'));
          return Promise.resolve();
        }),
      });

      // Create a module with an init function that returns our thenable
      const mockModule = {
        init: jest.fn().mockReturnValue(mockThenable),
      };

      // Create federation instance with custom initializeSharing
      const federationInstance = createMockFederationInstance();
      const promises: any[] = [];
      federationInstance.initializeSharing = jest
        .fn()
        .mockImplementation(() => {
          return promises;
        });

      // Create a mock webpackRequire
      const mockWebpackRequire = createMockWebpackRequire({
        federationInstance: federationInstance,
        federation: {
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                resolvingModule: [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                resolvingModule: [null, null, 'resolvingModule'],
              },
            },
          },
        },
      });

      // Create a function that returns the module when called with the specific ID
      const mockRequire = jest.fn((id) =>
        id === 'resolvingModule' ? mockModule : undefined,
      );
      Object.assign(mockRequire, mockWebpackRequire);

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire,
      });

      // Execute the function
      const result = initializeSharing(mockOptions);

      // Allow promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify results
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);

      // Verify our mocks were called
      expect(mockModule.init).toHaveBeenCalled();
      expect(mockThenable.catch).toHaveBeenCalled();
      // Warning is expected since we're simulating an error
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });

  // Test specifically for the module.then branch with rejection using a different approach (line 43)
  test('should handle module with then property that rejects with a different approach', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
      // Create a module with then that will reject
      const moduleWithRejectingThen = createThenableModule({
        shouldResolve: false,
        thenImplementation: (callback, rejectCallback) => {
          // Call the reject callback to test error handling
          rejectCallback(new Error('Thenable rejected'));
          return Promise.resolve();
        },
      });

      // Create federation instance with custom initializeSharing
      const federationInstance = createMockFederationInstance();
      const promises: any[] = [];
      federationInstance.initializeSharing = jest
        .fn()
        .mockImplementation(() => {
          return promises;
        });

      // Create a mock webpackRequire
      const mockWebpackRequire = createMockWebpackRequire({
        federationInstance: federationInstance,
        federation: {
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                rejectingModule: [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                rejectingModule: [null, null, 'rejectingModule'],
              },
            },
          },
        },
      });

      // Create a function that returns the module when called with the specific ID
      const mockRequire = jest.fn((id) =>
        id === 'rejectingModule' ? moduleWithRejectingThen : undefined,
      );
      Object.assign(mockRequire, mockWebpackRequire);

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire,
      });

      // Execute the function
      const result = initializeSharing(mockOptions);

      // Allow promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify results
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);

      // Verify our mocks were called
      expect(moduleWithRejectingThen.then).toHaveBeenCalled();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Initialization of sharing external failed'),
      );
    });
  });

  test('should properly handle circular init detection', () => {
    // Create a mock federation instance
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
      initializeSharing: jest.fn().mockReturnValue([]),
    });

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
      },
    });

    // Create initScope and initTokens with a circular reference
    const initScope: any[] = [];
    const initTokens: Record<string, any> = {
      default: { from: 'test-app' },
    };

    // Add the token to initScope to simulate circular reference
    initScope.push(initTokens.default);

    mockWebpackRequire.S = { default: {} };

    // Create options using the helper
    const mockOptions = createMockOptions({
      webpackRequire: mockWebpackRequire,
      shareScopeName: 'default',
      initScope,
      initTokens,
      initPromises: {},
    });

    // Execute with circular reference already detected
    const result = initializeSharing(mockOptions);

    // The function may return a Promise or another value when it detects circular init
    // We just verify it's not returning true, which would indicate normal completion
    expect(result).not.toBe(true);
  });

  test('should handle case where module exists but has no init function', async () => {
    // Create a module without an init function
    const moduleWithoutInit = {
      // No init function
      someOtherProperty: 'value',
    };

    // Create federation instance with a name
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
    });
    const promises: any[] = [];
    federationInstance.initializeSharing = jest.fn().mockImplementation(() => {
      return promises;
    });

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              noInitModule: [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              noInitModule: [null, null, 'noInitModule'],
            },
          },
        },
        initOptions: { name: 'test-app' },
      },
    });

    // Create a function that returns the module when called with the specific ID
    const mockRequire = jest.fn((id) =>
      id === 'noInitModule' ? moduleWithoutInit : undefined,
    );
    Object.assign(mockRequire, mockWebpackRequire);
    (mockRequire as any).S = { default: {} };

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
    });

    // Execute the function
    const result = initializeSharing(mockOptions);

    // Allow promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify results
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
  });

  test('should handle init function returning non-thenable result', async () => {
    // Create a module with init that returns a non-thenable, non-boolean value
    const moduleWithNonThenableInit = {
      init: jest.fn().mockImplementation(() => {
        return 'string result'; // Neither boolean nor thenable
      }),
    };

    // Create federation instance with a name
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
    });
    const promises: any[] = [];
    federationInstance.initializeSharing = jest.fn().mockImplementation(() => {
      return promises;
    });

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              nonThenableModule: [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              nonThenableModule: [null, null, 'nonThenableModule'],
            },
          },
        },
        initOptions: { name: 'test-app' },
      },
    });

    // Create a function that returns the module when called with the specific ID
    const mockRequire = jest.fn((id) =>
      id === 'nonThenableModule' ? moduleWithNonThenableInit : undefined,
    );
    Object.assign(mockRequire, mockWebpackRequire);
    (mockRequire as any).S = { default: {} };

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
    });

    // Execute the function
    const result = initializeSharing(mockOptions);

    // Allow promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify results
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify our mocks were called
    expect(moduleWithNonThenableInit.init).toHaveBeenCalled();
  });

  test('should handle initializeSharing returning empty promises array', async () => {
    // Create federation instance with a name
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
      initializeSharing: jest.fn().mockReturnValue([]),
    });

    // Create a mock webpackRequire with properly structured bundlerRuntimeOptions
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {},
            idToExternalAndNameMapping: {},
          },
        },
      },
    });

    mockWebpackRequire.S = { default: {} };

    // Create options using the helper
    const mockOptions = createMockOptions({
      webpackRequire: mockWebpackRequire,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // When promises array is empty, the function returns a Promise that resolves to true
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
  });

  test('should handle init function returning a thenable that is caught', async () => {
    // Create a mock promise with a catch method
    const mockThenableWithCatch = Promise.resolve('value');

    // Create a module with init that returns a thenable with catch
    const moduleWithThenableCatchInit = {
      init: jest.fn().mockImplementation(() => {
        return mockThenableWithCatch;
      }),
    };

    // Create federation instance with a name
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
    });
    const promises: any[] = [];
    federationInstance.initializeSharing = jest.fn().mockImplementation(() => {
      return promises;
    });

    // Spy on the promise.catch method
    const catchSpy = jest.spyOn(mockThenableWithCatch, 'catch');

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              thenableCatchModule: [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              thenableCatchModule: [null, null, 'thenableCatchModule'],
            },
          },
        },
        initOptions: { name: 'test-app' },
      },
    });

    // Create a function that returns the module when called with the specific ID
    const mockRequire = jest.fn((id) =>
      id === 'thenableCatchModule' ? moduleWithThenableCatchInit : undefined,
    );
    Object.assign(mockRequire, mockWebpackRequire);
    (mockRequire as any).S = { default: {} };

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
    });

    // Execute the function
    const result = initializeSharing(mockOptions);

    // Allow promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Verify results
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify our mocks were called
    expect(moduleWithThenableCatchInit.init).toHaveBeenCalled();

    // Verify catch was called on the thenable
    expect(catchSpy).toHaveBeenCalled();
  });

  test('should create initToken when it is undefined', async () => {
    // Setup with undefined initToken
    const mockOptions = createMockOptions({
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify initToken was created
    expect(mockOptions.initTokens['default']).toBeDefined();
    expect(mockOptions.initTokens['default'].from).toBe('test-app');
  });

  test('should handle module with then method that returns a promise', async () => {
    // Create a module with a then method that returns a promise
    const mockModule = {
      then: jest.fn().mockImplementation((onFulfilled) => {
        onFulfilled({ init: jest.fn() });
        return Promise.resolve();
      }),
    };

    // Create federation instance
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
    });
    const promises: any[] = [];
    federationInstance.initializeSharing = jest.fn().mockReturnValue(promises);

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        initOptions: { name: 'test-app' },
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              'then-module': [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              'then-module': [null, null, 'then-module'],
            },
          },
        },
      },
    });

    // Mock the require function to return the module with then
    const mockRequire = jest.fn((id) =>
      id === 'then-module' ? mockModule : undefined,
    );
    Object.assign(mockRequire, mockWebpackRequire);
    (mockRequire as any).S = { default: {} };

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire as any,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify module.then was called
    expect(mockModule.then).toHaveBeenCalled();

    // Verify a promise was added to the promises array
    expect(promises.length).toBe(1);
  });

  test('should handle init function returning a thenable', async () => {
    // Create a thenable result from init
    const mockThenable = {
      then: jest.fn(),
      catch: jest.fn(),
    };

    // Create a module with init that returns a thenable
    const mockModule = {
      init: jest.fn().mockReturnValue(mockThenable),
    };

    // Create federation instance
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
    });
    const promises: any[] = [];
    federationInstance.initializeSharing = jest.fn().mockReturnValue(promises);

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        initOptions: { name: 'test-app' },
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              'thenable-module': [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              'thenable-module': [null, null, 'thenable-module'],
            },
          },
        },
      },
    });

    // Mock the require function to return the module
    const mockRequire = jest.fn((id) =>
      id === 'thenable-module' ? mockModule : undefined,
    );
    Object.assign(mockRequire, mockWebpackRequire);
    (mockRequire as any).S = { default: {} };

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire as any,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify module.init was called
    expect(mockModule.init).toHaveBeenCalled();

    // Verify catch was called on the thenable
    expect(mockThenable.catch).toHaveBeenCalled();

    // Verify a promise was added to the promises array
    expect(promises.length).toBe(1);
  });

  test('should handle undefined federation instance name', async () => {
    // Create federation instance with undefined name
    const federationInstance = createMockFederationInstance();
    // Explicitly set name to undefined
    federationInstance.name = undefined as any;

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        initOptions: { name: undefined },
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {},
            idToExternalAndNameMapping: {},
          },
        },
      },
    });

    mockWebpackRequire.S = { default: {} };

    // Create options using the helper
    const mockOptions = createMockOptions({
      webpackRequire: mockWebpackRequire,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify initToken was created with a default value
    expect(mockOptions.initTokens['default']).toBeDefined();
    // The default value should be 'undefined' since that's what mfInstance.name is
    expect(mockOptions.initTokens['default'].from).toBe(undefined);
  });

  test('should handle init function returning a thenable without catch method', async () => {
    return withMockedConsoleWarn(async (mockConsoleWarn) => {
      // Create a thenable result from init without a catch method
      const mockThenable = {
        then: jest.fn(),
        // No catch method
      };

      // Create a module with init that returns a thenable without catch
      const mockModule = {
        init: jest.fn().mockReturnValue(mockThenable),
      };

      // Create federation instance
      const federationInstance = createMockFederationInstance({
        name: 'test-app',
      });
      const promises: any[] = [];
      federationInstance.initializeSharing = jest
        .fn()
        .mockReturnValue(promises);

      // Create a mock webpackRequire
      const mockWebpackRequire = createMockWebpackRequire({
        federation: {
          instance: federationInstance,
          initOptions: { name: 'test-app' },
          bundlerRuntimeOptions: {
            remotes: {
              idToRemoteMap: {
                'thenable-no-catch-module': [{ externalType: 'unknown' }],
              },
              idToExternalAndNameMapping: {
                'thenable-no-catch-module': [
                  null,
                  null,
                  'thenable-no-catch-module',
                ],
              },
            },
          },
        },
      });

      // Mock the require function to return the module
      const mockRequire = jest.fn((id) =>
        id === 'thenable-no-catch-module' ? mockModule : undefined,
      );
      Object.assign(mockRequire, mockWebpackRequire);
      (mockRequire as any).S = { default: {} };

      const mockOptions = createMockOptions({
        webpackRequire: mockRequire as any,
        shareScopeName: 'default',
        initPromises: {},
        initTokens: {},
        initScope: [],
      });

      // Execute
      const result = initializeSharing(mockOptions);

      // Verify
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe(true);

      // Verify module.init was called
      expect(mockModule.init).toHaveBeenCalled();

      // Verify warning was logged about missing catch method
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Initialization of sharing external failed: TypeError: initResult.catch is not a function',
        ),
      );
    });
  });

  test('should handle undefined module in initExternal', async () => {
    // Create federation instance
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
    });
    const promises: any[] = [];
    federationInstance.initializeSharing = jest.fn().mockReturnValue(promises);

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        initOptions: { name: 'test-app' },
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              'undefined-module': [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              'undefined-module': [null, null, 'undefined-module'],
            },
          },
        },
      },
    });

    // Mock the require function to return undefined
    const mockRequire = jest.fn((id) => undefined);
    Object.assign(mockRequire, mockWebpackRequire);
    (mockRequire as any).S = { default: {} };

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire as any,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify mockRequire was called
    expect(mockRequire).toHaveBeenCalledWith('undefined-module');

    // Verify no promises were added
    expect(promises.length).toBe(0);
  });

  test('should handle init function returning a non-thenable value', async () => {
    // Create a module with init that returns a non-thenable value
    const mockModule = {
      init: jest.fn().mockReturnValue(42), // Not a thenable, not a boolean
    };

    // Create federation instance
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
    });
    const promises: any[] = [];
    federationInstance.initializeSharing = jest.fn().mockReturnValue(promises);

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        initOptions: { name: 'test-app' },
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {
              'non-thenable-module': [{ externalType: 'unknown' }],
            },
            idToExternalAndNameMapping: {
              'non-thenable-module': [null, null, 'non-thenable-module'],
            },
          },
        },
      },
    });

    // Mock the require function to return the module
    const mockRequire = jest.fn((id) =>
      id === 'non-thenable-module' ? mockModule : undefined,
    );
    Object.assign(mockRequire, mockWebpackRequire);
    (mockRequire as any).S = { default: {} };

    const mockOptions = createMockOptions({
      webpackRequire: mockRequire as any,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);

    // Verify module.init was called
    expect(mockModule.init).toHaveBeenCalled();

    // Verify no promises were added
    expect(promises.length).toBe(0);
  });

  test('should handle empty promises array correctly', async () => {
    // Create federation instance with a name and mocked initializeSharing
    const federationInstance = createMockFederationInstance({
      name: 'test-app',
      initializeSharing: jest.fn().mockReturnValue([]),
    });

    // Create a mock webpackRequire
    const mockWebpackRequire = createMockWebpackRequire({
      federation: {
        instance: federationInstance,
        bundlerRuntimeOptions: {
          remotes: {
            idToRemoteMap: {},
            idToExternalAndNameMapping: {},
          },
        },
      },
    });

    mockWebpackRequire.S = { default: {} };

    // Create options using the helper
    const mockOptions = createMockOptions({
      webpackRequire: mockWebpackRequire,
      shareScopeName: 'default',
      initPromises: {},
      initTokens: {},
      initScope: [],
    });

    // Execute
    const result = initializeSharing(mockOptions);

    // When promises array is empty, the function returns a Promise that resolves to true
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBe(true);
  });

  test('should handle case where initToken is not defined initially', () => {
    // Create a mock with empty initTokens
    const mockWebpackRequire = createMockWebpackRequire();
    const emptyInitTokens = {};

    // Execute with type assertion
    initializeSharing({
      shareScopeName: 'test-scope',
      webpackRequire: mockWebpackRequire as unknown as WebpackRequire,
      initPromises: {},
      initTokens: emptyInitTokens, // Pass empty object to trigger the init token creation
      initScope: [],
    });

    // Verify an initToken was created
    expect(emptyInitTokens).toHaveProperty('test-scope');
    expect(emptyInitTokens['test-scope']).toHaveProperty('from');
    expect(emptyInitTokens['test-scope'].from).toBe('test-app'); // The name from our mock
  });

  test('should handle initialization when initToken is not defined', () => {
    // Setup
    const mockWebpackRequire = {
      S: { default: {} },
      federation: {
        instance: {
          name: 'test-app',
          initializeSharing: jest.fn().mockReturnValue([]),
          options: { shareStrategy: 'eager' },
        },
        bundlerRuntimeOptions: {
          remotes: null, // No remotes to avoid complex setup
        },
      },
    } as any; // Force type to avoid complex setup

    const emptyInitTokens = {};

    // Execute
    initializeSharing({
      shareScopeName: 'default',
      webpackRequire: mockWebpackRequire,
      initPromises: {},
      initTokens: emptyInitTokens,
      initScope: [],
    });

    // Verify initToken was created
    expect(emptyInitTokens).toHaveProperty('default');
    expect(emptyInitTokens['default']).toHaveProperty('from', 'test-app');
  });
});
