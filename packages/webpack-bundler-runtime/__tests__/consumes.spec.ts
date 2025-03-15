// Mock the dependencies
jest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: jest.fn(),
}));

// Import the actual implementation
import { consumes } from '../src/consumes';
import { attachShareScopeMap } from '../src/attachShareScopeMap';
import type { ConsumesOptions } from '../src/types';

describe('consumes', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call attachShareScopeMap with webpack require', () => {
    // Setup
    const mockOptions: ConsumesOptions = {
      chunkId: 'testChunkId',
      promises: [],
      chunkMapping: {},
      installedModules: {},
      moduleToHandlerMapping: {},
      webpackRequire: {
        o: jest.fn().mockReturnValue(false),
      } as any,
    };

    // Execute
    consumes(mockOptions);

    // Verify
    expect(attachShareScopeMap).toHaveBeenCalledWith(
      mockOptions.webpackRequire,
    );
  });

  test('should not process chunks if chunkId is not in chunkMapping', () => {
    // Setup
    const mockPromises: Promise<any>[] = [];
    const mockOptions: ConsumesOptions = {
      chunkId: 'nonExistentChunkId',
      promises: mockPromises,
      chunkMapping: {
        otherChunkId: ['moduleId1', 'moduleId2'],
      },
      installedModules: {},
      moduleToHandlerMapping: {},
      webpackRequire: {
        o: jest
          .fn()
          .mockImplementation((obj, key) =>
            Object.prototype.hasOwnProperty.call(obj, key),
          ),
      } as any,
    };

    // Execute
    consumes(mockOptions);

    // Verify
    expect(mockOptions.webpackRequire.o).toHaveBeenCalledWith(
      mockOptions.chunkMapping,
      mockOptions.chunkId,
    );
    expect(mockPromises.length).toBe(0); // No promises should be added
  });

  test('should add existing installed module promise to promises if it exists', () => {
    // Setup
    const mockModulePromise = Promise.resolve();
    const mockPromises: Promise<any>[] = [];
    const mockModuleId = 'moduleId1';
    const mockOptions: ConsumesOptions = {
      chunkId: 'testChunkId',
      promises: mockPromises,
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      installedModules: {
        [mockModuleId]: mockModulePromise,
      },
      moduleToHandlerMapping: {},
      webpackRequire: {
        o: jest
          .fn()
          .mockImplementation((obj, key) =>
            Object.prototype.hasOwnProperty.call(obj, key),
          ),
        m: {},
        c: {},
      } as any,
    };

    // Execute
    consumes(mockOptions);

    // Verify
    expect(mockPromises.length).toBe(1);
    expect(mockPromises[0]).toBe(mockModulePromise);
  });

  test('should handle module loading when federation instance is available with promise', async () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockPromises: Promise<any>[] = [];
    const mockShareKey = 'testShareKey';
    const mockShareInfo = {
      scope: ['default'],
      shareConfig: {
        singleton: true,
        requiredVersion: '1.0.0',
      },
    };

    const mockFactory = jest.fn().mockReturnValue('factory result');
    const mockLoadSharePromise = Promise.resolve(mockFactory);

    const mockFederationInstance = {
      loadShare: jest.fn().mockReturnValue(mockLoadSharePromise),
    };

    const mockWebpackRequire = {
      o: jest
        .fn()
        .mockImplementation((obj, key) =>
          Object.prototype.hasOwnProperty.call(obj, key),
        ),
      m: {},
      c: {},
      federation: {
        instance: mockFederationInstance,
      },
    };

    const mockOptions: ConsumesOptions = {
      chunkId: 'testChunkId',
      promises: mockPromises,
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      installedModules: {},
      moduleToHandlerMapping: {
        [mockModuleId]: {
          shareKey: mockShareKey,
          getter: jest.fn(),
          shareInfo: mockShareInfo,
        },
      },
      webpackRequire: mockWebpackRequire as any,
    };

    // Execute
    consumes(mockOptions);

    // Verify
    expect(mockPromises.length).toBe(1);
    expect(mockFederationInstance.loadShare).toHaveBeenCalledWith(
      mockShareKey,
      { customShareInfo: mockShareInfo },
    );

    // Wait for promise to resolve
    await mockPromises[0];

    // Verify module was set up correctly
    const moduleObj = { exports: {} };
    mockWebpackRequire.m[mockModuleId](moduleObj);
    expect(moduleObj.exports).toBe('factory result');
  });

  test('should handle errors when federation instance is not found', () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockPromises: Promise<any>[] = [];
    const mockWebpackRequire = {
      o: jest
        .fn()
        .mockImplementation((obj, key) =>
          Object.prototype.hasOwnProperty.call(obj, key),
        ),
      m: {},
      c: {},
      federation: {
        // Federation instance is null, which will cause an error
        instance: null,
      },
    };

    const mockOptions: ConsumesOptions = {
      chunkId: 'testChunkId',
      promises: mockPromises,
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      installedModules: {},
      moduleToHandlerMapping: {
        [mockModuleId]: {
          shareKey: 'testShareKey',
          getter: jest.fn(),
          shareInfo: {
            scope: ['default'],
            shareConfig: {
              singleton: true,
              requiredVersion: '1.0.0',
            },
          },
        },
      },
      webpackRequire: mockWebpackRequire as any,
    };

    // Execute
    consumes(mockOptions);

    // No promises should be added since we're catching the error in the try/catch block
    // and calling onError directly
    expect(mockWebpackRequire.m).toHaveProperty(mockModuleId);

    // Verify module factory throws the right error
    const moduleObj = { exports: {} };
    expect(() => {
      mockWebpackRequire.m[mockModuleId](moduleObj);
    }).toThrow('Federation instance not found!');
  });

  test('should call getter when loadShare returns false', async () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockPromises: Promise<any>[] = [];
    const mockShareKey = 'testShareKey';
    // The getter should return a factory function
    const mockGetterFactory = () => 'getter result';
    const mockGetter = jest.fn().mockReturnValue(mockGetterFactory);

    // Create a real promise that resolves to false
    const mockLoadSharePromise = Promise.resolve(false);

    const mockFederationInstance = {
      loadShare: jest.fn().mockReturnValue(mockLoadSharePromise),
    };

    const mockWebpackRequire = {
      o: jest
        .fn()
        .mockImplementation((obj, key) =>
          Object.prototype.hasOwnProperty.call(obj, key),
        ),
      m: {},
      c: {},
      federation: {
        instance: mockFederationInstance,
      },
    };

    const mockOptions: ConsumesOptions = {
      chunkId: 'testChunkId',
      promises: mockPromises,
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      installedModules: {},
      moduleToHandlerMapping: {
        [mockModuleId]: {
          shareKey: mockShareKey,
          getter: mockGetter,
          shareInfo: {
            scope: ['default'],
            shareConfig: {
              singleton: true,
              requiredVersion: '1.0.0',
            },
          },
        },
      },
      webpackRequire: mockWebpackRequire as any,
    };

    // Execute
    consumes(mockOptions);

    // Verify promise is added
    expect(mockPromises.length).toBe(1);

    // Wait for promise to resolve
    await mockPromises[0];

    // Verify getter was called
    expect(mockGetter).toHaveBeenCalled();

    // Verify module was set up correctly
    const moduleObj = { exports: {} };
    mockWebpackRequire.m[mockModuleId](moduleObj);
    expect(moduleObj.exports).toBe('getter result');
  });

  test('should handle non-promise result from loadShare', () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockPromises: Promise<any>[] = [];
    const mockShareKey = 'testShareKey';
    // Create a factory function that will be returned by loadShare
    const mockFactoryFn = () => 'factory result';

    // Create a special object that has a then method for the first call
    // but doesn't have it when checked with promise.then later
    const mockThenable = {
      then: function (callback: (factory: any) => any) {
        // After this is called once, remove the then method
        delete this.then;
        // Return the result of calling the callback with the factory
        return callback(mockFactoryFn);
      },
    };

    const mockFederationInstance = {
      loadShare: jest.fn().mockReturnValue(mockThenable),
    };

    const mockWebpackRequire = {
      o: jest
        .fn()
        .mockImplementation((obj, key) =>
          Object.prototype.hasOwnProperty.call(obj, key),
        ),
      m: {},
      c: {},
      federation: {
        instance: mockFederationInstance,
      },
    };

    const mockOptions: ConsumesOptions = {
      chunkId: 'testChunkId',
      promises: mockPromises,
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      installedModules: {},
      moduleToHandlerMapping: {
        [mockModuleId]: {
          shareKey: mockShareKey,
          getter: jest.fn(),
          shareInfo: {
            scope: ['default'],
            shareConfig: {
              singleton: true,
              requiredVersion: '1.0.0',
            },
          },
        },
      },
      webpackRequire: mockWebpackRequire as any,
    };

    // Execute
    consumes(mockOptions);

    // In the non-promise case, no promises should be added
    expect(mockPromises.length).toBe(0);

    // Verify that module was set up correctly
    const moduleObj = { exports: {} };
    mockWebpackRequire.m[mockModuleId](moduleObj);

    // The module.exports should be the result of calling the factory function
    expect(moduleObj.exports).toBe('factory result');
  });

  test('should handle promise rejection', async () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockPromises: Promise<any>[] = [];
    const mockShareKey = 'testShareKey';
    const mockError = new Error('Test error');

    // Create a real promise that rejects
    const mockLoadSharePromise = Promise.reject(mockError);

    const mockFederationInstance = {
      loadShare: jest.fn().mockReturnValue(mockLoadSharePromise),
    };

    const mockWebpackRequire = {
      o: jest
        .fn()
        .mockImplementation((obj, key) =>
          Object.prototype.hasOwnProperty.call(obj, key),
        ),
      m: {},
      c: {},
      federation: {
        instance: mockFederationInstance,
      },
    };

    const mockOptions: ConsumesOptions = {
      chunkId: 'testChunkId',
      promises: mockPromises,
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      installedModules: {},
      moduleToHandlerMapping: {
        [mockModuleId]: {
          shareKey: mockShareKey,
          getter: jest.fn(),
          shareInfo: {
            scope: ['default'],
            shareConfig: {
              singleton: true,
              requiredVersion: '1.0.0',
            },
          },
        },
      },
      webpackRequire: mockWebpackRequire as any,
    };

    // Execute
    consumes(mockOptions);

    // Verify promise is added
    expect(mockPromises.length).toBe(1);

    // Wait for promise to reject - we need to catch it to avoid unhandled rejection
    try {
      await mockPromises[0];
    } catch (error) {
      expect(error).toBe(mockError);
    }

    // Verify module factory throws the right error
    const moduleObj = { exports: {} };
    expect(() => {
      mockWebpackRequire.m[mockModuleId](moduleObj);
    }).toThrow('Test error');
  });
});
