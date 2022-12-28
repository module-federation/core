import ts from 'typescript';
import { Compiler } from 'webpack';
import get from 'lodash.get';
import path from 'path';

import {
  TYPESCRIPT_COMPILED_FOLDER_NAME,
  TYPESCRIPT_FOLDER_NAME,
  TYPES_INDEX_JSON_FILE_NAME,
} from '../constants';
import { FederatedTypesPluginOptions } from '../types';

export type NormalizeOptions = ReturnType<typeof normalizeOptions>;

export const normalizeOptions = (
  options: FederatedTypesPluginOptions,
  compiler: Compiler
) => {
  const {
    typescriptFolderName = TYPESCRIPT_FOLDER_NAME,
    typescriptCompiledFolderName = TYPESCRIPT_COMPILED_FOLDER_NAME,
  } = options;
  const webpackCompilerOptions = compiler.options;

  const distPath =
    get(webpackCompilerOptions, 'devServer.static.directory') ||
    get(webpackCompilerOptions, 'output.path') ||
    'dist';
  const federationFileName = options.federationConfig.filename as string;

  const typesPath = federationFileName.substring(
    0,
    federationFileName.lastIndexOf('/')
  );

  const typesIndexJsonFilePath = path.join(
    typesPath,
    TYPES_INDEX_JSON_FILE_NAME
  );

  const distDir = path.join(distPath, typesPath, typescriptFolderName);

  const tsCompilerOptions: ts.CompilerOptions = {
    declaration: true,
    emitDeclarationOnly: true,
    outDir: path.join(distDir, `/${typescriptCompiledFolderName}/`),
    noEmit: false,
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
    typesIndexJsonFileName: TYPES_INDEX_JSON_FILE_NAME,
    typesIndexJsonFilePath,
    typescriptFolderName,
    webpackCompilerOptions,
  };
};
