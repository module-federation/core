import path from 'path';
import { describe, expect, it } from 'vitest';
import { normalizeGenerateTypesOptions } from './GenerateTypesPlugin';

describe('GenerateTypesPlugin', () => {
  const basePluginOptions = {
    name: 'testRemote',
    filename: 'remoteEntry.js',
    exposes: {
      './button': './src/components/button',
    },
    shared: {},
  };

  describe('normalizeGenerateTypesOptions', () => {
    it('should use compiler outputDir when user does not set outputDir', () => {
      const result = normalizeGenerateTypesOptions({
        context: '/project',
        outputDir: 'dist',
        dtsOptions: {
          generateTypes: {
            generateAPITypes: true,
          },
          consumeTypes: false,
        },
        pluginOptions: basePluginOptions,
      });

      expect(result).toBeDefined();
      expect(result!.remote.outputDir).toBe('dist');
    });

    it('should allow user outputDir to override compiler outputDir', () => {
      const result = normalizeGenerateTypesOptions({
        context: '/project',
        outputDir: 'dist',
        dtsOptions: {
          generateTypes: {
            generateAPITypes: true,
            outputDir: 'dist/production',
          },
          consumeTypes: false,
        },
        pluginOptions: basePluginOptions,
      });

      expect(result).toBeDefined();
      expect(result!.remote.outputDir).toBe('dist/production');
    });

    it('should return undefined when generateTypes is false', () => {
      const result = normalizeGenerateTypesOptions({
        context: '/project',
        outputDir: 'dist',
        dtsOptions: {
          generateTypes: false,
          consumeTypes: false,
        },
        pluginOptions: basePluginOptions,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('asset emission path calculation', () => {
    // These tests verify the path.relative logic used in emitTypesFiles
    // to ensure correct asset names under various outputDir configurations

    it('should compute relative zip path same as basename when outputDir matches compiler output', () => {
      const compilerOutputPath = path.resolve('/project', 'dist');
      const zipTypesPath = path.resolve('/project', 'dist', '@mf-types.zip');

      const relZip = path.relative(compilerOutputPath, zipTypesPath);
      expect(relZip).toBe('@mf-types.zip');
    });

    it('should compute relative zip path with subdirectory when custom outputDir is deeper', () => {
      const compilerOutputPath = path.resolve('/project', 'dist');
      const zipTypesPath = path.resolve(
        '/project',
        'dist',
        'production',
        '@mf-types.zip',
      );

      const relZip = path.relative(compilerOutputPath, zipTypesPath);
      expect(relZip).toBe(path.join('production', '@mf-types.zip'));
    });

    it('should compute relative api types path with subdirectory', () => {
      const compilerOutputPath = path.resolve('/project', 'dist/react');
      const apiTypesPath = path.resolve(
        '/project',
        'dist/react/staging',
        '@mf-types.d.ts',
      );

      const relApi = path.relative(compilerOutputPath, apiTypesPath);
      expect(relApi).toBe(path.join('staging', '@mf-types.d.ts'));
    });

    it('should fall back to basename when zip is outside compiler output (starts with ..)', () => {
      const compilerOutputPath = path.resolve('/project', 'dist');
      const zipTypesPath = path.resolve(
        '/other-project',
        'dist',
        '@mf-types.zip',
      );

      const relZip = path.relative(compilerOutputPath, zipTypesPath);
      // When the relative path starts with '..', the plugin should fall back to basename
      expect(relZip.startsWith('..')).toBe(true);

      // Verify fallback behavior
      const emitZipName = relZip.startsWith('..')
        ? path.basename(zipTypesPath)
        : relZip;
      expect(emitZipName).toBe('@mf-types.zip');
    });

    it('should handle nested deploy environment subdirectories', () => {
      // Simulates: webpack output = dist/react, entry at dist/react/staging/
      const compilerOutputPath = path.resolve('/project', 'dist/react');
      const customOutputDir = 'dist/react/staging';
      const zipTypesPath = path.resolve(
        '/project',
        customOutputDir,
        '@mf-types.zip',
      );

      const relZip = path.relative(compilerOutputPath, zipTypesPath);
      expect(relZip).toBe(path.join('staging', '@mf-types.zip'));
      expect(relZip.startsWith('..')).toBe(false);
    });

    it('should handle custom typesFolder with custom outputDir', () => {
      const compilerOutputPath = path.resolve('/project', 'dist');
      const zipTypesPath = path.resolve(
        '/project',
        'dist',
        'production',
        'my-types.zip',
      );

      const relZip = path.relative(compilerOutputPath, zipTypesPath);
      expect(relZip).toBe(path.join('production', 'my-types.zip'));
    });
  });
});
