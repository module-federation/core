import { ExecutorContext } from '@nx/devkit';
import * as path from 'path';
import rslibBuildExecutor, { RslibBuildExecutorOptions } from './executor';

// Mock @rslib/core
jest.mock('@rslib/core', () => ({
  build: jest.fn().mockResolvedValue(undefined),
  loadConfig: jest.fn().mockResolvedValue({ content: {} }),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
}));

const mockFs = require('fs');

// Mock process.chdir and process.cwd
const originalChdir = process.chdir;
const originalCwd = process.cwd;
beforeAll(() => {
  process.chdir = jest.fn();
  process.cwd = jest.fn().mockReturnValue('/workspace');
});

afterAll(() => {
  process.chdir = originalChdir;
  process.cwd = originalCwd;
});

// Mock glob
jest.mock('glob', () => ({
  glob: jest.fn().mockResolvedValue([]),
}));

describe('Rslib Build Executor', () => {
  let context: ExecutorContext;
  let options: RslibBuildExecutorOptions;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset all mocks
    mockFs.existsSync.mockReset();
    mockFs.mkdirSync.mockReset();
    mockFs.copyFileSync.mockReset();

    context = {
      root: '/workspace',
      projectName: 'test-project',
      projectGraph: {
        nodes: {
          'test-project': {
            data: {
              root: 'libs/test-project',
            },
          },
        },
      },
    } as any;

    options = {
      outputPath: 'dist/libs/test-project',
      main: 'libs/test-project/src/index.ts',
      tsConfig: 'libs/test-project/tsconfig.lib.json',
      format: ['esm', 'cjs'],
      external: ['@module-federation/*'],
    };
  });

  describe('Path Resolution', () => {
    it('should handle workspace-relative paths correctly', async () => {
      const fs = require('fs');
      const { build, loadConfig } = require('@rslib/core');

      fs.existsSync.mockReturnValue(false); // No config file exists

      await rslibBuildExecutor(options, context);

      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          lib: expect.arrayContaining([
            expect.objectContaining({
              format: 'esm',
              dts: true,
              output: {
                distPath: {
                  root: path.join('/workspace', 'dist/libs/test-project'),
                },
              },
            }),
            expect.objectContaining({
              format: 'cjs',
              dts: false, // Only first format should have DTS
              output: {
                distPath: {
                  root: path.join('/workspace', 'dist/libs/test-project'),
                },
              },
            }),
          ]),
          source: expect.objectContaining({
            entry: {
              index: path.join('/workspace', 'libs/test-project/src/index.ts'),
            },
            tsconfigPath: path.join(
              '/workspace',
              'libs/test-project/tsconfig.lib.json',
            ),
          }),
        }),
        expect.any(Object),
      );
    });

    it('should handle absolute paths correctly', async () => {
      const fs = require('fs');
      const { build } = require('@rslib/core');

      fs.existsSync.mockReturnValue(false);

      const absoluteOptions = {
        ...options,
        main: '/workspace/libs/test-project/src/index.ts',
        tsConfig: '/workspace/libs/test-project/tsconfig.lib.json',
      };

      await rslibBuildExecutor(absoluteOptions, context);

      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          source: expect.objectContaining({
            entry: {
              index: '/workspace/libs/test-project/src/index.ts',
            },
            tsconfigPath: '/workspace/libs/test-project/tsconfig.lib.json',
          }),
        }),
        expect.any(Object),
      );
    });
  });

  describe('External Dependencies', () => {
    it('should handle glob patterns in externals', async () => {
      const fs = require('fs');
      const { build } = require('@rslib/core');

      fs.existsSync.mockReturnValue(false);

      await rslibBuildExecutor(options, context);

      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: {
            rspack: {
              externals: {
                '@module-federation/(.*)': '@module-federation/*',
              },
            },
          },
        }),
        expect.any(Object),
      );
    });

    it('should handle exact match externals', async () => {
      const fs = require('fs');
      const { build } = require('@rslib/core');

      fs.existsSync.mockReturnValue(false);

      const exactExternalOptions = {
        ...options,
        external: ['react', 'react-dom'],
      };

      await rslibBuildExecutor(exactExternalOptions, context);

      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: {
            rspack: {
              externals: {
                react: 'react',
                'react-dom': 'react-dom',
              },
            },
          },
        }),
        expect.any(Object),
      );
    });
  });

  describe('Entry Points', () => {
    it('should handle additional entry points', async () => {
      const fs = require('fs');
      const { build } = require('@rslib/core');

      fs.existsSync.mockReturnValue(false);

      const multiEntryOptions = {
        ...options,
        additionalEntryPoints: [
          'libs/test-project/src/utils.ts',
          'libs/test-project/src/types.ts',
        ],
      };

      await rslibBuildExecutor(multiEntryOptions, context);

      expect(build).toHaveBeenCalledWith(
        expect.objectContaining({
          source: expect.objectContaining({
            entry: {
              index: path.join('/workspace', 'libs/test-project/src/index.ts'),
              utils: path.join('/workspace', 'libs/test-project/src/utils.ts'),
              types: path.join('/workspace', 'libs/test-project/src/types.ts'),
            },
          }),
        }),
        expect.any(Object),
      );
    });
  });

  describe('Configuration Loading', () => {
    it('should use existing config file when available', async () => {
      const fs = require('fs');
      const { build, loadConfig } = require('@rslib/core');

      fs.existsSync.mockReturnValue(true); // Config file exists
      loadConfig.mockResolvedValue({
        content: {
          lib: [{ format: 'esm' }],
        },
      });

      await rslibBuildExecutor(options, context);

      expect(loadConfig).toHaveBeenCalledWith({
        cwd: path.join('/workspace', 'libs/test-project'),
        path: path.join('/workspace', 'libs/test-project', 'rslib.config.ts'),
      });

      expect(build).toHaveBeenCalledWith(
        { lib: [{ format: 'esm' }] },
        expect.any(Object),
      );
    });

    it('should use custom config file when specified', async () => {
      const fs = require('fs');
      const { loadConfig } = require('@rslib/core');

      fs.existsSync.mockReturnValue(true);

      const customConfigOptions = {
        ...options,
        configFile: 'custom.rslib.config.ts',
      };

      await rslibBuildExecutor(customConfigOptions, context);

      expect(loadConfig).toHaveBeenCalledWith({
        cwd: path.join('/workspace', 'libs/test-project'),
        path: path.join(
          '/workspace',
          'libs/test-project',
          'custom.rslib.config.ts',
        ),
      });
    });
  });

  describe('DTS Generation', () => {
    it('should only generate DTS for the first format to avoid duplication', async () => {
      const fs = require('fs');
      const { build } = require('@rslib/core');

      fs.existsSync.mockReturnValue(false);

      const multiFormatOptions = {
        ...options,
        format: ['esm', 'cjs', 'umd'] as ('esm' | 'cjs' | 'umd')[],
      };

      await rslibBuildExecutor(multiFormatOptions, context);

      const buildCall = build.mock.calls[0][0];
      expect(buildCall.lib[0].dts).toBe(true); // ESM has DTS
      expect(buildCall.lib[1].dts).toBe(false); // CJS no DTS
      expect(buildCall.lib[2].dts).toBe(false); // UMD no DTS
    });
  });

  describe('Error Handling', () => {
    it('should return success: false on build failure', async () => {
      const fs = require('fs');
      const { build } = require('@rslib/core');

      fs.existsSync.mockReturnValue(false);
      build.mockRejectedValue(new Error('Build failed'));

      const result = await rslibBuildExecutor(options, context);

      expect(result).toEqual({ success: false });
    });

    it('should throw error when project root is not found', async () => {
      const invalidContext = {
        ...context,
        projectGraph: {
          nodes: {},
          dependencies: {},
        },
      } as ExecutorContext;

      await expect(rslibBuildExecutor(options, invalidContext)).rejects.toThrow(
        'Could not find project root for test-project',
      );
    });
  });

  describe('Asset Handling', () => {
    it.skip('should copy simple string assets', async () => {
      const { build } = require('@rslib/core');

      mockFs.existsSync.mockImplementation((path: string) => {
        if (path.includes('rslib.config')) return false;
        if (path.includes('README.md')) return true;
        if (
          path.includes('dist/libs/test-project') &&
          !path.includes('README.md')
        )
          return false; // Directory doesn't exist yet
        return false;
      });

      const assetOptions = {
        ...options,
        assets: ['README.md'],
      };

      await rslibBuildExecutor(assetOptions, context);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        '/workspace/dist/libs/test-project',
        { recursive: true },
      );

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        '/workspace/libs/test-project/README.md',
        '/workspace/dist/libs/test-project/README.md',
      );
    });
  });
});
