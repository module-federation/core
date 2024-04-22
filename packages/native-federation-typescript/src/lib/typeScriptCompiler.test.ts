import dirTree from 'directory-tree';
import { mkdtempSync, rmSync } from 'fs';
import os from 'os';
import { join, sep } from 'path';
import { afterEach, describe, expect, it } from 'vitest';

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

  describe('compileTs', () => {
    afterEach(() => {
      rmSync(tmpDir, { recursive: true, force: true });
    });

    it('empty mapToExpose', () => {
      const compile = () => compileTs({}, tsConfig, remoteOptions);
      expect(compile).not.toThrow();

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'));
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

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'));
      expect(directoryStructure).toMatchObject({});
    });

    it('filled mapToExpose', () => {
      const mapToExpose = {
        tsCompiler: join(__dirname, './typeScriptCompiler.ts'),
      };

      const compile = () => compileTs(mapToExpose, tsConfig, remoteOptions);
      expect(compile).not.toThrow();

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'));
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

      const directoryStructure = dirTree(join(tsConfig.outDir, '..'));
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
  });
});
