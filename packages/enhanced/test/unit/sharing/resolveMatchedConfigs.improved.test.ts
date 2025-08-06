/*
 * @jest-environment node
 */

import { resolveMatchedConfigs } from '../../../src/lib/sharing/resolveMatchedConfigs';
import type { ConsumeOptions } from '../../../src/declarations/plugins/sharing/ConsumeSharedModule';
import { vol } from 'memfs';

// Mock file system only for controlled testing
jest.mock('fs', () => require('memfs').fs);
jest.mock('fs/promises', () => require('memfs').fs.promises);

// Mock webpack paths minimally
jest.mock('@module-federation/sdk/normalize-webpack-path', () => ({
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'webpack'),
}));

// Mock the webpack fs utilities that are used by getDescriptionFile
jest.mock('webpack/lib/util/fs', () => ({
  join: (fs: any, ...paths: string[]) => require('path').join(...paths),
  dirname: (fs: any, filePath: string) => require('path').dirname(filePath),
  readJson: (fs: any, filePath: string, callback: Function) => {
    const memfs = require('memfs').fs;
    memfs.readFile(filePath, 'utf8', (err: any, content: any) => {
      if (err) return callback(err);
      try {
        const data = JSON.parse(content);
        callback(null, data);
      } catch (e) {
        callback(e);
      }
    });
  },
}));

describe('resolveMatchedConfigs - Improved Quality Tests', () => {
  beforeEach(() => {
    vol.reset();
    jest.clearAllMocks();
  });

  describe('Real module resolution scenarios', () => {
    it('should resolve relative paths using real file system', async () => {
      // Setup realistic project structure
      vol.fromJSON({
        '/test-project/src/components/Button.js':
          'export const Button = () => {};',
        '/test-project/src/utils/helpers.js': 'export const helper = () => {};',
        '/test-project/lib/external.js': 'module.exports = {};',
      });

      const configs: [string, ConsumeOptions][] = [
        ['./src/components/Button', { shareScope: 'default' }],
        ['./src/utils/helpers', { shareScope: 'utilities' }],
        ['./lib/external', { shareScope: 'external' }],
      ];

      // Create realistic webpack compilation with real resolver behavior
      const mockCompilation = {
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              basePath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              const fs = require('fs');
              const path = require('path');

              // Implement real-like path resolution
              const fullPath = path.resolve(basePath, request);

              // Check if file exists
              fs.access(fullPath + '.js', fs.constants.F_OK, (err: any) => {
                if (err) {
                  callback(new Error(`Module not found: ${request}`), false);
                } else {
                  callback(null, fullPath + '.js');
                }
              });
            },
          }),
        },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      // Verify successful resolution
      expect(result.resolved.size).toBe(3);
      expect(
        result.resolved.has('/test-project/src/components/Button.js'),
      ).toBe(true);
      expect(result.resolved.has('/test-project/src/utils/helpers.js')).toBe(
        true,
      );
      expect(result.resolved.has('/test-project/lib/external.js')).toBe(true);

      // Verify configurations are preserved
      expect(
        result.resolved.get('/test-project/src/components/Button.js')
          ?.shareScope,
      ).toBe('default');
      expect(
        result.resolved.get('/test-project/src/utils/helpers.js')?.shareScope,
      ).toBe('utilities');
      expect(
        result.resolved.get('/test-project/lib/external.js')?.shareScope,
      ).toBe('external');

      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
      expect(mockCompilation.errors).toHaveLength(0);
    });

    it('should handle missing files with proper error reporting', async () => {
      vol.fromJSON({
        '/test-project/src/existing.js': 'export default {};',
        // missing.js doesn't exist
      });

      const configs: [string, ConsumeOptions][] = [
        ['./src/existing', { shareScope: 'default' }],
        ['./src/missing', { shareScope: 'default' }],
      ];

      const mockCompilation = {
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              basePath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              const fs = require('fs');
              const path = require('path');
              const fullPath = path.resolve(basePath, request);

              fs.access(fullPath + '.js', fs.constants.F_OK, (err: any) => {
                if (err) {
                  callback(new Error(`Module not found: ${request}`), false);
                } else {
                  callback(null, fullPath + '.js');
                }
              });
            },
          }),
        },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      // Should resolve existing file
      expect(result.resolved.size).toBe(1);
      expect(result.resolved.has('/test-project/src/existing.js')).toBe(true);

      // Should report error for missing file
      expect(mockCompilation.errors).toHaveLength(1);
      expect(mockCompilation.errors[0].message).toContain('Module not found');
    });

    it('should handle absolute paths correctly', async () => {
      vol.fromJSON({
        '/absolute/path/module.js': 'module.exports = {};',
        '/another/absolute/lib.js': 'export default {};',
      });

      const configs: [string, ConsumeOptions][] = [
        ['/absolute/path/module.js', { shareScope: 'absolute1' }],
        ['/another/absolute/lib.js', { shareScope: 'absolute2' }],
        ['/nonexistent/path.js', { shareScope: 'missing' }],
      ];

      const mockCompilation = {
        resolverFactory: { get: () => ({}) },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      // Absolute paths should be handled directly without resolution
      expect(result.resolved.size).toBe(3);
      expect(result.resolved.has('/absolute/path/module.js')).toBe(true);
      expect(result.resolved.has('/another/absolute/lib.js')).toBe(true);
      expect(result.resolved.has('/nonexistent/path.js')).toBe(true);

      expect(result.resolved.get('/absolute/path/module.js')?.shareScope).toBe(
        'absolute1',
      );
      expect(result.resolved.get('/another/absolute/lib.js')?.shareScope).toBe(
        'absolute2',
      );
    });

    it('should handle prefix patterns correctly', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['@company/', { shareScope: 'company' }],
        ['utils/', { shareScope: 'utilities' }],
        ['components/', { shareScope: 'ui', issuerLayer: 'client' }],
      ];

      const mockCompilation = {
        resolverFactory: { get: () => ({}) },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      expect(result.prefixed.size).toBe(3);
      expect(result.prefixed.has('@company/')).toBe(true);
      expect(result.prefixed.has('utils/')).toBe(true);
      expect(result.prefixed.has('(client)components/')).toBe(true);

      expect(result.prefixed.get('@company/')?.shareScope).toBe('company');
      expect(result.prefixed.get('utils/')?.shareScope).toBe('utilities');
      expect(result.prefixed.get('(client)components/')?.shareScope).toBe('ui');
      expect(result.prefixed.get('(client)components/')?.issuerLayer).toBe(
        'client',
      );
    });

    it('should handle regular module names correctly', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['react', { shareScope: 'default' }],
        ['lodash', { shareScope: 'utilities' }],
        ['@babel/core', { shareScope: 'build', issuerLayer: 'build' }],
      ];

      const mockCompilation = {
        resolverFactory: { get: () => ({}) },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      expect(result.unresolved.size).toBe(3);
      expect(result.unresolved.has('react')).toBe(true);
      expect(result.unresolved.has('lodash')).toBe(true);
      expect(result.unresolved.has('(build)@babel/core')).toBe(true);

      expect(result.unresolved.get('react')?.shareScope).toBe('default');
      expect(result.unresolved.get('lodash')?.shareScope).toBe('utilities');
      expect(result.unresolved.get('(build)@babel/core')?.shareScope).toBe(
        'build',
      );
      expect(result.unresolved.get('(build)@babel/core')?.issuerLayer).toBe(
        'build',
      );
    });
  });

  describe('Complex resolution scenarios', () => {
    it('should handle mixed configuration types correctly', async () => {
      vol.fromJSON({
        '/test-project/src/local.js': 'export default {};',
        '/absolute/file.js': 'module.exports = {};',
      });

      const configs: [string, ConsumeOptions][] = [
        ['./src/local', { shareScope: 'local' }], // Relative path
        ['/absolute/file.js', { shareScope: 'absolute' }], // Absolute path
        ['@scoped/', { shareScope: 'scoped' }], // Prefix pattern
        ['regular-module', { shareScope: 'regular' }], // Regular module
      ];

      const mockCompilation = {
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              basePath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              const fs = require('fs');
              const path = require('path');
              const fullPath = path.resolve(basePath, request);

              fs.access(fullPath + '.js', fs.constants.F_OK, (err: any) => {
                if (err) {
                  callback(new Error(`Module not found: ${request}`), false);
                } else {
                  callback(null, fullPath + '.js');
                }
              });
            },
          }),
        },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      // Verify each type is handled correctly
      expect(result.resolved.size).toBe(2); // Relative + absolute
      expect(result.prefixed.size).toBe(1); // Prefix pattern
      expect(result.unresolved.size).toBe(1); // Regular module

      expect(result.resolved.has('/test-project/src/local.js')).toBe(true);
      expect(result.resolved.has('/absolute/file.js')).toBe(true);
      expect(result.prefixed.has('@scoped/')).toBe(true);
      expect(result.unresolved.has('regular-module')).toBe(true);
    });

    it('should handle custom request overrides', async () => {
      vol.fromJSON({
        '/test-project/src/actual-file.js': 'export default {};',
      });

      const configs: [string, ConsumeOptions][] = [
        [
          'alias-name',
          {
            shareScope: 'default',
            request: './src/actual-file', // Custom request
          },
        ],
        [
          'absolute-alias',
          {
            shareScope: 'absolute',
            request: '/test-project/src/actual-file.js', // Absolute custom request
          },
        ],
        [
          'prefix-alias',
          {
            shareScope: 'prefix',
            request: 'utils/', // Prefix custom request
          },
        ],
      ];

      const mockCompilation = {
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              basePath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              const fs = require('fs');
              const path = require('path');
              const fullPath = path.resolve(basePath, request);

              fs.access(fullPath + '.js', fs.constants.F_OK, (err: any) => {
                if (err) {
                  callback(new Error(`Module not found: ${request}`), false);
                } else {
                  callback(null, fullPath + '.js');
                }
              });
            },
          }),
        },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      // Verify custom requests are used for resolution
      // Both alias-name and absolute-alias resolve to the same path, so Map keeps only one
      expect(result.resolved.size).toBe(1);
      expect(result.prefixed.size).toBe(1); // One prefix
      expect(result.unresolved.size).toBe(0); // None unresolved

      // Both resolve to the same path
      expect(result.resolved.has('/test-project/src/actual-file.js')).toBe(
        true,
      );

      // prefix-alias with prefix request goes to prefixed
      expect(result.prefixed.has('utils/')).toBe(true);

      // Verify custom requests are preserved in configs
      const resolvedConfig = result.resolved.get(
        '/test-project/src/actual-file.js',
      );
      expect(resolvedConfig).toBeDefined();
      // The config should have the custom request preserved
      expect(resolvedConfig?.request).toBeDefined();
    });
  });

  describe('Layer handling', () => {
    it('should create proper composite keys for layered modules', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['react', { shareScope: 'default' }], // No layer
        ['react', { shareScope: 'client', issuerLayer: 'client' }], // Client layer
        ['express', { shareScope: 'server', issuerLayer: 'server' }], // Server layer
        ['utils/', { shareScope: 'utilities', issuerLayer: 'shared' }], // Layered prefix
      ];

      const mockCompilation = {
        resolverFactory: { get: () => ({}) },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      expect(result.unresolved.size).toBe(3); // All regular modules
      expect(result.prefixed.size).toBe(1); // One prefix

      // Verify layer-based keys
      expect(result.unresolved.has('react')).toBe(true);
      expect(result.unresolved.has('(client)react')).toBe(true);
      expect(result.unresolved.has('(server)express')).toBe(true);
      expect(result.prefixed.has('(shared)utils/')).toBe(true);

      // Verify configurations
      expect(result.unresolved.get('react')?.issuerLayer).toBeUndefined();
      expect(result.unresolved.get('(client)react')?.issuerLayer).toBe(
        'client',
      );
      expect(result.unresolved.get('(server)express')?.issuerLayer).toBe(
        'server',
      );
      expect(result.prefixed.get('(shared)utils/')?.issuerLayer).toBe('shared');
    });
  });

  describe('Dependency tracking', () => {
    it('should properly track file dependencies during resolution', async () => {
      vol.fromJSON({
        '/test-project/src/component.js': 'export default {};',
      });

      const configs: [string, ConsumeOptions][] = [
        ['./src/component', { shareScope: 'default' }],
      ];

      const mockDependencies = {
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
      };

      const mockCompilation = {
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              basePath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              // Simulate dependency tracking during resolution
              resolveContext.fileDependencies.add(
                '/test-project/src/component.js',
              );
              resolveContext.contextDependencies.add('/test-project/src');

              const fs = require('fs');
              const path = require('path');
              const fullPath = path.resolve(basePath, request);

              fs.access(fullPath + '.js', fs.constants.F_OK, (err: any) => {
                if (err) {
                  callback(new Error(`Module not found: ${request}`), false);
                } else {
                  callback(null, fullPath + '.js');
                }
              });
            },
          }),
        },
        compiler: { context: '/test-project' },
        ...mockDependencies,
        errors: [],
      };

      await resolveMatchedConfigs(mockCompilation as any, configs);

      // Verify dependency tracking was called
      expect(mockDependencies.contextDependencies.addAll).toHaveBeenCalled();
      expect(mockDependencies.fileDependencies.addAll).toHaveBeenCalled();
      expect(mockDependencies.missingDependencies.addAll).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty configuration array', async () => {
      const configs: [string, ConsumeOptions][] = [];

      const mockCompilation = {
        resolverFactory: { get: () => ({}) },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      expect(result.resolved.size).toBe(0);
      expect(result.unresolved.size).toBe(0);
      expect(result.prefixed.size).toBe(0);
      expect(mockCompilation.errors).toHaveLength(0);
    });

    it('should handle resolver factory errors gracefully', async () => {
      const configs: [string, ConsumeOptions][] = [
        ['./src/component', { shareScope: 'default' }],
      ];

      const mockCompilation = {
        resolverFactory: {
          get: () => {
            throw new Error('Resolver factory error');
          },
        },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      await expect(
        resolveMatchedConfigs(mockCompilation as any, configs),
      ).rejects.toThrow('Resolver factory error');
    });

    it('should handle concurrent resolution of multiple files', async () => {
      vol.fromJSON({
        '/test-project/src/a.js': 'export default "a";',
        '/test-project/src/b.js': 'export default "b";',
        '/test-project/src/c.js': 'export default "c";',
        '/test-project/src/d.js': 'export default "d";',
        '/test-project/src/e.js': 'export default "e";',
      });

      const configs: [string, ConsumeOptions][] = [
        ['./src/a', { shareScope: 'a' }],
        ['./src/b', { shareScope: 'b' }],
        ['./src/c', { shareScope: 'c' }],
        ['./src/d', { shareScope: 'd' }],
        ['./src/e', { shareScope: 'e' }],
      ];

      const mockCompilation = {
        resolverFactory: {
          get: () => ({
            resolve: (
              context: string,
              basePath: string,
              request: string,
              resolveContext: any,
              callback: Function,
            ) => {
              const fs = require('fs');
              const path = require('path');
              const fullPath = path.resolve(basePath, request);

              // Add small delay to simulate real resolution
              setTimeout(() => {
                fs.access(fullPath + '.js', fs.constants.F_OK, (err: any) => {
                  if (err) {
                    callback(new Error(`Module not found: ${request}`), false);
                  } else {
                    callback(null, fullPath + '.js');
                  }
                });
              }, Math.random() * 10);
            },
          }),
        },
        compiler: { context: '/test-project' },
        contextDependencies: { addAll: jest.fn() },
        fileDependencies: { addAll: jest.fn() },
        missingDependencies: { addAll: jest.fn() },
        errors: [],
      };

      const result = await resolveMatchedConfigs(
        mockCompilation as any,
        configs,
      );

      expect(result.resolved.size).toBe(5);
      expect(mockCompilation.errors).toHaveLength(0);

      // Verify all files were resolved correctly
      ['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
        expect(result.resolved.has(`/test-project/src/${letter}.js`)).toBe(
          true,
        );
        expect(
          result.resolved.get(`/test-project/src/${letter}.js`)?.shareScope,
        ).toBe(letter);
      });
    });
  });
});
