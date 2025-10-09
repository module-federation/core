/*
 * @jest-environment node
 */

import {
  ProvideSharedPlugin,
  createMockCompilation,
  createMockCompiler,
} from '../plugin-test-utils';

type ModuleHook = (
  module: { layer?: string | undefined },
  data: { resource?: string; resourceResolveData?: Record<string, unknown> },
  resolveData: { request?: string; cacheable: boolean },
) => unknown;

type MockNormalModuleFactory = {
  hooks: {
    module: {
      tap: jest.Mock;
    };
  };
};

describe('ProvideSharedPlugin', () => {
  describe('module matching and resolution stages', () => {
    let mockCompilation: ReturnType<
      typeof createMockCompilation
    >['mockCompilation'];
    let mockNormalModuleFactory: MockNormalModuleFactory;
    let plugin: InstanceType<typeof ProvideSharedPlugin>;

    beforeEach(() => {
      mockCompilation = createMockCompilation().mockCompilation;
      mockNormalModuleFactory = {
        hooks: {
          module: {
            tap: jest.fn(),
          },
        },
      };
      plugin = new ProvideSharedPlugin({
        shareScope: 'default',
        provides: {},
      });
    });

    describe('path classification during configuration', () => {
      it('should classify relative paths correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            './relative/path': {
              version: '1.0.0',
            },
            '../parent/path': {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore - provides are sorted alphabetically
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('../parent/path');
        expect(provides[1][0]).toBe('./relative/path');
      });

      it('should classify absolute paths correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            '/absolute/unix/path': {
              version: '1.0.0',
            },
            'C:\\absolute\\windows\\path': {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('/absolute/unix/path');
        expect(provides[1][0]).toBe('C:\\absolute\\windows\\path');
      });

      it('should classify prefix patterns correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '1.0.0',
            },
            'lodash/': {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('lodash/');
        expect(provides[1][0]).toBe('react/');
      });

      it('should classify exact module names correctly', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '1.0.0',
            },
            lodash: {
              version: '1.0.0',
            },
          },
        });

        // @ts-ignore - accessing private property for testing
        expect(plugin._provides).toHaveLength(2);
        // @ts-ignore
        const provides = plugin._provides;
        expect(provides[0][0]).toBe('lodash');
        expect(provides[1][0]).toBe('react');
      });
    });

    describe('stage 1a - direct match with original request', () => {
      it('should match exact module requests', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should apply request filters during direct matching', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              include: {
                request: 'react', // Should match exactly
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip module when request filters fail during direct matching', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              exclude: {
                request: 'react', // Should exclude exact match
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // cacheable should remain true since no processing occurred
        expect(mockResolveData.cacheable).toBe(true);
      });
    });

    describe('stage 1b - prefix matching with original request', () => {
      it('should match module requests with prefix patterns', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              shareKey: 'react',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should apply remainder filters during prefix matching', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              shareKey: 'react',
              include: {
                request: /jsx/, // Should match jsx-runtime remainder
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip prefix matching when remainder filters fail', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'react/': {
              version: '17.0.0',
              shareKey: 'react',
              exclude: {
                request: /jsx/, // Should exclude jsx-runtime remainder
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react/jsx-runtime',
          cacheable: true,
        };
        const mockResource = '/node_modules/react/jsx-runtime.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // cacheable should remain true since no processing occurred
        expect(mockResolveData.cacheable).toBe(true);
      });
    });

    describe('layer matching logic', () => {
      it('should match modules with same layer', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              layer: 'client',
            },
          },
        });

        const mockModule = { layer: 'client' };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should skip modules with different layers', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
              layer: 'server',
            },
          },
        });

        const mockModule = { layer: 'client' };
        const mockResolveData = { request: 'react', cacheable: true };
        const mockResource = '/node_modules/react/index.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '17.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // cacheable should remain true since module was skipped
        expect(mockResolveData.cacheable).toBe(true);
      });
    });

    describe('stage 2 - node_modules path reconstruction', () => {
      it('should match modules via node_modules path reconstruction', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'lodash/': {
              version: '4.17.0',
              allowNodeModulesSuffixMatch: true,
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: './utils/debounce',
          cacheable: true,
        };
        const mockResource = '/project/node_modules/lodash/utils/debounce.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '4.17.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });

      it('should apply filters during node_modules reconstruction', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            'lodash/': {
              version: '4.17.0',
              allowNodeModulesSuffixMatch: true,
              include: {
                request: /utils/, // Should match reconstructed path
              },
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: './utils/debounce',
          cacheable: true,
        };
        const mockResource = '/project/node_modules/lodash/utils/debounce.js';
        const mockResourceResolveData = {
          descriptionFileData: { version: '4.17.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(false);
      });
    });

    describe('early return scenarios', () => {
      it('should skip processing for absolute path requests', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: '/absolute/path/to/module',
          cacheable: true,
        };
        const mockResource = '/absolute/path/to/module';
        const mockResourceResolveData = {
          descriptionFileData: { version: '1.0.0' },
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: mockResource,
            resourceResolveData: mockResourceResolveData,
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        // cacheable should remain true since absolute paths are skipped
        expect(mockResolveData.cacheable).toBe(true);
      });

      it('should skip processing when no resource is provided', () => {
        const plugin = new ProvideSharedPlugin({
          shareScope: 'default',
          provides: {
            react: {
              version: '17.0.0',
            },
          },
        });

        const mockModule = { layer: undefined };
        const mockResolveData = {
          request: 'react',
          cacheable: true,
        };

        let moduleHookCallback: ModuleHook | undefined;
        mockNormalModuleFactory.hooks.module.tap.mockImplementation(
          (_name: string, callback: ModuleHook) => {
            moduleHookCallback = callback;
          },
        );

        plugin.apply({
          hooks: {
            compilation: {
              tap: jest.fn(
                (
                  name: string,
                  callback: (compilation: unknown, params: unknown) => void,
                ) => {
                  callback(mockCompilation, {
                    normalModuleFactory: mockNormalModuleFactory,
                  });
                },
              ),
            },
            finishMake: {
              tapPromise: jest.fn(),
            },
          },
        } as any);

        // Simulate module matching with no resource
        const result = moduleHookCallback!(
          mockModule,
          {
            resource: undefined,
            resourceResolveData: {},
          },
          mockResolveData,
        );

        expect(result).toBe(mockModule);
        expect(mockResolveData.cacheable).toBe(true);
      });
    });
  });
});
