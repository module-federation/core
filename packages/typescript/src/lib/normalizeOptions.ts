import ts from 'typescript';
import { Compiler } from 'webpack';
import get from 'lodash.get';
import path from 'path';

import { typescriptFolderName, typesIndexJsonFileName } from '../constants';
import { FederatedTypesPluginOptions } from '../types';

export type NormalizeOptions = ReturnType<typeof normalizeOptions>;

export const normalizeOptions = (
  options: FederatedTypesPluginOptions,
  compiler: Compiler
) => {
  const webpackCompilerOptions = compiler.options;

  const distPath =
    get(webpackCompilerOptions, 'devServer.static.directory') ||
    get(webpackCompilerOptions, 'output.path') ||
    'dist';

  const distDir = path.join(distPath, typescriptFolderName);
  const typesIndexJsonFilePath = path.join(distDir, typesIndexJsonFileName);

  const tsCompilerOptions: ts.CompilerOptions = {
    declaration: true,
    emitDeclarationOnly: true,
    outDir: path.join(distDir, '/'),
  };

  const webpackPublicPath = webpackCompilerOptions.output.publicPath;

  const publicPath =
    typeof webpackPublicPath === 'string'
      ? webpackPublicPath === 'auto'
        ? ''
        : webpackPublicPath
      : '';

  return {
    distDir,
    publicPath,
    tsCompilerOptions,
    typesIndexJsonFileName,
    typesIndexJsonFilePath,
    typescriptFolderName,
  };
};
