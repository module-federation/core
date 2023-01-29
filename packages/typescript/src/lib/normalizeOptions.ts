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

const defaultOptions: Required<
  Omit<FederatedTypesPluginOptions, 'federationConfig'>
> = {
  compiler: 'tsc',
  disableDownloadingRemoteTypes: false,
  disableTypeCompilation: false,
  typescriptFolderName: TYPESCRIPT_FOLDER_NAME,
  typescriptCompiledFolderName: TYPESCRIPT_COMPILED_FOLDER_NAME,
  additionalFilesToCompile: [],
};

export const normalizeOptions = (
  options: FederatedTypesPluginOptions,
  compiler: Compiler
) => {
  const webpackCompilerOptions = compiler.options;
  const federationFileName = options.federationConfig.filename as string;

  const { context, watchOptions } = webpackCompilerOptions;
  const { typescriptFolderName, typescriptCompiledFolderName, ...restOptions } =
    {
      ...defaultOptions,
      ...options,
    };

  const distPath =
    get(webpackCompilerOptions, 'devServer.static.directory') ||
    get(webpackCompilerOptions, 'output.path') ||
    'dist';

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

  const watchOptionsToIgnore = [
    path.normalize(path.join(context as string, typescriptFolderName)),
  ];

  const ignoredWatchOptions = Array.isArray(watchOptions.ignored)
    ? [...watchOptions.ignored, ...watchOptionsToIgnore]
    : watchOptionsToIgnore;

  return {
    ...restOptions,
    distDir,
    publicPath,
    tsCompilerOptions,
    typesIndexJsonFileName: TYPES_INDEX_JSON_FILE_NAME,
    typesIndexJsonFilePath,
    typescriptFolderName,
    webpackCompilerOptions,
    ignoredWatchOptions,
  };
};
