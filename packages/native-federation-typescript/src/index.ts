import { createUnplugin } from 'unplugin';
import fs from 'fs';
import {
  consumeTypes,
  generateTypes,
  generateTypesInChildProcess,
  RemoteOptions,
  HostOptions,
  validateOptions,
  retrieveTypesAssetsInfo,
} from '@module-federation/dts-kit';

export type EnhancedRemoteOptions =
  | {
      remote: RemoteOptions;
      extraOptions: Record<string, any>;
    }
  | RemoteOptions;

export type EnhancedHostOptions =
  | {
      host: HostOptions;
      extraOptions: Record<string, any>;
    }
  | HostOptions;

export const NativeFederationTypeScriptRemote = createUnplugin(
  (enhancedOptions: EnhancedRemoteOptions) => {
    const options =
      'extraOptions' in enhancedOptions
        ? enhancedOptions.remote
        : enhancedOptions;
    const extraOptions =
      'extraOptions' in enhancedOptions
        ? enhancedOptions.extraOptions
        : undefined;

    validateOptions(options);
    const isProd = process.env.NODE_ENV === 'production';
    const generateTypesOptions = {
      remote: options,
      extraOptions,
    };
    const getGenerateTypesFn = () => {
      let fn: typeof generateTypes | typeof generateTypesInChildProcess =
        generateTypes;
      let res: ReturnType<typeof generateTypes>;
      if (options.compileInChildProcess) {
        fn = generateTypesInChildProcess;
      }
      if (isProd) {
        res = fn(generateTypesOptions);
        return () => res;
      }
      return fn;
    };
    const generateTypesFn = getGenerateTypesFn();
    return {
      name: 'native-federation-typescript/remote',
      rollup: {
        writeBundle: async () => {
          await generateTypesFn(generateTypesOptions);
        },
      },
      vite: {
        buildStart: async () => {
          if (isProd) {
            return;
          }
          await generateTypesFn(generateTypesOptions);
        },
        watchChange: async () => {
          if (isProd) {
            return;
          }
          await generateTypesFn(generateTypesOptions);
        },
        writeBundle: async () => {
          await generateTypesFn(generateTypesOptions);
        },
      },
      webpack: (compiler) => {
        compiler.hooks.thisCompilation.tap('generateTypes', (compilation) => {
          const hookName = 'mf:generateTypes';
          if (
            compilation.hooks.processAssets.taps.find(
              (t) => t.name === hookName,
            )
          ) {
            return;
          }
          compilation.hooks.processAssets.tapPromise(
            {
              name: hookName,
              stage:
                // @ts-expect-error use runtime variable in case peer dep not installed
                compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
            },
            async () => {
              try {
                await generateTypesFn(generateTypesOptions);
                const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
                  retrieveTypesAssetsInfo(options);
                if (zipTypesPath) {
                  compilation.emitAsset(
                    zipName,
                    new compiler.webpack.sources.RawSource(
                      fs.readFileSync(zipTypesPath),
                      false,
                    ),
                  );
                }

                if (apiTypesPath) {
                  compilation.emitAsset(
                    apiFileName,
                    new compiler.webpack.sources.RawSource(
                      fs.readFileSync(apiTypesPath),
                      false,
                    ),
                  );
                }
              } catch (err) {
                console.error(err);
              }
            },
          );
        });
      },
      rspack: (compiler) => {
        compiler.hooks.thisCompilation.tap('generateTypes', (compilation) => {
          const hookName = 'mf:generateTypes';
          // @ts-expect-error rspack is the same as webpack
          if (
            compilation.hooks.processAssets.taps.find(
              (t) => t.name === hookName,
            )
          ) {
            return;
          }
          compilation.hooks.processAssets.tapPromise(
            {
              name: hookName,
              stage:
                // @ts-expect-error use runtime variable in case peer dep not installed
                compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
            },
            async () => {
              try {
                await generateTypesFn(generateTypesOptions);
                const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
                  retrieveTypesAssetsInfo(options);
                if (zipTypesPath) {
                  compilation.emitAsset(
                    zipName,
                    new compiler.webpack.sources.RawSource(
                      fs.readFileSync(zipTypesPath),
                      false,
                    ),
                  );
                }

                if (apiTypesPath) {
                  compilation.emitAsset(
                    apiFileName,
                    new compiler.webpack.sources.RawSource(
                      fs.readFileSync(apiTypesPath),
                      false,
                    ),
                  );
                }
              } catch (err) {
                console.error(err);
              }
            },
          );
        });
      },
    };
  },
);

export const NativeFederationTypeScriptHost = createUnplugin(
  (enhancedOptions: EnhancedHostOptions) => {
    const options =
      'extraOptions' in enhancedOptions
        ? enhancedOptions.host
        : enhancedOptions;
    const extraOptions =
      'extraOptions' in enhancedOptions
        ? enhancedOptions.extraOptions
        : undefined;

    validateOptions(options);
    const consumeTypesOptions = {
      host: options,
      extraOptions,
    };
    const consumeTypesPromise = consumeTypes(consumeTypesOptions);
    return {
      name: 'native-federation-typescript/host',
      async writeBundle() {
        await consumeTypesPromise;
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: async () => {
                await consumeTypesPromise;
              },
            };
      },
    };
  },
);
