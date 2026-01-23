// @ts-nocheck
/*
 * @rstest-environment node
 */

import { rs } from '@rstest/core';
import { createMockCompiler } from '../utils';
import webpack from 'webpack';
import path from 'path';
import SharePlugin from '../../../src/lib/sharing/SharePlugin';

// Use rs.hoisted() to create mock functions that are hoisted along with rs.mock()
const mocks = rs.hoisted(() => ({
  mockConsumeSharedPlugin: rs.fn().mockImplementation(() => ({
    apply: rs.fn(),
  })),
  mockProvideSharedPlugin: rs.fn().mockImplementation(() => ({
    apply: rs.fn(),
  })),
}));

// Mock the child plugins to prevent deep integration testing
rs.mock('../../../src/lib/sharing/ConsumeSharedPlugin', () => ({
  default: mocks.mockConsumeSharedPlugin,
}));

rs.mock('../../../src/lib/sharing/ProvideSharedPlugin', () => ({
  default: mocks.mockProvideSharedPlugin,
}));

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
          tap: rs.fn(),
        },
        additionalTreeRuntimeRequirements: {
          tap: rs.fn(),
        },
        runtimeRequirementInTree: {
          for: rs.fn().mockReturnValue({ tap: rs.fn() }),
        },
      },
      compiler: mockCompiler,
      options: {
        context: path.resolve(__dirname, '../../../'),
      },
      dependencyFactories: new Map(),
      dependencyTemplates: new Map(),
      addRuntimeModule: rs.fn(),
      resolverFactory: {
        get: rs.fn().mockReturnValue({
          resolve: rs.fn(),
        }),
      },
    } as any;

    // Clear mocks before each test
    mocks.mockConsumeSharedPlugin.mockClear();
    mocks.mockProvideSharedPlugin.mockClear();
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
    expect(mocks.mockConsumeSharedPlugin).toHaveBeenCalledTimes(1);
    expect(mocks.mockProvideSharedPlugin).toHaveBeenCalledTimes(1);

    // Verify the plugins are applied to the compiler
    const consumeInstance = mocks.mockConsumeSharedPlugin.mock.results[0].value;
    const provideInstance = mocks.mockProvideSharedPlugin.mock.results[0].value;

    expect(consumeInstance.apply).toHaveBeenCalledWith(mockCompiler);
    expect(provideInstance.apply).toHaveBeenCalledWith(mockCompiler);
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
  });

  describe('configuration validation', () => {
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
    });
  });
});
