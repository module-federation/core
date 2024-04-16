import dirTree from 'directory-tree';
import { mkdtempSync, readFileSync, rmSync } from 'fs';
import os from 'os';
import { join, sep, resolve } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import {
  compileTs,
  retrieveMfTypesPath,
  retrieveOriginalOutDir,
} from './typeScriptCompiler';

describe('typeScriptCompiler', () => {
  const tmpDir = mkdtempSync(join(os.tmpdir(), 'typeScriptCompiler'));

  const tsConfig = {
    outDir: join(tmpDir, 'typesRemoteFolder', 'compiledTypesFolder'),
  };

  const remoteOptions: Required<RemoteOptions> = {
    additionalFilesToCompile: [],
    compiledTypesFolder: 'compiledTypesFolder',
    typesFolder: 'typesRemoteFolder',
    moduleFederationConfig: {},
    tsConfigPath: './tsconfig.json',
    deleteTypesFolder: false,
    compilerInstance: 'tsc',
    compileInChildProcess: false,
    generateAPITypes: false,
    extractThirdParty: false,
    extractRemoteTypes: false,
    implementation: '',
    context: process.cwd(),
    hostRemoteTypesFolder: '@mf-types',
    abortOnError: true,
  };

  it('retrieveMfTypesPath correctly calculate path', () => {
    const expectedPath = join(tmpDir, 'typesRemoteFolder') + sep;
    const retrievedMfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);

    expect(retrievedMfTypesPath).toBe(expectedPath);
  });

  it('retrieveOriginalOutDir correctly calculate path', () => {
    const expectedPath = tmpDir + sep;
    const retrievedOriginalOutDir = retrieveOriginalOutDir(
      tsConfig,
      remoteOptions,
    );

    expect(retrievedOriginalOutDir).toBe(expectedPath);
  });

  const runCompileTsTest = () => {
    afterEach(() => {
      rmSync(tmpDir, { recursive: true, force: true });
      vi.resetAllMocks();
    });

    it('empty mapToExpose', () => {
      const compile = () => compileTs({}, tsConfig, remoteOptions);
      expect(compile).not.toThrow();

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'), {
        exclude: /node_modules/,
      });
      expect(directoryStructure).toMatchObject({});
    });

    it('empty mapToExpose for vue-tsc', () => {
      const compile = () =>
        compileTs(
          {},
          { ...tsConfig, emitDeclarationOnly: true },
          { ...remoteOptions, compilerInstance: 'vue-tsc' },
        );
      expect(compile).not.toThrow();

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'), {
        exclude: /node_modules/,
      });
      expect(directoryStructure).toMatchObject({});
    });

    it('filled mapToExpose', () => {
      const mapToExpose = {
        tsCompiler: join(__dirname, './typeScriptCompiler.ts'),
      };

      const compile = () => compileTs(mapToExpose, tsConfig, remoteOptions);
      expect(compile).not.toThrow();

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'), {
        exclude: /node_modules/,
      });
      const expectedStructure = {
        name: 'typesRemoteFolder',
        children: [
          {
            name: 'compiledTypesFolder',
            children: [
              {
                name: 'interfaces',
                children: [
                  {
                    name: 'RemoteOptions.js',
                  },
                ],
              },
              {
                name: 'lib',
                children: [
                  {
                    name: 'typeScriptCompiler.js',
                  },
                ],
              },
            ],
          },
          {
            name: 'tsCompiler.d.ts',
          },
        ],
      };

      expect(directoryStructure).toMatchObject(expectedStructure);
    });

    it('with additionalFilesToCompile', () => {
      const mapToExpose = {
        tsCompiler: join(__dirname, './typeScriptCompiler.ts'),
      };
      const additionalFilesToCompile = [
        join(__dirname, './typeScriptCompiler.test.ts'),
      ];

      const compile = () =>
        compileTs(mapToExpose, tsConfig, {
          ...remoteOptions,
          additionalFilesToCompile,
        });
      expect(compile).not.toThrow();

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'), {
        exclude: /node_modules/,
      });
      const expectedStructure = {
        name: 'typesRemoteFolder',
        children: [
          {
            name: 'compiledTypesFolder',
            children: [
              {
                name: 'interfaces',
                children: [
                  {
                    name: 'RemoteOptions.js',
                  },
                ],
              },
              {
                name: 'lib',
                children: [
                  {
                    name: 'typeScriptCompiler.js',
                  },
                  {
                    name: 'typeScriptCompiler.test.js',
                  },
                ],
              },
            ],
          },
          {
            name: 'tsCompiler.d.ts',
          },
        ],
      };

      expect(directoryStructure).toMatchObject(expectedStructure);
    });

    it('filled mapToExpose - tsCompiler.d.ts file content', () => {
      const mapToExpose = {
        tsCompiler: join(__dirname, './typeScriptCompiler.ts'),
      };

      const compile = () => compileTs(mapToExpose, tsConfig, remoteOptions);
      expect(compile).not.toThrow();

      const compiledTypesFile = resolve(
        tsConfig.outDir,
        '..',
        'tsCompiler.d.ts',
      );

      const result = readFileSync(compiledTypesFile, 'utf8');

      expect(result)
        .toEqual(`export * from './compiledTypesFolder/lib/typeScriptCompiler.js';
export { default } from './compiledTypesFolder/lib/typeScriptCompiler.js';`);
    });
  };

  describe('compileTs (posix)', () => {
    beforeEach(() => {
      vi.mock('path', async (importOriginal) => {
        const originalPath = await importOriginal<typeof import('path')>();
        const platformPath = originalPath.posix;
        return {
          ...platformPath,
          posix: originalPath.posix,
          win32: originalPath.win32,
          default: platformPath,
        };
      });
    });

    runCompileTsTest();
  });

  describe('compileTs (win32)', () => {
    beforeEach(() => {
      vi.mock('path', async (importOriginal) => {
        const originalPath = await importOriginal<typeof import('path')>();
        const platformPath = originalPath.win32;
        return {
          ...platformPath,
          posix: originalPath.posix,
          win32: originalPath.win32,
          default: platformPath,
        };
      });
    });

    runCompileTsTest();
  });
});
