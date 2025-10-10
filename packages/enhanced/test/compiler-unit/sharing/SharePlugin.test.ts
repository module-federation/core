// @ts-nocheck
/*
 * @jest-environment node
 */

import { createMockCompiler } from '../utils';
import webpack from 'webpack';
import path from 'path';
import SharePlugin from '../../../src/lib/sharing/SharePlugin';

// Mock the child plugins to prevent deep integration testing
jest.mock('../../../src/lib/sharing/ConsumeSharedPlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

jest.mock('../../../src/lib/sharing/ProvideSharedPlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

// Import mocked modules
import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
import ProvideSharedPlugin from '../../../src/lib/sharing/ProvideSharedPlugin';

describe('SharePlugin Compiler Integration', () => {
  let mockCompiler: webpack.Compiler;
  let mockCompilation: webpack.Compilation;

  beforeEach(() => {
    mockCompiler = createMockCompiler();
    mockCompilation = {
      hooks: {
        afterOptimizeChunks: {
          tap: jest.fn(),
        },
        additionalTreeRuntimeRequirements: {
          tap: jest.fn(),
        },
        runtimeRequirementInTree: {
          for: jest.fn().mockReturnValue({ tap: jest.fn() }),
        },
      },
      compiler: mockCompiler,
      options: {
        context: path.resolve(__dirname, '../../../'),
      },
      dependencyFactories: new Map(),
      dependencyTemplates: new Map(),
      addRuntimeModule: jest.fn(),
      resolverFactory: {
        get: jest.fn().mockReturnValue({
          resolve: jest.fn(),
        }),
      },
    } as any;

    // Clear mocks before each test
    (ConsumeSharedPlugin as jest.Mock).mockClear();
    (ProvideSharedPlugin as jest.Mock).mockClear();
  });

  it('should integrate with webpack compilation lifecycle', () => {
    const plugin = new SharePlugin({
      shared: {
        react: '^17.0.0',
        lodash: {
          requiredVersion: '^4.17.0',
          singleton: true,
        },
      },
    });

    // Apply the plugin
    plugin.apply(mockCompiler);

    // Verify both child plugins are created and applied
    expect(ConsumeSharedPlugin).toHaveBeenCalledTimes(1);
    expect(ProvideSharedPlugin).toHaveBeenCalledTimes(1);

    // Verify the plugins are applied to the compiler
    const consumeInstance = (ConsumeSharedPlugin as jest.Mock).mock.results[0]
      .value;
    const provideInstance = (ProvideSharedPlugin as jest.Mock).mock.results[0]
      .value;

    expect(consumeInstance.apply).toHaveBeenCalledWith(mockCompiler);
    expect(provideInstance.apply).toHaveBeenCalledWith(mockCompiler);

    const consumeOpts = (ConsumeSharedPlugin as jest.Mock).mock.calls[0][0];
    const provideOpts = (ProvideSharedPlugin as jest.Mock).mock.calls[0][0];
    expect(consumeOpts.consumes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          react: expect.objectContaining({
            shareKey: 'react',
            request: 'react',
            requiredVersion: '^17.0.0',
          }),
        }),
        expect.objectContaining({
          lodash: expect.objectContaining({
            singleton: true,
            shareKey: 'lodash',
            request: 'lodash',
          }),
        }),
      ]),
    );
    expect(provideOpts.provides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          react: expect.objectContaining({ shareKey: 'react' }),
        }),
        expect.objectContaining({
          lodash: expect.objectContaining({ shareKey: 'lodash' }),
        }),
      ]),
    );
  });

  it('should handle advanced configuration with filters', () => {
    const plugin = new SharePlugin({
      shareScope: 'custom-scope',
      shared: {
        'react/': {
          include: {
            request: /components/,
            version: '^17.0.0',
          },
          allowNodeModulesSuffixMatch: true,
        },
        lodash: {
          version: '4.17.21',
          singleton: true,
          eager: true,
        },
      },
    });

    // Should not throw during plugin application
    expect(() => plugin.apply(mockCompiler)).not.toThrow();
  });

  it('should handle fallback version configuration', () => {
    const plugin = new SharePlugin({
      shared: {
        react: {
          include: {
            version: '^17.0.0',
            fallbackVersion: '17.0.0',
          },
        },
        'utils/': {
          exclude: {
            version: '^2.0.0',
            fallbackVersion: '2.0.0',
          },
        },
      },
    });

    // Should not throw during plugin application
    expect(() => plugin.apply(mockCompiler)).not.toThrow();
  });

  it('should handle layer configuration', () => {
    const plugin = new SharePlugin({
      shared: {
        react: {
          layer: 'framework',
          issuerLayer: 'application',
        },
        utilities: {
          layer: 'utilities',
        },
      },
    });

    // Should not throw during plugin application
    expect(() => plugin.apply(mockCompiler)).not.toThrow();
  });

  it('should support multiple shareScopes', () => {
    const plugin = new SharePlugin({
      shareScope: ['primary', 'secondary'],
      shared: {
        react: '^17.0.0',
        lodash: {
          shareScope: 'custom',
          requiredVersion: '^4.17.0',
        },
      },
    });

    // Should not throw during plugin application
    expect(() => plugin.apply(mockCompiler)).not.toThrow();
  });

  it('should handle import false configuration', () => {
    const plugin = new SharePlugin({
      shared: {
        react: {
          import: false, // Only consume, don't provide
          requiredVersion: '^17.0.0',
        },
        lodash: {
          import: 'lodash-es', // Provide different module
          requiredVersion: '^4.17.0',
        },
      },
    });

    // Should not throw during plugin application
    expect(() => plugin.apply(mockCompiler)).not.toThrow();
  });

  it('should handle experiments configuration', () => {
    const plugin = new SharePlugin({
      shared: {
        react: '^17.0.0',
      },
      experiments: {
        allowNodeModulesSuffixMatch: true,
      },
    });

    // Should not throw during plugin application
    expect(() => plugin.apply(mockCompiler)).not.toThrow();
  });

  it('should pass through all filtering options to child plugins', () => {
    const plugin = new SharePlugin({
      shareScope: 'test-scope',
      shared: {
        'components/': {
          include: {
            request: /Button|Modal/,
            version: '^1.0.0',
          },
          allowNodeModulesSuffixMatch: true,
          singleton: true,
          eager: false,
        },
        react: {
          version: '17.0.0',
          strictVersion: true,
          packageName: 'react',
          layer: 'framework',
          issuerLayer: 'application',
        },
      },
    });

    // Should create valid plugin instance
    expect(plugin).toBeInstanceOf(SharePlugin);

    // Should not throw during plugin application
    expect(() => plugin.apply(mockCompiler)).not.toThrow();

    const consumeOpts = (
      ConsumeSharedPlugin as jest.Mock
    ).mock.calls.pop()?.[0];
    const provideOpts = (
      ProvideSharedPlugin as jest.Mock
    ).mock.calls.pop()?.[0];
    expect(consumeOpts?.shareScope).toBe('test-scope');
    expect(provideOpts?.shareScope).toBe('test-scope');

    const requestEntries = consumeOpts?.consumes.flatMap((cfg: any) =>
      Object.values(cfg).map((entry: any) => entry.request),
    );
    expect(requestEntries).toEqual(
      expect.arrayContaining(['components/', 'react']),
    );
  });

  describe('helper methods integration', () => {
    it('should provide debugging information about shared modules', () => {
      const plugin = new SharePlugin({
        shareScope: 'debug-scope',
        shared: {
          react: '^17.0.0',
          lodash: {
            import: false,
            requiredVersion: '^4.17.0',
          },
          'utils/': {
            version: '1.0.0',
            allowNodeModulesSuffixMatch: true,
          },
        },
      });

      // Access internal state for debug assertions
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - accessing private fields intentionally for inspection
      const shareScope = plugin._shareScope;
      expect(shareScope).toBe('debug-scope');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const consumes: Record<string, any>[] = plugin._consumes;
      expect(consumes).toHaveLength(3);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const provides: Record<string, any>[] = plugin._provides;
      expect(provides).toHaveLength(2); // lodash excluded due to import: false

      const consumeEntries = new Set(
        consumes.flatMap((consume) =>
          Object.entries(consume).map(
            ([key, config]) => config.shareKey || config.request || key,
          ),
        ),
      );
      const provideEntries = new Set(
        provides.flatMap((provide) =>
          Object.entries(provide).map(
            ([key, config]) => config.shareKey || config.request || key,
          ),
        ),
      );

      let provideAndConsume = 0;
      for (const key of consumeEntries) {
        if (provideEntries.has(key)) {
          provideAndConsume++;
        }
      }

      const totalShared = consumes.length;
      const consumeOnly = totalShared - provideAndConsume;
      const shareScopes = Array.isArray(shareScope)
        ? [...shareScope]
        : [shareScope];

      expect({
        totalShared,
        consumeOnly,
        provideAndConsume,
        shareScopes,
      }).toEqual({
        totalShared: 3,
        consumeOnly: 1,
        provideAndConsume: 2,
        shareScopes: ['debug-scope'],
      });
    });

    it('should validate configurations during construction', () => {
      expect(() => {
        new SharePlugin({
          shared: {},
        });
      }).not.toThrow();

      expect(() => {
        new SharePlugin({
          shared: {
            react: {
              include: { version: '^17.0.0' },
              exclude: { version: '^16.0.0' },
            },
          },
        });
      }).not.toThrow();

      expect(() => {
        new SharePlugin({
          shared: {
            react: ['react', 'other'] as any,
          },
        });
      }).toThrow();
    });
  });
});
