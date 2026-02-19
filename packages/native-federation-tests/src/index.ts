import ansiColors from 'ansi-colors';
import { resolve } from 'path';
import { mergeDeepRight, mergeRight } from 'rambda';
import { build } from 'tsup';
import { UnpluginOptions, createUnplugin } from 'unplugin';

import { retrieveHostConfig } from './configurations/hostPlugin';
import { retrieveRemoteConfig } from './configurations/remotePlugin';
import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';
import {
  createTestsArchive,
  deleteTestsFolder,
  downloadTypesArchive,
} from './lib/archiveHandler';

export const NativeFederationTestsRemote = createUnplugin(
  (options: RemoteOptions) => {
    const {
      remoteOptions,
      compiledFilesFolder,
      externalDeps,
      mapComponentsToExpose,
    } = retrieveRemoteConfig(options);
    return {
      name: 'native-federation-tests/remote',
      async writeBundle() {
        const buildConfig = mergeRight(remoteOptions.additionalBundlerConfig, {
          external: externalDeps.map(
            (externalDep) => new RegExp(`^${externalDep}`),
          ),
          entry: mapComponentsToExpose,
          outDir: compiledFilesFolder,
          silent: true,
        });

        try {
          await build(buildConfig);

          await createTestsArchive(remoteOptions, compiledFilesFolder);

          await deleteTestsFolder(remoteOptions, compiledFilesFolder);

          console.log(ansiColors.green('Federated mocks created correctly'));
        } catch (error) {
          console.error(
            ansiColors.red(`Unable to build federated mocks: ${error}`),
          );
        }
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: (this as UnpluginOptions).writeBundle,
              watchChange: (this as UnpluginOptions).writeBundle,
            };
      },
      webpack(compiler) {
        compiler.options.devServer = mergeDeepRight(
          compiler.options.devServer || {},
          {
            static: {
              directory: resolve(remoteOptions.distFolder),
            },
          },
        );
      },
      rspack(compiler) {
        compiler.options.devServer = mergeDeepRight(
          compiler.options.devServer || {},
          {
            static: {
              directory: resolve(remoteOptions.distFolder),
            },
          },
        );
      },
    };
  },
);

export const NativeFederationTestsHost = createUnplugin(
  (options: HostOptions) => {
    const { hostOptions, mapRemotesToDownload } = retrieveHostConfig(options);
    const typesDownloader = downloadTypesArchive(hostOptions);
    return {
      name: 'native-federation-tests/host',
      async writeBundle() {
        const downloadPromises =
          Object.entries(mapRemotesToDownload).map(typesDownloader);

        await Promise.allSettled(downloadPromises);
        console.log(ansiColors.green('Federated mocks extraction completed'));
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: (this as UnpluginOptions).writeBundle,
              watchChange: (this as UnpluginOptions).writeBundle,
            };
      },
    };
  },
);
