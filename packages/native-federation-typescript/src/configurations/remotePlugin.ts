import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import typescript from 'typescript';

import { RemoteOptions } from '../interfaces/RemoteOptions';

const defaultOptions = {
  tsConfigPath: './tsconfig.json',
  typesFolder: '@mf-types',
  compiledTypesFolder: 'compiled-types',
  deleteTypesFolder: true,
  additionalFilesToCompile: [],
  compilerInstance: 'tsc' as const,
} satisfies Partial<RemoteOptions>;

const readTsConfig = ({
  tsConfigPath,
  typesFolder,
  compiledTypesFolder,
}: Required<RemoteOptions>): typescript.CompilerOptions => {
  const resolvedTsConfigPath = resolve(tsConfigPath);

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

const resolveWithExtension = (exposedPath: string) => {
  const cwd = process.cwd();
  for (const extension of TS_EXTENSIONS) {
    const exposedPathWithExtension = join(cwd, `${exposedPath}.${extension}`);
    if (existsSync(exposedPathWithExtension)) {
      return exposedPathWithExtension;
    }
  }
  return undefined;
};

const resolveExposes = (remoteOptions: RemoteOptions) => {
  return Object.entries(
    remoteOptions.moduleFederationConfig.exposes as Record<string, string>,
  ).reduce(
    (accumulator, [exposedEntry, exposedPath]) => {
      accumulator[exposedEntry] =
        resolveWithExtension(exposedPath) ||
        resolveWithExtension(join(exposedPath, 'index')) ||
        exposedPath;
      return accumulator;
    },
    {} as Record<string, string>,
  );
};

export const retrieveRemoteConfig = (options: RemoteOptions) => {
  if (!options.moduleFederationConfig) {
    throw new Error('moduleFederationConfig is required');
  }

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
