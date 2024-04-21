import dirTree from 'directory-tree';
import { mkdtempSync, readFileSync, rmSync } from 'fs';
import os from 'os';
import upath from 'upath';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import {
  compileTs,
  retrieveMfTypesPath,
  retrieveOriginalOutDir,
} from './typeScriptCompiler';

/**
 * Take only ['name', 'children'] attributes from **directory-tree** result
 * @param tree
 * @see https://www.npmjs.com/package/directory-tree#result
 * @example
 * // result:
 * {
 *   "name": "photos",
 *   "children": [
 *   {
 *     "name": "summer",
 *   },
 * }
 */
const namesOnly = (tree: dirTree.DirectoryTree) => {
  const prepareNode = (node: dirTree.DirectoryTree): dirTree.DirectoryTree => {
    if (node.children) {
      return {
        name: node.name,
        children: node.children.map(prepareNode),
      } as dirTree.DirectoryTree;
    }

    return {
      name: node.name,
    } as dirTree.DirectoryTree;
  };

  return prepareNode(tree);
};

const runTypeScriptCompilerTests = () => {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'typeScriptCompiler'));

  const tsConfig = {
    outDir: path.join(tmpDir, 'typesRemoteFolder', 'compiledTypesFolder'),
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
    const expectedPath = path.join(tmpDir, 'typesRemoteFolder') + path.sep;
    const retrievedMfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);

    expect(retrievedMfTypesPath).toBe(expectedPath);
  });

  it('retrieveOriginalOutDir correctly calculate path', () => {
    const expectedPath = tmpDir + path.sep;
    const retrievedOriginalOutDir = retrieveOriginalOutDir(
      tsConfig,
      remoteOptions,
    );

    expect(retrievedOriginalOutDir).toBe(expectedPath);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('empty mapToExpose', () => {
    const compile = () => compileTs({}, tsConfig, remoteOptions);
    expect(compile).not.toThrow();

    const directoryStructure = dirTree(upath.join(tsConfig.outDir, '..'));
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

    const directoryStructure = dirTree(upath.join(tsConfig.outDir, '..'));
    expect(directoryStructure).toMatchObject({});
  });

  it('filled mapToExpose', () => {
    const mapToExpose = {
      tsCompiler: upath.join(__dirname, './typeScriptCompiler.ts'),
    };

    const compile = () => compileTs(mapToExpose, tsConfig, remoteOptions);
    expect(compile).not.toThrow();

    const directoryStructure = dirTree(upath.join(tsConfig.outDir, '..'));
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

    expect(namesOnly(directoryStructure)).toMatchObject(expectedStructure);
  });

  it('with additionalFilesToCompile', () => {
    const mapToExpose = {
      tsCompiler: upath.join(__dirname, './typeScriptCompiler.ts'),
    };
    const additionalFilesToCompile = [
      upath.join(__dirname, './typeScriptCompiler.test.ts'),
    ];

    const compile = () =>
      compileTs(mapToExpose, tsConfig, {
        ...remoteOptions,
        additionalFilesToCompile,
      });
    expect(compile).not.toThrow();

    const directoryStructure = dirTree(upath.join(tsConfig.outDir, '..'));
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

    expect(namesOnly(directoryStructure)).toMatchObject(expectedStructure);
  });

  it('filled mapToExpose - tsCompiler.d.ts file content', () => {
    const mapToExpose = {
      tsCompiler: upath.join(__dirname, './typeScriptCompiler.ts'),
    };

    const compile = () => compileTs(mapToExpose, tsConfig, remoteOptions);
    expect(compile).not.toThrow();

    const compiledTypesFile = path.resolve(
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

describe('typeScriptCompiler (posix)', runTypeScriptCompilerTests);

export { runTypeScriptCompilerTests };
