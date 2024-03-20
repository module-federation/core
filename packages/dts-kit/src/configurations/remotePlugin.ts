import { existsSync } from 'fs';
import { dirname, join, resolve, extname } from 'path';
import typescript from 'typescript';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { validateOptions } from '../lib/utils';

const defaultOptions = {
  tsConfigPath: './tsconfig.json',
  typesFolder: '@mf-types',
  compiledTypesFolder: 'compiled-types',
  deleteTypesFolder: true,
  additionalFilesToCompile: [],
  compilerInstance: 'tsc' as const,
  compileInChildProcess: false,
  implementation: '',
  generateAPITypes: false,
  context: process.cwd(),
} satisfies Partial<RemoteOptions>;

const readTsConfig = ({
  tsConfigPath,
  typesFolder,
  compiledTypesFolder,
  context,
}: Required<RemoteOptions>): typescript.CompilerOptions => {
  const resolvedTsConfigPath = resolve(context, tsConfigPath);

  const readResult = typescript.readConfigFile(
    resolvedTsConfigPath,
    typescript.sys.readFile,
  );
  const configContent = typescript.parseJsonConfigFileContent(
    readResult.config,
    typescript.sys,
    dirname(resolvedTsConfigPath),
  );
  const outDir = join(
    context,
    configContent.options.outDir || 'dist',
    typesFolder,
    compiledTypesFolder,
  );

  return {
    ...configContent.options,
    emitDeclarationOnly: true,
    noEmit: false,
    declaration: true,
    outDir,
  };
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
  return Object.entries(
    remoteOptions.moduleFederationConfig.exposes as Record<string, string>,
  ).reduce(
    (accumulator, [exposedEntry, exposedPath]) => {
      accumulator[exposedEntry] =
        resolveWithExtension(exposedPath, remoteOptions.context) ||
        resolveWithExtension(
          join(exposedPath, 'index'),
          remoteOptions.context,
        ) ||
        exposedPath;
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
  const tsConfig = readTsConfig(remoteOptions);

  return {
    tsConfig,
    mapComponentsToExpose,
    remoteOptions,
  };
};
