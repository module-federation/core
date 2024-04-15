import ansiColors from 'ansi-colors';
import { resolve } from 'path';
import { mergeDeepRight } from 'rambda';
import { UnpluginOptions, createUnplugin } from 'unplugin';

import { retrieveHostConfig } from './configurations/hostPlugin';
import { retrieveRemoteConfig } from './configurations/remotePlugin';
import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';
import { retrieveOriginalOutDir } from './lib/typeScriptCompiler';
// @ts-expect-error function exported through module.exports
import remoteWriteBundle from './lib/writeBundle/remote';
// @ts-expect-error function exported through module.exports
import hostWriteBundle from './lib/writeBundle/host';

export const NativeFederationTypeScriptRemote = createUnplugin(
  (options: RemoteOptions) => {
    const remoteConfig = retrieveRemoteConfig(options);
    const { remoteOptions, tsConfig } = remoteConfig
    return {
      name: 'native-federation-typescript/remote',
      async writeBundle() {
        try {
          await remoteWriteBundle(remoteConfig)

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
    const hostConfig = retrieveHostConfig(options);
    return {
      name: 'native-federation-typescript/host',
      async writeBundle() {
        await hostWriteBundle(hostConfig);

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
