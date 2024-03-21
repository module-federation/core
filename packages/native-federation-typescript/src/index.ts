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

export const NativeFederationTypeScriptRemote = createUnplugin(
  (options: RemoteOptions) => {
    validateOptions(options);
    const isProd = process.env.NODE_ENV === 'production';

    const getGenerateTypesFn = () => {
      let fn: typeof generateTypes | typeof generateTypesInChildProcess =
        generateTypes;
      let res: ReturnType<typeof generateTypes>;
      if (options.compileInChildProcess) {
        fn = generateTypesInChildProcess;
      }
      if (isProd) {
        res = fn({ remote: options });
        return () => res;
      }
      return fn;
    };
    const generateTypesFn = getGenerateTypesFn();
    return {
      name: 'native-federation-typescript/remote',
      rollup: {
        writeBundle: async () => {
          await generateTypesFn({ remote: options });
        },
      },
      vite: {
        buildStart: async () => {
          if (isProd) {
            return;
          }
          await generateTypesFn({ remote: options });
        },
        watchChange: async () => {
          if (isProd) {
            return;
          }
          await generateTypesFn({ remote: options });
        },
        writeBundle: async () => {
          await generateTypesFn({ remote: options });
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
              try {
                await generateTypesFn({
                  remote: options,
                });
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
          compilation.hooks.processAssets.tapPromise(
            {
              name: 'generateTypes',
              stage:
                // @ts-expect-error use runtime variable in case peer dep not installed
                compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
            },
            async () => {
              try {
                await generateTypesFn({
                  remote: options,
                });
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
  (options: HostOptions) => {
    validateOptions(options);
    const consumeTypesPromise = consumeTypes({ host: options });
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
