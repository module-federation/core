import path from 'path';
import { createUnplugin } from 'unplugin';
import fs from 'fs';
import {
  consumeTypes,
  generateTypes,
  RemoteOptions,
  HostOptions,
  validateOptions,
} from '@module-federation/dts-kit';

export const NativeFederationTypeScriptRemote = createUnplugin(
  (options: RemoteOptions) => {
    validateOptions(options);
    return {
      name: 'native-federation-typescript/remote',
      rollup: {
        writeBundle: async () => {
          await generateTypes({ remote: options });
        },
      },
      vite: {
        buildStart: async () => {
          if (process.env.NODE_ENV === 'production') {
            return;
          }
          await generateTypes({ remote: options });
        },
        watchChange: async () => {
          if (process.env.NODE_ENV === 'production') {
            return;
          }
          await generateTypes({ remote: options });
        },
        writeBundle: async () => {
          await generateTypes({ remote: options });
        },
      },
      webpack: (compiler) => {
        compiler.hooks.thisCompilation.tap('generateTypes', (compilation) => {
          compilation.hooks.processAssets.tapPromise(
            {
              name: 'generateTypes',
              stage:
                // @ts-expect-error use runtime variable in case peer dep not installed
                compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
            },
            async () => {
              const { zipTypesPath, apiTypesPath } = await generateTypes({
                remote: options,
              });
              const zipName = path.basename(zipTypesPath);
              compilation.emitAsset(
                zipName,
                new compiler.webpack.sources.RawSource(
                  fs.readFileSync(zipTypesPath),
                  false,
                ),
              );

              if (apiTypesPath) {
                const apiFileName = path.basename(apiTypesPath);
                compilation.emitAsset(
                  apiFileName,
                  new compiler.webpack.sources.RawSource(
                    fs.readFileSync(apiTypesPath),
                    false,
                  ),
                );
              }
            },
          );
        });
      },
      rspack: (compiler) => {
        compiler.hooks.thisCompilation.tap('generateTypes', (compilation) => {
          compilation.hooks.processAssets.tapPromise(
            {
              name: 'generateTypes',
              stage:
                // @ts-expect-error use runtime variable in case peer dep not installed
                compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
            },
            async () => {
              const { zipTypesPath, apiTypesPath } = await generateTypes({
                remote: options,
              });
              const zipName = path.basename(zipTypesPath);
              compilation.emitAsset(
                zipName,
                new compiler.webpack.sources.RawSource(
                  fs.readFileSync(zipTypesPath),
                  false,
                ),
              );

              if (apiTypesPath) {
                const apiFileName = path.basename(apiTypesPath);
                compilation.emitAsset(
                  apiFileName,
                  new compiler.webpack.sources.RawSource(
                    fs.readFileSync(apiTypesPath),
                    false,
                  ),
                );
              }
            },
          );
        });
      },
    };
  },
);

export const NativeFederationTypeScriptHost = createUnplugin(
  (options: HostOptions) => {
    validateOptions(options);
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
