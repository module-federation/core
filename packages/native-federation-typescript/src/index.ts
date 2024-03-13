import { resolve } from 'path';
import { mergeDeepRight } from 'rambda';
import { createUnplugin } from 'unplugin';
import {
  consumeTypes,
  generateTypes,
  RemoteOptions,
  HostOptions,
  retrieveRemoteConfig,
  retrieveOriginalOutDir,
  retrieveHostConfig,
} from '@module-federation/dts-kit';

export const NativeFederationTypeScriptRemote = createUnplugin(
  (options: RemoteOptions) => {
    const { remoteOptions, tsConfig } = retrieveRemoteConfig(options);
    return {
      name: 'native-federation-typescript/remote',
      async writeBundle() {
        await generateTypes({ remote: options });
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: () => generateTypes({ remote: options }),
              watchChange: () => generateTypes({ remote: options }),
            };
      },
      webpack: (compiler) => {
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
      rspack: (compiler) => {
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
    retrieveHostConfig(options);

    return {
      name: 'native-federation-typescript/host',
      async writeBundle() {
        await consumeTypes({ host: options });
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: () => consumeTypes({ host: options }),
              watchChange: () => consumeTypes({ host: options }),
            };
      },
    };
  },
);
