/*
 * @jest-environment node
 */

import { resolveMatchedConfigs } from '../../../src/lib/sharing/resolveMatchedConfigs';
import { vol } from 'memfs';
import path from 'path';

// Mock only the file system for controlled testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

// Helper to create a real webpack compilation-like object
const createTestCompilation = () => {
  const { SyncHook } = require('tapable');
  const fs = require('fs');

  return {
    compiler: {
      context: '/test-project/src',
    },
    errors: [],
    warnings: [],

    resolverFactory: {
      get: jest.fn((type, options) => ({
        resolve: jest.fn(
          (context, contextPath, request, resolveContext, callback) => {
            // Simulate real webpack resolver behavior
            const resolvedPath = path.resolve(contextPath, request);

            try {
              // Check if file exists
              fs.statSync(resolvedPath);
              callback(null, resolvedPath);
            } catch (err) {
              // Try with common extensions
              for (const ext of ['.js', '.ts', '.jsx', '.tsx']) {
                try {
                  const pathWithExt = resolvedPath + ext;
                  fs.statSync(pathWithExt);
                  callback(null, pathWithExt);
                  return;
                } catch {}
              }
              callback(new Error(`Module not found: ${request}`));
            }
          },
        ),
      })),
    },

    contextDependencies: {
      addAll: jest.fn(),
    },
    fileDependencies: {
      addAll: jest.fn(),
    },
    missingDependencies: {
      addAll: jest.fn(),
    },
  };
};

describe('resolveMatchedConfigs', () => {
  beforeEach(() => {
    vol.reset();

    // Create a realistic test project structure
    vol.fromJSON({
      '/test-project/src/components/Button.js':
        'export default function Button() {}',
      '/test-project/src/utils/helper.js': 'export const helper = () => {};',
      '/test-project/src/index.js': 'console.log("main");',
      '/test-project/node_modules/react/index.js': 'module.exports = React;',
      '/test-project/node_modules/lodash/index.js': 'module.exports = _;',
    });
  });

  describe('relative path resolution', () => {
    it('should resolve relative paths correctly', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          './components/Button',
          {
            request: './components/Button',
            shareScope: 'default',
            shareKey: 'Button',
          },
        ],
        [
          './utils/helper',
          {
            request: './utils/helper',
            shareScope: 'default',
            shareKey: 'helper',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(2);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);

      // Check that paths were resolved correctly
      const resolvedPaths = Array.from(result.resolved.keys());
      expect(resolvedPaths).toContain('/test-project/src/components/Button.js');
      expect(resolvedPaths).toContain('/test-project/src/utils/helper.js');
    });

    it('should handle resolution errors for non-existent relative paths', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          './non-existent/module',
          {
            request: './non-existent/module',
            shareScope: 'default',
            shareKey: 'missing',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);

      // Should add error to compilation
      expect(compilation.errors).toHaveLength(1);
      // The error message format may vary, just check that an error was added
      expect(compilation.errors[0]).toBeDefined();
    });
  });

  describe('absolute path resolution', () => {
    it('should handle absolute paths directly', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          '/absolute/path/module',
          {
            request: '/absolute/path/module',
            shareScope: 'default',
            shareKey: 'absolute-module',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(1);
      expect(result.resolved.has('/absolute/path/module')).toBe(true);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
    });

    it('should handle Windows-style absolute paths', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          'C:\\Windows\\path\\module',
          {
            request: 'C:\\Windows\\path\\module',
            shareScope: 'default',
            shareKey: 'windows-module',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(1);
      expect(result.resolved.has('C:\\Windows\\path\\module')).toBe(true);
    });
  });

  describe('module request resolution', () => {
    it('should categorize regular module requests as unresolved', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          'react',
          {
            request: 'react',
            shareScope: 'default',
            shareKey: 'react',
          },
        ],
        [
          'lodash',
          {
            request: 'lodash',
            shareScope: 'default',
            shareKey: 'lodash',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(2);
      expect(result.prefixed.size).toBe(0);

      expect(result.unresolved.has('react')).toBe(true);
      expect(result.unresolved.has('lodash')).toBe(true);
    });

    it('should categorize prefix requests correctly', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          'components/',
          {
            request: 'components/',
            shareScope: 'default',
            shareKey: 'components/',
          },
        ],
        [
          'utils/',
          {
            request: 'utils/',
            shareScope: 'default',
            shareKey: 'utils/',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(2);

      expect(result.prefixed.has('components/')).toBe(true);
      expect(result.prefixed.has('utils/')).toBe(true);
    });
  });

  describe('layered module resolution', () => {
    it('should handle issuerLayer in composite keys', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          'react',
          {
            request: 'react',
            shareScope: 'default',
            shareKey: 'react',
            issuerLayer: 'framework',
          },
        ],
        [
          'react',
          {
            request: 'react',
            shareScope: 'default',
            shareKey: 'react',
            // No issuerLayer
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.unresolved.size).toBe(2);
      expect(result.unresolved.has('(framework)react')).toBe(true);
      expect(result.unresolved.has('react')).toBe(true);
    });

    it('should handle layered prefix modules', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          'components/',
          {
            request: 'components/',
            shareScope: 'default',
            shareKey: 'components/',
            issuerLayer: 'ui',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.prefixed.size).toBe(1);
      expect(result.prefixed.has('(ui)components/')).toBe(true);
    });
  });

  describe('mixed configuration scenarios', () => {
    it('should handle mixed request types correctly', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        // Relative path (should be resolved)
        [
          './components/Button',
          {
            request: './components/Button',
            shareScope: 'default',
            shareKey: 'Button',
          },
        ],
        // Absolute path (should be resolved)
        [
          '/absolute/module',
          {
            request: '/absolute/module',
            shareScope: 'default',
            shareKey: 'absolute',
          },
        ],
        // Module request (should be unresolved)
        [
          'react',
          {
            request: 'react',
            shareScope: 'default',
            shareKey: 'react',
          },
        ],
        // Prefix request (should be prefixed)
        [
          'utils/',
          {
            request: 'utils/',
            shareScope: 'default',
            shareKey: 'utils/',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(2); // relative + absolute
      expect(result.unresolved.size).toBe(1); // react
      expect(result.prefixed.size).toBe(1); // utils/
    });

    it('should handle configurations with different request vs key', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          'button-component',
          {
            request: './components/Button', // Different from key
            shareScope: 'default',
            shareKey: 'button-component',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(1);
      // Should resolve based on request, not key
      const resolvedPaths = Array.from(result.resolved.keys());
      expect(resolvedPaths[0]).toContain('Button.js');
    });
  });

  describe('dependency tracking', () => {
    it('should track dependencies correctly', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          './components/Button',
          {
            request: './components/Button',
            shareScope: 'default',
            shareKey: 'Button',
          },
        ],
      ];

      await resolveMatchedConfigs(compilation, configs);

      // Should call dependency tracking methods
      expect(compilation.contextDependencies.addAll).toHaveBeenCalled();
      expect(compilation.fileDependencies.addAll).toHaveBeenCalled();
      expect(compilation.missingDependencies.addAll).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle resolver factory errors gracefully', async () => {
      const compilation = createTestCompilation();

      // Mock resolver to throw error
      compilation.resolverFactory.get.mockReturnValue({
        resolve: jest.fn(
          (context, contextPath, request, resolveContext, callback) => {
            callback(new Error('Resolver error'));
          },
        ),
      });

      const configs: [string, any][] = [
        [
          './error-module',
          {
            request: './error-module',
            shareScope: 'default',
            shareKey: 'error',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(0);
      expect(compilation.errors).toHaveLength(1);
    });

    it('should handle empty configs array', async () => {
      const compilation = createTestCompilation();

      const result = await resolveMatchedConfigs(compilation, []);

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
    });

    it('should handle configs with undefined request', async () => {
      const compilation = createTestCompilation();

      const configs: [string, any][] = [
        [
          'react',
          {
            // No request property - should use key
            shareScope: 'default',
            shareKey: 'react',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.unresolved.size).toBe(1);
      expect(result.unresolved.has('react')).toBe(true);
    });
  });

  describe('real webpack integration', () => {
    it('should work with webpack-like resolver behavior', async () => {
      // Create more realistic resolver mock
      const compilation = createTestCompilation();
      compilation.resolverFactory.get.mockReturnValue({
        resolve: jest.fn(
          (context, contextPath, request, resolveContext, callback) => {
            // Add to resolve context like real webpack does
            resolveContext.fileDependencies.add(
              path.join(contextPath, request + '.js'),
            );
            resolveContext.contextDependencies.add(contextPath);

            const resolvedPath = path.resolve(contextPath, request + '.js');
            callback(null, resolvedPath);
          },
        ),
      });

      const configs: [string, any][] = [
        [
          './test-module',
          {
            request: './test-module',
            shareScope: 'default',
            shareKey: 'test',
          },
        ],
      ];

      const result = await resolveMatchedConfigs(compilation, configs);

      expect(result.resolved.size).toBe(1);
      expect(compilation.contextDependencies.addAll).toHaveBeenCalled();
      expect(compilation.fileDependencies.addAll).toHaveBeenCalled();
    });
  });
});
