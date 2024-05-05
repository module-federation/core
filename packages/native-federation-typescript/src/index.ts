import ansiColors from 'ansi-colors';
import { resolve } from 'node:path';
import { mergeDeepRight } from 'rambda';
import { UnpluginOptions, createUnplugin } from 'unplugin';

import { retrieveHostConfig } from './configurations/hostPlugin';
import { retrieveRemoteConfig } from './configurations/remotePlugin';
import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';
import {
  createTypesArchive,
  deleteTypesFolder,
  downloadTypesArchive,
} from './lib/archiveHandler';
import {
  compileTs,
  retrieveMfTypesPath,
  retrieveOriginalOutDir,
} from './lib/typeScriptCompiler';

export const NativeFederationTypeScriptRemote = createUnplugin(
  (options: RemoteOptions) => {
    const { remoteOptions, tsConfig, mapComponentsToExpose } =
      retrieveRemoteConfig(options);
    const typesPath = retrieveMfTypesPath(tsConfig, remoteOptions);
    return {
      name: 'native-federation-typescript/remote',
      async writeBundle() {
        try {
          compileTs(mapComponentsToExpose, tsConfig, remoteOptions);

          await createTypesArchive(tsConfig, remoteOptions);

          await deleteTypesFolder(remoteOptions, typesPath);

          console.log(ansiColors.green('Federated types created correctly'));
        } catch (error) {
          console.error(
            ansiColors.red(`Unable to compile federated types, ${error}`),
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
              directory: resolve(
                retrieveOriginalOutDir(tsConfig, remoteOptions),
              ),
            },
          },
        );
      },
      rspack(compiler) {
        compiler.options.devServer = mergeDeepRight(
          compiler.options.devServer || {},
          {
            static: {
              directory: resolve(
                retrieveOriginalOutDir(tsConfig, remoteOptions),
              ),
            },
          },
        );
      },
    };
  },
);

export const NativeFederationTypeScriptHost = createUnplugin(
  (options: HostOptions) => {
    const { hostOptions, mapRemotesToDownload } = retrieveHostConfig(options);
    const typesDownloader = downloadTypesArchive(hostOptions);
    return {
      name: 'native-federation-typescript/host',
      async writeBundle() {
        const downloadPromises =
          Object.entries(mapRemotesToDownload).map(typesDownloader);

        await Promise.allSettled(downloadPromises);
        console.log(ansiColors.green('Federated types extraction completed'));
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
