import { resolve } from 'path';
import { mergeDeepRight } from 'rambda';
import { createUnplugin } from 'unplugin';
import {
  RemoteOptions,
  HostOptions,
  retrieveRemoteConfig,
  getDTSManagerConstructor,
  retrieveOriginalOutDir,
} from '@module-federation/dts-kit';

export const NativeFederationTypeScriptRemote = createUnplugin(
  (options: RemoteOptions) => {
    const DTSManagerConstructor = getDTSManagerConstructor(
      options.implementation,
    );
    const dtsManager = new DTSManagerConstructor({ remote: options });
    const { remoteOptions, tsConfig } = retrieveRemoteConfig(options);
    return {
      name: 'native-federation-typescript/remote',
      async writeBundle() {
        await dtsManager.generateTypes();
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: dtsManager.generateTypes,
              watchChange: dtsManager.generateTypes,
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
    const DTSManagerConstructor = getDTSManagerConstructor(
      options.implementation,
    );
    const dtsManager = new DTSManagerConstructor({ host: options });
    return {
      name: 'native-federation-typescript/host',
      async writeBundle() {
        await dtsManager.consumeTypes();
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: dtsManager.consumeTypes,
              watchChange: dtsManager.consumeTypes,
            };
      },
    };
  },
);
