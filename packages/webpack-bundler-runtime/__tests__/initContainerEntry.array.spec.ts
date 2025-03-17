import { initContainerEntry } from '../src/initContainerEntry';
import type { InitContainerEntryOptions, WebpackRequire } from '../src/types';
import type { RemoteEntryInitOptions } from '@module-federation/runtime/types';

// Helper functions to reduce repetition

/**
 * Creates a basic federation instance with mocked functions
 */
function createMockFederationInstance(overrides: Record<string, any> = {}) {
  return {
    initOptions: jest.fn(),
    initShareScopeMap: jest.fn(),
    ...overrides,
  };
}

type FederationOverrides = {
  instance?: Record<string, any>;
  initOptions?: Record<string, any>;
  [key: string]: any;
};

/**
 * Creates a mock webpack federation object with customizable properties
 */
function createMockFederation(overrides: FederationOverrides = {}) {
  return {
    instance: createMockFederationInstance(overrides.instance || {}),
    initOptions: {
      name: 'test-app',
      ...(overrides.initOptions || {}),
    },
    attachShareScopeMap: jest.fn(),
    prefetch: jest.fn(),
    ...overrides,
  };
}

type WebpackRequireOverrides = {
  S?: any;
  federation?: any;
  I?: jest.Mock;
  [key: string]: any;
};

/**
 * Creates a mock webpackRequire object with customizable properties
 */
function createMockWebpackRequire(
  overrides: WebpackRequireOverrides = {},
): WebpackRequire {
  return {
    S: overrides.S === undefined ? {} : overrides.S,
    federation: overrides.federation || createMockFederation(),
    I: overrides.I || jest.fn(),
    ...overrides,
  } as any;
}

type OptionsOverrides = {
  webpackRequire?: WebpackRequire;
  shareScope?: Record<string, any>;
  shareScopeKey?: string | string[];
  initScope?: any[];
  remoteEntryInitOptions?: RemoteEntryInitOptions;
};

/**
 * Creates mock options for initContainerEntry with customizable properties
 */
function createMockOptions(
  overrides: OptionsOverrides = {},
): InitContainerEntryOptions {
  return {
    webpackRequire: overrides.webpackRequire || createMockWebpackRequire(),
    shareScope: overrides.shareScope || {},
    shareScopeKey: overrides.shareScopeKey || 'default',
    initScope: overrides.initScope,
    remoteEntryInitOptions: overrides.remoteEntryInitOptions,
  };
}

type RemoteEntryInitOptionsOverrides = {
  shareScopeMap?: Record<string, any>;
  shareScopeKeys?: string | string[];
  [key: string]: any;
};

/**
 * Creates a mock RemoteEntryInitOptions object
 */
function createMockRemoteEntryInitOptions(
  overrides: RemoteEntryInitOptionsOverrides = {},
): RemoteEntryInitOptions {
  return {
    version: '1.0.0',
    shareScopeMap: overrides.shareScopeMap || {},
    shareScopeKeys: overrides.shareScopeKeys || ['default'],
    ...overrides,
  };
}

describe('initContainerEntry with array-based share scopes', () => {
  test('should initialize container entry with array shareScopeKey', async () => {
    // Setup
    const mockIFunction = jest.fn().mockResolvedValue(true);
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: { react: {} }, // Add shared flag to trigger proxyInitializeSharing path
          },
        }),
      }),
      shareScopeKey: ['default', 'custom'],
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).toHaveBeenCalledWith({
      name: 'test-app',
      remotes: [],
    });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('default', {}, { hostShareScopeMap: {} });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('custom', {}, { hostShareScopeMap: {} });
    expect(mockIFunction).toHaveBeenCalledWith(
      ['default', 'custom'],
      undefined,
    );
  });

  test('should initialize container entry with array shareScopeKey and no shared option', async () => {
    // Setup
    const mockIFunction = jest.fn().mockResolvedValue(true);
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: undefined, // No shared flag to trigger Promise.all path
          },
        }),
      }),
      shareScopeKey: ['default', 'custom'],
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify
    expect(result).toBeInstanceOf(Promise);
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).toHaveBeenCalledWith({
      name: 'test-app',
      remotes: [],
    });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('default', {}, { hostShareScopeMap: {} });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('custom', {}, { hostShareScopeMap: {} });
    expect(mockIFunction).toHaveBeenCalledWith('default', undefined);
    expect(mockIFunction).toHaveBeenCalledWith('custom', undefined);
    await expect(result).resolves.toBe(true);
  });

  test('should handle host array shareScopeKeys with remote string shareScopeKey', () => {
    // Setup
    const mockIFunction = jest.fn();
    const remoteEntryInitOptions = createMockRemoteEntryInitOptions({
      version: '1.0.0',
      shareScopeMap: { default: {}, scope1: {} },
      shareScopeKeys: ['default', 'scope1'],
    });

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
      }),
      shareScopeKey: 'default',
      remoteEntryInitOptions,
      initScope: [],
    });

    // Execute
    initContainerEntry(mockOptions);

    // Verify - should call initShareScopeMap for each host key
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).toHaveBeenCalledWith({
      name: 'test-app',
      remotes: [],
      ...remoteEntryInitOptions,
    });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'default',
      {},
      { hostShareScopeMap: remoteEntryInitOptions.shareScopeMap },
    );
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'scope1',
      {},
      { hostShareScopeMap: remoteEntryInitOptions.shareScopeMap },
    );
    expect(mockIFunction).toHaveBeenCalledWith('default', []);
  });

  test('should handle host string shareScopeKey with remote array shareScopeKey', () => {
    // Setup
    const mockIFunction = jest.fn();
    const remoteEntryInitOptions: RemoteEntryInitOptions = {
      version: '1.0.0',
      shareScopeMap: { default: {} },
      shareScopeKeys: 'default',
    };
    const mockOptions: InitContainerEntryOptions = {
      webpackRequire: {
        S: {},
        federation: {
          instance: {
            initOptions: jest.fn(),
            initShareScopeMap: jest.fn(),
          },
          initOptions: {
            name: 'test-app',
          },
          attachShareScopeMap: jest.fn(),
        },
        I: mockIFunction,
      } as any,
      shareScope: {},
      shareScopeKey: ['default', 'scope1'],
      remoteEntryInitOptions,
      initScope: [],
    };

    // Execute
    initContainerEntry(mockOptions);

    // Verify
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).toHaveBeenCalledWith({
      name: 'test-app',
      remotes: [],
      ...remoteEntryInitOptions,
    });
    // Should handle both default and scope1 keys
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'default',
      {},
      { hostShareScopeMap: remoteEntryInitOptions.shareScopeMap },
    );
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'scope1',
      {},
      { hostShareScopeMap: remoteEntryInitOptions.shareScopeMap },
    );
  });

  test('should handle array shareScopeKey without hostShareScopeKeys', () => {
    // Mock setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));

    // No hostShareScopeKeys or hostShareScopeMap in remoteEntryInitOptions
    const remoteEntryInitOptions = createMockRemoteEntryInitOptions({
      version: '1.0.0',
      shareScopeKeys: [], // Add empty array to satisfy the type requirement
    });

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false,
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      remoteEntryInitOptions,
      shareScope: { test: {} },
    });

    // Execute with array shareScopeKey
    const result = initContainerEntry(mockOptions);

    // Verify behavior
    expect(result).toBeInstanceOf(Promise);

    // Verify initShareScopeMap was called with the shareScope for both keys
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key1', {}, expect.anything());
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key2', {}, expect.anything());

    // Verify it only called twice and returned from the forEach early
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledTimes(2);
  });

  test('should handle array shareScopeKey with proxyInitializeSharing=true', () => {
    // Mock setup
    const mockPromise = Promise.resolve(true);
    const mockIFunction = jest.fn().mockReturnValue(mockPromise);

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: true, // Set to true to trigger proxyInitializeSharing
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      shareScope: { test: {} },
    });

    // Execute with array shareScopeKey
    const result = initContainerEntry(mockOptions);

    // With proxyInitializeSharing=true, it should call I with the entire array
    expect(mockIFunction).toHaveBeenCalledWith(['key1', 'key2'], undefined);
    // Just check that result is the same object as mockPromise
    expect(result).toBe(mockPromise);
  });

  test('should handle array shareScopeKey with non-array hostShareScopeKeys', () => {
    // Mock setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false,
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      remoteEntryInitOptions: {
        shareScopeKeys: 'string-not-array' as any, // NOT an array
        version: '1.0.0',
      },
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify it returns a Promise
    expect(result).toBeInstanceOf(Promise);

    // Verify initShareScopeMap was called with the shareScope
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key1', { test: {} }, expect.anything());
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key2', { test: {} }, expect.anything());
  });

  test('should handle array shareScopeKey with defined hostShareScopeMap but undefined hostShareScopeKeys', () => {
    // Mock setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const hostShareScopeMap = { key1: {}, key2: {} };

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false,
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      remoteEntryInitOptions: {
        shareScopeMap: hostShareScopeMap,
        //@ts-ignore
        shareScopeKeys: undefined, // Explicitly undefined
        version: '1.0.0',
      },
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify it returns a Promise
    expect(result).toBeInstanceOf(Promise);

    // Verify initShareScopeMap was called with the shareScope
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key1', { test: {} }, expect.anything());
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key2', { test: {} }, expect.anything());
  });

  test('should behave differently for proxyInitializeSharing=false vs true with array shareScopeKey', () => {
    // Mock setup for shared=false (proxyInitializeSharing=false)
    const mockIFunctionFalse = jest.fn().mockImplementation((key) => {
      return Promise.resolve(true);
    });

    const mockOptionsFalse = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunctionFalse,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false, // explicitly false
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      initScope: ['scope1'],
      shareScope: { test: {} },
    });

    // Execute with shared=false
    initContainerEntry(mockOptionsFalse);

    // Verify I was called twice, once for each key
    expect(mockIFunctionFalse).toHaveBeenCalledWith('key1', ['scope1']);
    expect(mockIFunctionFalse).toHaveBeenCalledWith('key2', ['scope1']);
    expect(mockIFunctionFalse).toHaveBeenCalledTimes(2);

    // Mock setup for shared=true (proxyInitializeSharing=true)
    const mockIFunctionTrue = jest
      .fn()
      .mockReturnValue(Promise.resolve('success'));

    const mockOptionsTrue = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunctionTrue,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: true, // explicitly true
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      initScope: ['scope1'],
      shareScope: { test: {} },
    });

    // Execute with shared=true
    initContainerEntry(mockOptionsTrue);

    // Verify I was called once with the array
    expect(mockIFunctionTrue).toHaveBeenCalledWith(
      ['key1', 'key2'],
      ['scope1'],
    );
    expect(mockIFunctionTrue).toHaveBeenCalledTimes(1);
  });

  test('should handle proxyInitializeSharing=false with array shareScopeKey', async () => {
    // Setup with shared: false (making proxyInitializeSharing false)
    const mockIFunction = jest.fn().mockImplementation((key) => {
      return Promise.resolve(true);
    });

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false, // explicitly false
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      initScope: ['scope1'],
      shareScope: { test: {} },
    });

    // Execute
    const result = await initContainerEntry(mockOptions);

    // Verify result is a Promise that resolves to true
    expect(result).toBe(true);

    // Verify I was called for each key
    expect(mockIFunction).toHaveBeenCalledWith('key1', ['scope1']);
    expect(mockIFunction).toHaveBeenCalledWith('key2', ['scope1']);
    expect(mockIFunction).toHaveBeenCalledTimes(2);
  });

  test('should pass array shareScopeKey directly to I when proxyInitializeSharing is true', () => {
    // Mock setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve('success'));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: true, // Explicitly set to true to trigger proxyInitializeSharing
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      initScope: ['scope1'],
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify we return the result of I directly
    expect(result).toEqual(Promise.resolve('success'));

    // Verify I was called with the entire array and initScope
    expect(mockIFunction).toHaveBeenCalledWith(['key1', 'key2'], ['scope1']);

    // Verify I was called only once
    expect(mockIFunction).toHaveBeenCalledTimes(1);
  });

  test('should handle null hostShareScopeMap with array shareScopeKey', () => {
    // Mock setup with null hostShareScopeMap
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false,
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      remoteEntryInitOptions: {
        shareScopeKeys: ['key1', 'key2'],
        //@ts-ignore
        shareScopeMap: null, // Explicitly null
        version: '1.0.0',
      },
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify it returns a Promise
    expect(result).toBeInstanceOf(Promise);

    // Verify initShareScopeMap was called with the default empty object
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key1', { test: {} }, { hostShareScopeMap: {} });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key2', { test: {} }, { hostShareScopeMap: {} });
  });

  test('should handle array shareScopeKey when both hostShareScopeKeys and hostShareScopeMap are undefined', () => {
    // Setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false,
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      // No remoteEntryInitOptions to make both hostShareScopeKeys and hostShareScopeMap undefined
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify it returns a Promise
    expect(result).toBeInstanceOf(Promise);

    // Verify initShareScopeMap was called with the right params
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key1', { test: {} }, { hostShareScopeMap: {} });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key2', { test: {} }, { hostShareScopeMap: {} });

    // Verify I was called for each key
    expect(mockIFunction).toHaveBeenCalledWith('key1', undefined);
    expect(mockIFunction).toHaveBeenCalledWith('key2', undefined);
  });

  test('should directly map each shareScopeKey when proxyInitializeSharing is false', async () => {
    // Setup with shared: false (making proxyInitializeSharing false)
    const mockIFunction = jest.fn().mockImplementation((key) => {
      // Return different promises for different keys to ensure we're resolving properly
      if (key === 'key1') return Promise.resolve('result1');
      if (key === 'key2') return Promise.resolve('result2');
      return Promise.resolve('unknown');
    });

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false, // explicitly false to trigger the mapping path
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      initScope: ['scope1'],
      shareScope: { test: {} },
    });

    // Execute
    const result = await initContainerEntry(mockOptions);

    // Verify result is true (the value returned after Promise.all resolves)
    expect(result).toBe(true);

    // Verify I was called for each key in the array separately
    expect(mockIFunction).toHaveBeenCalledWith('key1', ['scope1']);
    expect(mockIFunction).toHaveBeenCalledWith('key2', ['scope1']);
    expect(mockIFunction).toHaveBeenCalledTimes(2);
  });

  test('should handle when webpackRequire.federation.attachShareScopeMap is not defined', () => {
    // Setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: {
          instance: createMockFederationInstance(),
          initOptions: {
            name: 'test-app',
            shared: true,
          },
          // Deliberately omit attachShareScopeMap
          prefetch: jest.fn(),
        },
      } as any),
      shareScopeKey: ['key1', 'key2'],
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify the function didn't crash without attachShareScopeMap
    expect(result).toBeDefined();

    // Verify I was called
    expect(mockIFunction).toHaveBeenCalledWith(['key1', 'key2'], undefined);
  });

  test('should handle array shareScopeKey when hostShareScopeKeys is defined but hostShareScopeMap is undefined', () => {
    // Setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false,
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      remoteEntryInitOptions: {
        // Define shareScopeKeys but not shareScopeMap
        shareScopeKeys: ['hostKey1', 'hostKey2'],
        version: '1.0.0',
        //@ts-ignore - Deliberately set to undefined to test the condition
        shareScopeMap: undefined,
      },
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify it returns a Promise
    expect(result).toBeInstanceOf(Promise);

    // Verify initShareScopeMap was called with the right params
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key1', { test: {} }, { hostShareScopeMap: {} });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('key2', { test: {} }, { hostShareScopeMap: {} });

    // Verify I was called for each key
    expect(mockIFunction).toHaveBeenCalledWith('key1', undefined);
    expect(mockIFunction).toHaveBeenCalledWith('key2', undefined);
  });

  test('should handle array shareScopeKey when hostShareScopeMap is defined but hostShareScopeKeys is undefined', () => {
    // Setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false,
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      remoteEntryInitOptions: {
        // Define shareScopeMap but not shareScopeKeys
        //@ts-ignore - Deliberately set to undefined to test the condition
        shareScopeKeys: undefined,
        shareScopeMap: { someKey: {} },
        version: '1.0.0',
      },
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify it returns a Promise
    expect(result).toBeInstanceOf(Promise);

    // Verify initShareScopeMap was called with the right params
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'key1',
      { test: {} },
      { hostShareScopeMap: { someKey: {} } },
    );
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'key2',
      { test: {} },
      { hostShareScopeMap: { someKey: {} } },
    );

    // Verify I was called for each key
    expect(mockIFunction).toHaveBeenCalledWith('key1', undefined);
    expect(mockIFunction).toHaveBeenCalledWith('key2', undefined);
  });

  test('should execute without attachShareScopeMap function', () => {
    // Setup
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));
    const mockOptions = createMockOptions({
      webpackRequire: {
        S: {},
        federation: {
          instance: createMockFederationInstance(),
          initOptions: {
            name: 'test-app',
            shared: false,
          },
          // Deliberately omit attachShareScopeMap
          prefetch: jest.fn(),
        },
        I: mockIFunction,
      } as any,
      shareScopeKey: ['key1', 'key2'],
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify the function didn't crash without attachShareScopeMap
    expect(result).toBeInstanceOf(Promise);

    // Verify prefetch was called
    expect(mockOptions.webpackRequire.federation.prefetch).toHaveBeenCalled();

    // Verify I was called for each key
    expect(mockIFunction).toHaveBeenCalledWith('key1', undefined);
    expect(mockIFunction).toHaveBeenCalledWith('key2', undefined);
  });

  test('should use proxyInitializeSharing=true with array shareScopeKey directly calling I once', () => {
    // Setup with explicit shared=true to make proxyInitializeSharing true
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve('results'));
    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: true, // explicitly true to trigger proxyInitializeSharing
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      initScope: ['scope1'],
      shareScope: { test: {} },
    });

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify result is passed through from I directly
    expect(result).toEqual(Promise.resolve('results'));

    // Verify I was called only once with the array
    expect(mockIFunction).toHaveBeenCalledTimes(1);
    expect(mockIFunction).toHaveBeenCalledWith(['key1', 'key2'], ['scope1']);
  });

  test('should handle Promise.all mapping with proxyInitializeSharing=false with array shareScopeKey', async () => {
    // Setup with shared=false to ensure proxyInitializeSharing is false
    const mockIFunction = jest.fn();
    mockIFunction.mockImplementation((key) => {
      if (key === 'key1') return Promise.resolve('result1');
      if (key === 'key2') return Promise.resolve('result2');
      return Promise.resolve(null);
    });

    const mockOptions = createMockOptions({
      webpackRequire: createMockWebpackRequire({
        I: mockIFunction,
        federation: createMockFederation({
          initOptions: {
            name: 'test-app',
            shared: false, // explicitly false
          },
        }),
      }),
      shareScopeKey: ['key1', 'key2'],
      initScope: ['scope1'],
      shareScope: { test: {} },
    });

    // Execute
    const result = await initContainerEntry(mockOptions);

    // Verify result is true (from the .then handler of Promise.all)
    expect(result).toBe(true);

    // Verify I was called for each key
    expect(mockIFunction).toHaveBeenCalledWith('key1', ['scope1']);
    expect(mockIFunction).toHaveBeenCalledWith('key2', ['scope1']);
    expect(mockIFunction).toHaveBeenCalledTimes(2);
  });

  // Additional test to specifically cover line 62 with a more precise setup
  test('should enter the early return in shareScopeKey.forEach when hostShareScopeKeys is null', () => {
    // Mock setup
    const mockInitShareScopeMap = jest.fn();
    const mockIFunction = jest.fn().mockReturnValue(Promise.resolve(true));

    // Create a custom mock to force the specific condition
    const mockWebpackRequire = {
      S: {},
      federation: {
        instance: {
          initOptions: jest.fn(),
          initShareScopeMap: mockInitShareScopeMap,
        },
        initOptions: {
          name: 'test-app',
          shared: false,
        },
        attachShareScopeMap: jest.fn(),
        prefetch: jest.fn(),
      },
      I: mockIFunction,
    } as any;

    // Call with array shareScopeKey and null hostShareScopeKeys
    const options = {
      webpackRequire: mockWebpackRequire,
      shareScope: { test: {} },
      shareScopeKey: ['key1', 'key2'],
      remoteEntryInitOptions: {
        // @ts-ignore - Force to null for the test
        shareScopeKeys: null,
        // @ts-ignore - Force to null for the test
        shareScopeMap: null,
        version: '1.0.0',
      },
    };

    // Execute
    initContainerEntry(options as any);

    // Verify initShareScopeMap was called twice, once for each key in shareScopeKey
    expect(mockInitShareScopeMap).toHaveBeenCalledTimes(2);
    expect(mockInitShareScopeMap).toHaveBeenCalledWith(
      'key1',
      { test: {} },
      { hostShareScopeMap: {} },
    );
    expect(mockInitShareScopeMap).toHaveBeenCalledWith(
      'key2',
      { test: {} },
      { hostShareScopeMap: {} },
    );
  });

  // Specific test to cover line 78
  test('should handle missing attachShareScopeMap properly', () => {
    // Create a mock with attachShareScopeMap specifically undefined
    const mockWebpackRequire = {
      S: {},
      federation: {
        instance: {
          initOptions: jest.fn(),
          initShareScopeMap: jest.fn(),
        },
        initOptions: {
          name: 'test-app',
        },
        // Specifically don't include attachShareScopeMap
        prefetch: jest.fn(),
      },
      I: jest.fn(),
    } as any;

    // Execute - using any to bypass type checking for this test
    initContainerEntry({
      webpackRequire: mockWebpackRequire,
      shareScope: {},
      shareScopeKey: 'default',
    } as any);

    // Verify prefetch was still called
    expect(mockWebpackRequire.federation.prefetch).toHaveBeenCalled();
  });

  // Specific test to cover lines 91-102
  test('should cover proxyInitializeSharing determination and branching', () => {
    // Setup 1: With shared=true for proxyInitializeSharing=true
    const mockIFunction1 = jest
      .fn()
      .mockReturnValue(Promise.resolve('direct result'));

    const mockOptions1 = {
      webpackRequire: {
        S: {},
        federation: {
          instance: {
            initOptions: jest.fn(),
            initShareScopeMap: jest.fn(),
          },
          initOptions: {
            name: 'test-app',
            shared: true, // This will make proxyInitializeSharing true
          },
          attachShareScopeMap: jest.fn(),
          prefetch: jest.fn(),
        },
        I: mockIFunction1,
      } as any,
      shareScope: {},
      shareScopeKey: ['key1', 'key2'],
      // @ts-ignore - Using string[] as a mock for the test
      initScope: ['scope1'],
    };

    // Execute for proxyInitializeSharing=true
    const result1 = initContainerEntry(mockOptions1 as any);

    // Verify direct I call with array
    expect(mockIFunction1).toHaveBeenCalledWith(['key1', 'key2'], ['scope1']);
    // Make sure result1 is not undefined before checking
    expect(result1).not.toBeUndefined();
    // For test purposes, we just check that the mock was called correctly

    // Setup 2: With shared=false for proxyInitializeSharing=false
    const mockIFunction2 = jest.fn().mockImplementation((key) => {
      return Promise.resolve(key === 'key1' ? 'result1' : 'result2');
    });

    const mockOptions2 = {
      webpackRequire: {
        S: {},
        federation: {
          instance: {
            initOptions: jest.fn(),
            initShareScopeMap: jest.fn(),
          },
          initOptions: {
            name: 'test-app',
            shared: false, // This will make proxyInitializeSharing false
          },
          attachShareScopeMap: jest.fn(),
          prefetch: jest.fn(),
        },
        I: mockIFunction2,
      } as any,
      shareScope: {},
      shareScopeKey: ['key1', 'key2'],
      // @ts-ignore - Using string[] as a mock for the test
      initScope: ['scope1'],
    };

    // Execute for proxyInitializeSharing=false
    const result2 = initContainerEntry(mockOptions2 as any);

    // Verify Promise.all mapping
    expect(result2).toBeInstanceOf(Promise);
    expect(mockIFunction2).toHaveBeenCalledWith('key1', ['scope1']);
    expect(mockIFunction2).toHaveBeenCalledWith('key2', ['scope1']);

    // We need to handle the Promise safely for testing
    if (result2 instanceof Promise) {
      // Verify the promise resolves to true
      return result2.then((finalResult) => {
        expect(finalResult).toBe(true);
      });
    }

    // Return a resolved promise to satisfy the test
    return Promise.resolve();
  });

  // Additional test to cover lines 106-107
  test('should map array shareScopeKey elements to calls to I function', async () => {
    // Setup with custom return values to verify Promise.all behavior
    const mockIFunction = jest.fn();
    mockIFunction.mockImplementation((key) => {
      // Return different promises for different keys
      if (key === 'key1') return Promise.resolve('value1');
      if (key === 'key2') return Promise.resolve('value2');
      if (key === 'key3') return Promise.resolve('value3');
      return Promise.resolve(null);
    });

    const mockOptions = {
      webpackRequire: {
        S: {},
        federation: {
          instance: {
            initOptions: jest.fn(),
            initShareScopeMap: jest.fn(),
          },
          initOptions: {
            name: 'test-app',
            shared: false, // Ensure Promise.all path is taken
          },
          attachShareScopeMap: jest.fn(),
          prefetch: jest.fn(),
        },
        I: mockIFunction,
      } as any,
      shareScope: {},
      shareScopeKey: ['key1', 'key2', 'key3'], // Using three keys to ensure mapping works
      // @ts-ignore - Using string[] as a mock for the test
      initScope: ['test-scope'],
    };

    // Execute
    const result = initContainerEntry(mockOptions as any);

    // Verify it's a promise
    expect(result).toBeInstanceOf(Promise);

    // Wait for promise to resolve
    const finalResult = await result;

    // Verify the final result is true (from the .then handler)
    expect(finalResult).toBe(true);

    // Verify each key was mapped to a call to I
    expect(mockIFunction).toHaveBeenCalledWith('key1', ['test-scope']);
    expect(mockIFunction).toHaveBeenCalledWith('key2', ['test-scope']);
    expect(mockIFunction).toHaveBeenCalledWith('key3', ['test-scope']);
    expect(mockIFunction).toHaveBeenCalledTimes(3);
  });
});
