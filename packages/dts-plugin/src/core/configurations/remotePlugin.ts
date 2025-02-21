import { existsSync } from 'fs';
import { dirname, join, resolve, extname } from 'path';
import { utils } from '@module-federation/managers';
import typescript from 'typescript';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { validateOptions } from '../lib/utils';
import { TsConfigJson } from '../interfaces/TsConfigJson';

const defaultOptions = {
  tsConfigPath: './tsconfig.json',
  typesFolder: '@mf-types',
  compiledTypesFolder: 'compiled-types',
  hostRemoteTypesFolder: '@mf-types',
  deleteTypesFolder: true,
  additionalFilesToCompile: [],
  compilerInstance: 'tsc' as const,
  compileInChildProcess: false,
  implementation: '',
  generateAPITypes: false,
  context: process.cwd(),
  abortOnError: true,
  extractRemoteTypes: false,
  extractThirdParty: false,
  outputDir: '',
} satisfies Partial<RemoteOptions>;

function getEffectiveRootDir(
  parsedCommandLine: typescript.ParsedCommandLine,
): string {
  const compilerOptions = parsedCommandLine.options;

  if (compilerOptions.rootDir) {
    return compilerOptions.rootDir;
  }

  // if no set rootDir , infer the commonRoot
  const files = parsedCommandLine.fileNames;
  if (files.length > 0) {
    const commonRoot = files
      .map((file) => dirname(file))
      .reduce((commonPath, fileDir) => {
        while (!fileDir.startsWith(commonPath)) {
          commonPath = dirname(commonPath);
        }
        return commonPath;
      }, files[0]);
    return commonRoot;
  }

  throw new Error(
    'Can not get effective rootDir, please set compilerOptions.rootDir !',
  );
}

const readTsConfig = (
  {
    tsConfigPath,
    typesFolder,
    compiledTypesFolder,
    context,
    additionalFilesToCompile,
    outputDir,
    moduleFederationConfig,
  }: Required<RemoteOptions>,
  mapComponentsToExpose: Record<string, string>,
): TsConfigJson => {
  const resolvedTsConfigPath = resolve(context, tsConfigPath);

  const readResult = typescript.readConfigFile(
    resolvedTsConfigPath,
    typescript.sys.readFile,
  );

  if (readResult.error) {
    throw new Error(readResult.error.messageText.toString());
  }

  const rawTsConfigJson: TsConfigJson = readResult.config;

  const configContent = typescript.parseJsonConfigFileContent(
    rawTsConfigJson,
    typescript.sys,
    dirname(resolvedTsConfigPath),
  );
  const rootDir = getEffectiveRootDir(configContent);

  const outDir = resolve(
    context,
    outputDir || configContent.options.outDir || 'dist',
    typesFolder,
    compiledTypesFolder,
  );

  const defaultCompilerOptions: typescript.CompilerOptions = {
    rootDir,
    emitDeclarationOnly: true,
    noEmit: false,
    declaration: true,
    outDir,
  };

  rawTsConfigJson.compilerOptions = rawTsConfigJson.compilerOptions || {};

  rawTsConfigJson.compilerOptions = {
    incremental: true,
    tsBuildInfoFile: resolve(
      context,
      'node_modules/.cache/mf-types/.tsbuildinfo',
    ),
    ...rawTsConfigJson.compilerOptions,
    ...defaultCompilerOptions,
  };

  const { paths, baseUrl, ...restCompilerOptions } =
    rawTsConfigJson.compilerOptions || {};
  rawTsConfigJson.compilerOptions = restCompilerOptions;

  const filesToCompile = [
    ...Object.values(mapComponentsToExpose),
    ...configContent.fileNames.filter((filename) => filename.endsWith('.d.ts')),
    ...additionalFilesToCompile,
  ];

  rawTsConfigJson.include = [];
  rawTsConfigJson.files = filesToCompile;
  rawTsConfigJson.exclude = [];
  'references' in rawTsConfigJson && delete rawTsConfigJson.references;

  rawTsConfigJson.extends = resolvedTsConfigPath;
  return rawTsConfigJson;
};

const TS_EXTENSIONS = ['ts', 'tsx', 'vue', 'svelte'];

const resolveWithExtension = (exposedPath: string, context: string) => {
  if (extname(exposedPath)) {
    return resolve(context, exposedPath);
  }
  for (const extension of TS_EXTENSIONS) {
    const exposedPathWithExtension = resolve(
      context,
      `${exposedPath}.${extension}`,
    );
    if (existsSync(exposedPathWithExtension)) {
      return exposedPathWithExtension;
    }
  }
  return undefined;
};

const resolveExposes = (remoteOptions: Required<RemoteOptions>) => {
  const parsedOptions = utils.parseOptions(
    remoteOptions.moduleFederationConfig.exposes || {},
    (item, key) => ({
      exposePath: Array.isArray(item) ? item[0] : item,
      key,
    }),
    (item, key) => ({
      exposePath: Array.isArray(item.import) ? item.import[0] : item.import[0],
      key,
    }),
  );
  return parsedOptions.reduce(
    (accumulator, item) => {
      const { exposePath, key } = item[1];
      accumulator[key] =
        resolveWithExtension(exposePath, remoteOptions.context) ||
        resolveWithExtension(
          join(exposePath, 'index'),
          remoteOptions.context,
        ) ||
        exposePath;
      return accumulator;
    },
    {} as Record<string, string>,
  );
};

export const retrieveRemoteConfig = (options: RemoteOptions) => {
  validateOptions(options);

  const remoteOptions: Required<RemoteOptions> = {
    ...defaultOptions,
    ...options,
  };
  const mapComponentsToExpose = resolveExposes(remoteOptions);
  const tsConfig = readTsConfig(remoteOptions, mapComponentsToExpose);

  if (
    tsConfig.compilerOptions.incremental &&
    tsConfig.compilerOptions.tsBuildInfoFile &&
    options.deleteTypesFolder !== true
  ) {
    remoteOptions.deleteTypesFolder = false;
  }

  return {
    tsConfig,
    mapComponentsToExpose,
    remoteOptions,
  };
};
