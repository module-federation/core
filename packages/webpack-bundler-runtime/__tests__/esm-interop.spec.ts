import { consumes } from '../src/consumes';
import { installInitialConsumes } from '../src/installInitialConsumes';
import type {
  ConsumesOptions,
  InstallInitialConsumesOptions,
} from '../src/types';

// Mock attachShareScopeMap as it's used in consumes
jest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: jest.fn(),
}));

describe('ESM Interop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('consumes', () => {
    test('should unwrap default export and add circular reference for ESM Namespace Object with object/function default', async () => {
      const mockModuleId = 'esmModule';
      const mockPromises: Promise<any>[] = [];
      const mockDefaultExport = function defaultFn() {
        return 'default';
      };
      const mockNamespaceObject = {
        default: mockDefaultExport,
        named: 'named',
        [Symbol.toStringTag]: 'Module',
      };

      const mockFactory = jest.fn().mockReturnValue(mockNamespaceObject);
      // consumes uses loadShare which returns a promise of the factory
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
            shareKey: 'shareKey',
            getter: jest.fn(),
            shareInfo: {
              scope: ['default'],
              shareConfig: { singleton: true, requiredVersion: '1.0.0' },
            },
          },
        },
        webpackRequire: mockWebpackRequire as any,
      };

      // Execute
      consumes(mockOptions);

      // Wait for the promise to resolve
      await mockPromises[0];

      // Execute the installed module
      const moduleObj = { exports: {} };
      mockWebpackRequire.m[mockModuleId](moduleObj);

      // Verify the fix:
      // 1. module.exports should be the default export function itself
      expect(moduleObj.exports).toBe(mockDefaultExport);

      // 2. module.exports.default should point to itself (circular reference)
      expect((moduleObj.exports as any).default).toBe(moduleObj.exports);

      // 3. Named exports should be available on the function object
      expect((moduleObj.exports as any).named).toBe('named');
    });

    test('should NOT unwrap if not an ESM Namespace Object', async () => {
      const mockModuleId = 'cjsModule';
      const mockPromises: Promise<any>[] = [];
      const mockExports = {
        default: 'default',
        named: 'named',
        // No Symbol.toStringTag === 'Module'
      };

      const mockFactory = jest.fn().mockReturnValue(mockExports);
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
            shareKey: 'shareKey',
            getter: jest.fn(),
            shareInfo: {
              scope: ['default'],
              shareConfig: { singleton: true, requiredVersion: '1.0.0' },
            },
          },
        },
        webpackRequire: mockWebpackRequire as any,
      };

      consumes(mockOptions);
      await mockPromises[0];

      const moduleObj = { exports: {} };
      mockWebpackRequire.m[mockModuleId](moduleObj);

      // Should be untouched
      expect(moduleObj.exports).toBe(mockExports);
      expect((moduleObj.exports as any).default).toBe('default');
      // Circular reference should NOT be added
      expect((moduleObj.exports as any).default).not.toBe(moduleObj.exports);
    });

    test('should NOT unwrap ESM Namespace Object with primitive default export', async () => {
      const mockModuleId = 'esmPrimitiveModule';
      const mockPromises: Promise<any>[] = [];
      const mockNamespaceObject = {
        default: 'primitiveDefault',
        version: '1.3.4',
        [Symbol.toStringTag]: 'Module',
      };

      const mockFactory = jest.fn().mockReturnValue(mockNamespaceObject);
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
            shareKey: 'shareKey',
            getter: jest.fn(),
            shareInfo: {
              scope: ['default'],
              shareConfig: { singleton: true, requiredVersion: '1.0.0' },
            },
          },
        },
        webpackRequire: mockWebpackRequire as any,
      };

      consumes(mockOptions);
      await mockPromises[0];

      const moduleObj = { exports: {} };
      mockWebpackRequire.m[mockModuleId](moduleObj);

      // Should keep original ESM namespace to preserve named exports
      expect(moduleObj.exports).toBe(mockNamespaceObject);
      expect((moduleObj.exports as any).default).toBe('primitiveDefault');
      expect((moduleObj.exports as any).version).toBe('1.3.4');
      // Should NOT have circular reference since we didn't unwrap
      expect((moduleObj.exports as any).default).not.toBe(moduleObj.exports);
    });
  });

  describe('installInitialConsumes', () => {
    test('should unwrap default export and add circular reference for ESM Namespace Object with object/function default', () => {
      const mockModuleId = 'esmModuleInitial';
      const mockDefaultExport = function defaultFn() {
        return 'default';
      };
      const mockNamespaceObject = {
        default: mockDefaultExport,
        named: 'named',
        [Symbol.toStringTag]: 'Module',
      };

      const mockFactory = jest.fn().mockReturnValue(mockNamespaceObject);

      const mockFederationInstance = {
        loadShareSync: jest.fn().mockReturnValue(mockFactory),
      };

      const mockWebpackRequire = {
        m: {},
        c: {},
        federation: {
          instance: mockFederationInstance,
        },
      };

      const mockOptions: InstallInitialConsumesOptions = {
        moduleToHandlerMapping: {
          [mockModuleId]: {
            shareKey: 'shareKey',
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
        installedModules: {},
        initialConsumes: [mockModuleId],
      };

      // Execute
      installInitialConsumes(mockOptions);

      // Execute the installed module factory
      const moduleObj = { exports: {} };
      mockWebpackRequire.m[mockModuleId](moduleObj);

      // Verify
      expect(moduleObj.exports).toBe(mockDefaultExport);
      expect((moduleObj.exports as any).default).toBe(moduleObj.exports);
      expect((moduleObj.exports as any).named).toBe('named');
    });

    test('should NOT unwrap if not an ESM Namespace Object', () => {
      const mockModuleId = 'cjsModuleInitial';
      const mockExports = {
        default: 'default',
        named: 'named',
      };

      const mockFactory = jest.fn().mockReturnValue(mockExports);

      const mockFederationInstance = {
        loadShareSync: jest.fn().mockReturnValue(mockFactory),
      };

      const mockWebpackRequire = {
        m: {},
        c: {},
        federation: {
          instance: mockFederationInstance,
        },
      };

      const mockOptions: InstallInitialConsumesOptions = {
        moduleToHandlerMapping: {
          [mockModuleId]: {
            shareKey: 'shareKey',
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
        installedModules: {},
        initialConsumes: [mockModuleId],
      };

      installInitialConsumes(mockOptions);

      const moduleObj = { exports: {} };
      mockWebpackRequire.m[mockModuleId](moduleObj);

      expect(moduleObj.exports).toBe(mockExports);
      expect((moduleObj.exports as any).default).toBe('default');
      expect((moduleObj.exports as any).default).not.toBe(moduleObj.exports);
    });

    test('should NOT unwrap ESM Namespace Object with primitive default export', () => {
      const mockModuleId = 'esmPrimitiveModuleInitial';
      const mockNamespaceObject = {
        default: 'primitiveDefault',
        version: '1.3.4',
        [Symbol.toStringTag]: 'Module',
      };

      const mockFactory = jest.fn().mockReturnValue(mockNamespaceObject);

      const mockFederationInstance = {
        loadShareSync: jest.fn().mockReturnValue(mockFactory),
      };

      const mockWebpackRequire = {
        m: {},
        c: {},
        federation: {
          instance: mockFederationInstance,
        },
      };

      const mockOptions: InstallInitialConsumesOptions = {
        moduleToHandlerMapping: {
          [mockModuleId]: {
            shareKey: 'shareKey',
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
        installedModules: {},
        initialConsumes: [mockModuleId],
      };

      installInitialConsumes(mockOptions);

      const moduleObj = { exports: {} };
      mockWebpackRequire.m[mockModuleId](moduleObj);

      // Should keep original ESM namespace to preserve named exports
      expect(moduleObj.exports).toBe(mockNamespaceObject);
      expect((moduleObj.exports as any).default).toBe('primitiveDefault');
      expect((moduleObj.exports as any).version).toBe('1.3.4');
      // Should NOT have circular reference since we didn't unwrap
      expect((moduleObj.exports as any).default).not.toBe(moduleObj.exports);
    });
  });
});
