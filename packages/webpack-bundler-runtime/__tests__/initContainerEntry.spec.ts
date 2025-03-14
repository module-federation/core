import { initContainerEntry } from '../src/initContainerEntry';
import type { InitContainerEntryOptions, WebpackRequire } from '../src/types';
import type { RemoteEntryInitOptions } from '@module-federation/runtime/types';

describe('initContainerEntry', () => {
  test('should return undefined if webpackRequire.S is not defined', () => {
    // Setup
    const mockOptions: InitContainerEntryOptions = {
      webpackRequire: {
        S: undefined,
        federation: {
          instance: {
            initOptions: jest.fn(),
            initShareScopeMap: jest.fn(),
          },
          initOptions: {
            name: 'test-app',
          },
        },
      } as any,
      shareScope: {},
      shareScopeKey: 'default',
    };

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify
    expect(result).toBeUndefined();
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).not.toHaveBeenCalled();
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).not.toHaveBeenCalled();
  });

  test('should return undefined if federation is not defined', () => {
    // Setup
    const mockOptions: InitContainerEntryOptions = {
      webpackRequire: {
        S: {},
        federation: undefined,
      } as any,
      shareScope: {},
      shareScopeKey: 'default',
    };

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify
    expect(result).toBeUndefined();
  });

  test('should return undefined if federation.instance is not defined', () => {
    // Setup
    const mockOptions: InitContainerEntryOptions = {
      webpackRequire: {
        S: {},
        federation: {
          instance: undefined,
          initOptions: {
            name: 'test-app',
          },
        },
      } as any,
      shareScope: {},
      shareScopeKey: 'default',
    };

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify
    expect(result).toBeUndefined();
  });

  test('should return undefined if federation.initOptions is not defined', () => {
    // Setup
    const mockOptions: InitContainerEntryOptions = {
      webpackRequire: {
        S: {},
        federation: {
          instance: {
            initOptions: jest.fn(),
            initShareScopeMap: jest.fn(),
          },
          initOptions: undefined,
        },
      } as any,
      shareScope: {},
      shareScopeKey: 'default',
    };

    // Execute
    const result = initContainerEntry(mockOptions);

    // Verify
    expect(result).toBeUndefined();
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).not.toHaveBeenCalled();
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).not.toHaveBeenCalled();
  });

  test('should initialize container entry with default values', () => {
    // Setup
    const mockIFunction = jest.fn();
    const mockPrefetch = jest.fn();
    const mockAttachShareScopeMap = jest.fn();
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
            remotes: ['remote1', 'remote2'],
          },
          attachShareScopeMap: mockAttachShareScopeMap,
          prefetch: mockPrefetch,
        },
        I: mockIFunction,
      } as any,
      shareScope: {
        react: { singleton: true, requiredVersion: '18.0.0' },
      } as any,
      shareScopeKey: 'default',
    };

    // Execute
    initContainerEntry(mockOptions);

    // Verify
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).toHaveBeenCalledWith({
      name: 'test-app',
      remotes: [],
    });
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'default',
      { react: { singleton: true, requiredVersion: '18.0.0' } },
      { hostShareScopeMap: {} },
    );
    expect(mockAttachShareScopeMap).toHaveBeenCalledWith(
      mockOptions.webpackRequire,
    );
    expect(mockPrefetch).toHaveBeenCalled();
    expect(mockIFunction).toHaveBeenCalledWith('default', undefined);
  });

  test('should use remoteEntryInitOptions if provided', () => {
    // Setup
    const mockIFunction = jest.fn();
    const remoteEntryInitOptions: RemoteEntryInitOptions = {
      version: '1.0.0',
      shareScopeMap: { otherScope: {} },
      shareScopeKeys: [],
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
      shareScopeKey: 'custom',
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
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'custom',
      {},
      { hostShareScopeMap: remoteEntryInitOptions.shareScopeMap },
    );
    expect(mockIFunction).toHaveBeenCalledWith('custom', []);
  });

  test('should not call prefetch when it is not a function', () => {
    // Setup
    const mockIFunction = jest.fn();
    const mockAttachShareScopeMap = jest.fn();
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
          attachShareScopeMap: mockAttachShareScopeMap,
          prefetch: undefined,
        },
        I: mockIFunction,
      } as any,
      shareScope: {},
      shareScopeKey: 'default',
    };

    // Execute
    initContainerEntry(mockOptions);

    // Verify
    expect(
      mockOptions.webpackRequire.federation.instance?.initOptions,
    ).toHaveBeenCalled();
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalled();
    expect(mockAttachShareScopeMap).toHaveBeenCalledWith(
      mockOptions.webpackRequire,
    );
    expect(mockIFunction).toHaveBeenCalledWith('default', undefined);
  });

  test('should handle remoteEntryInitOptions without shareScopeMap', () => {
    // Setup
    const mockIFunction = jest.fn();
    const remoteEntryInitOptions: RemoteEntryInitOptions = {
      version: '1.0.0',
      shareScopeKeys: ['default'],
      // No shareScopeMap property
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
      shareScopeKey: 'custom',
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
    // Should use empty object when shareScopeMap is not provided
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('custom', {}, { hostShareScopeMap: {} });
    expect(mockIFunction).toHaveBeenCalledWith('custom', []);
  });

  test('should explicitly verify both branches of shareScopeMap condition', () => {
    // Setup case 1: With remoteEntryInitOptions but null shareScopeMap
    const mockIFunction1 = jest.fn();
    const remoteEntryInitOptions1: RemoteEntryInitOptions = {
      version: '1.0.0',
      shareScopeKeys: [],
      shareScopeMap: null as any, // Explicitly test null case
    };
    const mockOptions1: InitContainerEntryOptions = {
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
        I: mockIFunction1,
      } as any,
      shareScope: {},
      shareScopeKey: 'custom',
      remoteEntryInitOptions: remoteEntryInitOptions1,
    };

    // Execute case 1
    initContainerEntry(mockOptions1);

    // Verify case 1 - should use empty object for null shareScopeMap
    expect(
      mockOptions1.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('custom', {}, { hostShareScopeMap: {} });

    // Setup case 2: With remoteEntryInitOptions and defined shareScopeMap
    const mockIFunction2 = jest.fn();
    const shareScopeMap = { test: { something: true } } as any; // Cast to any to avoid type errors
    const remoteEntryInitOptions2: RemoteEntryInitOptions = {
      version: '1.0.0',
      shareScopeKeys: [],
      shareScopeMap: shareScopeMap,
    };
    const mockOptions2: InitContainerEntryOptions = {
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
        I: mockIFunction2,
      } as any,
      shareScope: {},
      shareScopeKey: 'custom',
      remoteEntryInitOptions: remoteEntryInitOptions2,
    };

    // Execute case 2
    initContainerEntry(mockOptions2);

    // Verify case 2 - should use provided shareScopeMap
    expect(
      mockOptions2.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith('custom', {}, { hostShareScopeMap: shareScopeMap });
  });

  test('should use default name when shareScopeKey is falsy', () => {
    // Setup
    const mockIFunction = jest.fn();
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
      shareScopeKey: '', // Empty string is falsy
    };

    // Execute
    initContainerEntry(mockOptions);

    // Verify - should use 'default' as the name
    expect(
      mockOptions.webpackRequire.federation.instance?.initShareScopeMap,
    ).toHaveBeenCalledWith(
      'default', // Should use 'default' as the name
      {},
      { hostShareScopeMap: {} },
    );
    expect(mockIFunction).toHaveBeenCalledWith('default', undefined);
  });
});
