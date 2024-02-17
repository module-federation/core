import { existsSync } from 'fs';
import { join } from 'path';

import { RemoteOptions } from '../interfaces/RemoteOptions';

const defaultOptions = {
  testsFolder: '@mf-tests',
  distFolder: './dist',
  deleteTestsFolder: true,
  additionalBundlerConfig: {},
} satisfies Partial<RemoteOptions>;

const EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs'];

const resolveWithExtension = (exposedPath: string) => {
  const cwd = process.cwd();
  for (const extension of EXTENSIONS) {
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
  const externalDeps = Object.keys(
    options.moduleFederationConfig.shared || {},
  ).concat(Object.keys(options.moduleFederationConfig.remotes || {}));
  const compiledFilesFolder = join(
    remoteOptions.distFolder,
    remoteOptions.testsFolder,
  );

  return {
    remoteOptions,
    externalDeps,
    compiledFilesFolder,
    mapComponentsToExpose,
  };
};
