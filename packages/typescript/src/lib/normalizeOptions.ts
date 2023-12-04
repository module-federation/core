import ts from 'typescript';
import { Compiler } from 'webpack';
import get from 'lodash.get';
import path from 'path';

import type { FederatedTypesPluginOptions, TypeServeOptions } from '../types';

import {
  TYPESCRIPT_COMPILED_FOLDER_NAME,
  TYPESCRIPT_FOLDER_NAME,
  TYPES_INDEX_JSON_FILE_NAME,
} from '../constants';

export type NormalizeOptions = ReturnType<typeof normalizeOptions>;

export const DEFAULT_FETCH_TIMEOUT = 3000;
export const DEFAULT_FETCH_MAX_RETRY_ATTEMPTS = 3;
export const DEFAULT_FETCH_RETRY_DELAY = 1000;

const defaultOptions: Required<
  Omit<FederatedTypesPluginOptions, 'federationConfig' | 'typeServeOptions'>
> = {
  compiler: 'tsc',
  disableDownloadingRemoteTypes: false,
  disableTypeCompilation: false,
  typescriptFolderName: TYPESCRIPT_FOLDER_NAME,
  typescriptCompiledFolderName: TYPESCRIPT_COMPILED_FOLDER_NAME,
  additionalFilesToCompile: [],
  typeFetchOptions: {
    downloadRemoteTypesTimeout: DEFAULT_FETCH_TIMEOUT,
    maxRetryAttempts: DEFAULT_FETCH_MAX_RETRY_ATTEMPTS,
    retryDelay: DEFAULT_FETCH_RETRY_DELAY,
    shouldRetryOnTypesNotFound: true,
    shouldRetry: true,
  },
};

export const validateTypeServeOptions = (options: TypeServeOptions) => {
  if (!options) {
    throw new Error('TypeServeOptions is required');
  }

  if (!options.host) {
    throw new Error('TypeServeOptions.host is required');
  }

  if (!options.port || !Number.isInteger(options.port)) {
    throw new Error('TypeServeOptions.port is required');
  }
};

export const isObjectEmpty = <T extends object>(obj: T) => {
  for (const x in obj) {
    return false;
  }
  return true;
};

export const normalizeOptions = (
  options: FederatedTypesPluginOptions,
  compiler: Compiler,
) => {
  const webpackCompilerOptions = compiler.options;

  const { context, watchOptions } = webpackCompilerOptions;
  const {
    federationConfig,
    typescriptFolderName,
    typescriptCompiledFolderName,
    ...restOptions
  } = {
    ...defaultOptions,
    ...options,
  };

  const typeFetchOptions = {
    ...defaultOptions.typeFetchOptions,
    ...(options.typeFetchOptions ?? {}),
  };

  const federationFileName = (federationConfig.filename ??
    'remoteEntry.js') as string;
  const distPath =
    get(webpackCompilerOptions, 'devServer.static.directory') ||
    get(webpackCompilerOptions, 'output.path') ||
    'dist';

  const typesPath = federationFileName.substring(
    0,
    federationFileName.lastIndexOf('/'),
  );

  const typesIndexJsonFilePath = path.join(
    typesPath,
    TYPES_INDEX_JSON_FILE_NAME,
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
    typeFetchOptions,
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
