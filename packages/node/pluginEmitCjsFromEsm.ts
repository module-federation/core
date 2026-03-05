import { transformFile } from '@swc/core';
import type { Dirent } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';

import type { RsbuildPlugin } from '@rslib/core';

const readDirectory = async (directory: string): Promise<Dirent[]> => {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const shouldTranspileSource = (filePath: string): boolean => {
  const extension = extname(filePath);
  if (!SOURCE_EXTENSIONS.has(extension)) {
    return false;
  }

  if (filePath.endsWith('.d.ts')) {
    return false;
  }

  if (filePath.includes('.spec.') || filePath.includes('.test.')) {
    return false;
  }

  return true;
};

const collectSourceFiles = async (directory: string): Promise<string[]> => {
  const entries = await readDirectory(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && shouldTranspileSource(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
};

const emitCjsFromSourceFile = async (
  filePath: string,
  sourceDirectory: string,
  cjsDistDirectory: string,
): Promise<void> => {
  const relativePath = relative(sourceDirectory, filePath);
  const extension = extname(relativePath);
  const cjsRelativePath =
    extension === '.js'
      ? relativePath
      : `${relativePath.slice(0, -extension.length)}.js`;
  const cjsFilePath = resolve(cjsDistDirectory, cjsRelativePath);
  const parserSyntax =
    extension === '.ts' || extension === '.tsx' ? 'typescript' : 'ecmascript';

  const { code } = await transformFile(filePath, {
    filename: filePath,
    sourceMaps: false,
    jsc: {
      target: 'es2021',
      parser: {
        syntax: parserSyntax,
        tsx: extension === '.tsx',
        jsx: extension === '.jsx',
        dynamicImport: true,
        importMeta: true,
        topLevelAwait: true,
      },
    },
    module: {
      type: 'commonjs',
    },
  });

  if (typeof code === 'string') {
    await mkdir(dirname(cjsFilePath), { recursive: true });
    await writeFile(cjsFilePath, code, 'utf-8');
  }
};

export const pluginEmitCjsFromEsm = (): RsbuildPlugin => ({
  name: 'plugin-emit-cjs-from-esm',
  apply: 'build',
  setup(api) {
    api.onAfterBuild(async () => {
      const sourceDirectory = resolve(process.cwd(), 'src');
      const cjsDirectory = resolve(process.cwd(), 'dist/cjs');

      await rm(cjsDirectory, { recursive: true, force: true });

      const files = await collectSourceFiles(sourceDirectory);
      await Promise.all(
        files.map((filePath) =>
          emitCjsFromSourceFile(filePath, sourceDirectory, cjsDirectory),
        ),
      );
    });
  },
});
