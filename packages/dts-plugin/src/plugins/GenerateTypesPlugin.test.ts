import path from 'path';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  isSafeRelativePath,
  normalizeGenerateTypesOptions,
  resolveEmitAssetName,
  GenerateTypesPlugin,
} from './GenerateTypesPlugin';

vi.mock('../core/index', () => ({
  validateOptions: vi.fn(),
  generateTypes: vi.fn().mockResolvedValue(undefined),
  generateTypesInChildProcess: vi.fn().mockResolvedValue(undefined),
  retrieveTypesAssetsInfo: vi.fn().mockReturnValue({
    zipTypesPath: undefined,
    apiTypesPath: undefined,
    zipName: '@mf-types.zip',
    apiFileName: '@mf-types.d.ts',
  }),
}));

const { mockIsDev } = vi.hoisted(() => ({ mockIsDev: vi.fn() }));
vi.mock('./utils', () => ({
  isDev: mockIsDev,
  getCompilerOutputDir: vi.fn().mockReturnValue('dist'),
}));

function createMockCompiler() {
  const processAssetsCallbacks: Array<() => Promise<void>> = [];

  const compilation = {
    hooks: {
      processAssets: {
        tapPromise: vi.fn((_opts: unknown, fn: () => Promise<void>) => {
          processAssetsCallbacks.push(fn);
        }),
      },
    },
    getAsset: vi.fn().mockReturnValue(undefined),
    emitAsset: vi.fn(),
    constructor: { PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER: 10000 },
  };

  const compiler = {
    context: '/project',
    outputPath: '/project/dist',
    hooks: {
      thisCompilation: {
        tap: vi.fn((_name: string, fn: (c: typeof compilation) => void) => {
          fn(compilation);
        }),
      },
    },
    webpack: {
      sources: { RawSource: class {} },
    },
  };

  return {
    compiler,
    compilation,
    async triggerProcessAssets() {
      for (const fn of processAssetsCallbacks) {
        await fn();
      }
    },
  };
}

describe('afterGenerateTypes callback', () => {
  const basePluginOptions = {
    name: 'testRemote',
    filename: 'remoteEntry.js',
    exposes: { './button': './src/components/button' },
    shared: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call afterGenerateTypes after type generation in prod', async () => {
    mockIsDev.mockReturnValue(false);
    const afterGenerateTypes = vi.fn().mockResolvedValue(undefined);
    const { compiler, triggerProcessAssets } = createMockCompiler();

    const plugin = new GenerateTypesPlugin(
      basePluginOptions,
      { generateTypes: true, afterGenerateTypes },
      Promise.resolve(undefined),
      vi.fn(),
    );
    plugin.apply(compiler as any);
    await triggerProcessAssets();

    expect(afterGenerateTypes).toHaveBeenCalledOnce();
  });

  it('should call afterGenerateTypes after type generation in dev', async () => {
    mockIsDev.mockReturnValue(true);
    const afterGenerateTypes = vi.fn().mockResolvedValue(undefined);
    const { compiler, triggerProcessAssets } = createMockCompiler();

    const plugin = new GenerateTypesPlugin(
      basePluginOptions,
      { generateTypes: true, afterGenerateTypes },
      Promise.resolve(undefined),
      vi.fn(),
    );
    plugin.apply(compiler as any);
    await triggerProcessAssets();
    // In dev mode emitTypesFilesPromise is not awaited, flush microtasks
    await vi.waitFor(() => expect(afterGenerateTypes).toHaveBeenCalledOnce());
  });

  it('should not throw when afterGenerateTypes is not provided', async () => {
    mockIsDev.mockReturnValue(false);
    const { compiler, triggerProcessAssets } = createMockCompiler();

    const plugin = new GenerateTypesPlugin(
      basePluginOptions,
      { generateTypes: true },
      Promise.resolve(undefined),
      vi.fn(),
    );
    plugin.apply(compiler as any);

    await expect(triggerProcessAssets()).resolves.not.toThrow();
  });

  it('should not call afterGenerateTypes when asset already exists (early return)', async () => {
    mockIsDev.mockReturnValue(false);
    const afterGenerateTypes = vi.fn();
    const { compiler, compilation, triggerProcessAssets } =
      createMockCompiler();
    compilation.getAsset.mockReturnValue({});

    const plugin = new GenerateTypesPlugin(
      basePluginOptions,
      { generateTypes: true, afterGenerateTypes },
      Promise.resolve(undefined),
      vi.fn(),
    );
    plugin.apply(compiler as any);
    await triggerProcessAssets();

    expect(afterGenerateTypes).not.toHaveBeenCalled();
  });

  it('should await async afterGenerateTypes before continuing', async () => {
    mockIsDev.mockReturnValue(false);
    const order: string[] = [];
    const afterGenerateTypes = vi.fn(async () => {
      order.push('callback');
    });
    const { compiler, triggerProcessAssets } = createMockCompiler();

    const plugin = new GenerateTypesPlugin(
      basePluginOptions,
      { generateTypes: true, afterGenerateTypes },
      Promise.resolve(undefined),
      vi.fn(),
    );
    plugin.apply(compiler as any);
    order.push('before');
    await triggerProcessAssets();
    order.push('after');

    expect(order).toEqual(['before', 'callback', 'after']);
  });
});

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
      expect(isSafeRelativePath(relZip)).toBe(false);

      // Verify fallback behavior
      const emitZipName = resolveEmitAssetName({
        compilerOutputPath,
        assetPath: zipTypesPath,
        fallbackName: path.basename(zipTypesPath),
      });
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

    it('should treat windows cross-drive path as unsafe relative path', () => {
      const relZip = path.win32.relative(
        'C:\\dist',
        'D:\\types\\@mf-types.zip',
      );
      expect(relZip).toBe('D:\\types\\@mf-types.zip');
      expect(isSafeRelativePath(relZip)).toBe(false);
    });

    it('should resolve relative asset name for nested output directory', () => {
      const emitZipName = resolveEmitAssetName({
        compilerOutputPath: path.resolve('/project', 'dist'),
        assetPath: path.resolve(
          '/project',
          'dist',
          'production',
          '@mf-types.zip',
        ),
        fallbackName: '@mf-types.zip',
      });
      expect(emitZipName).toBe(path.join('production', '@mf-types.zip'));
    });
  });
});
