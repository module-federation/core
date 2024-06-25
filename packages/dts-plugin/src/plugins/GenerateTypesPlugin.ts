import type { Compiler, WebpackPluginInstance } from 'webpack';
import fs from 'fs';
import { isDev } from './utils';
import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import {
  validateOptions,
  generateTypes,
  generateTypesInChildProcess,
  retrieveTypesAssetsInfo,
} from '../core/index';
import path from 'path';

export class GenerateTypesPlugin implements WebpackPluginInstance {
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  defaultOptions: moduleFederationPlugin.DtsRemoteOptions;

  constructor(
    pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
    dtsOptions: moduleFederationPlugin.PluginDtsOptions,
    defaultOptions: moduleFederationPlugin.DtsRemoteOptions,
  ) {
    this.pluginOptions = pluginOptions;
    this.dtsOptions = dtsOptions;
    this.defaultOptions = defaultOptions;
  }

  apply(compiler: Compiler) {
    const { dtsOptions, defaultOptions, pluginOptions } = this;

    const normalizedGenerateTypes =
      normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
        true,
        defaultOptions,
        'mfOptions.dts.generateTypes',
      )(dtsOptions.generateTypes);

    if (!normalizedGenerateTypes) {
      return;
    }

    const finalOptions = {
      remote: {
        implementation: dtsOptions.implementation,
        context: compiler.context,
        moduleFederationConfig: pluginOptions,
        ...normalizedGenerateTypes,
      },
      extraOptions: dtsOptions.extraOptions || {},
    };

    if (dtsOptions.tsConfigPath && !finalOptions.remote.tsConfigPath) {
      finalOptions.remote.tsConfigPath = dtsOptions.tsConfigPath;
    }

    validateOptions(finalOptions.remote);
    const isProd = !isDev();
    const getGenerateTypesFn = () => {
      let fn: typeof generateTypes | typeof generateTypesInChildProcess =
        generateTypes;
      let res: ReturnType<typeof generateTypes>;
      if (finalOptions.remote.compileInChildProcess) {
        fn = generateTypesInChildProcess;
      }
      if (isProd) {
        res = fn(finalOptions);
        return () => res;
      }
      return fn;
    };
    const generateTypesFn = getGenerateTypesFn();

    compiler.hooks.thisCompilation.tap('mf:generateTypes', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'mf:generateTypes',
          stage:
            // @ts-expect-error use runtime variable in case peer dep not installed
            compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          try {
            const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
              retrieveTypesAssetsInfo(finalOptions.remote);
            if (zipName && compilation.getAsset(zipName)) {
              return;
            }
            await generateTypesFn(finalOptions);
            const config = finalOptions.remote.moduleFederationConfig;
            let zipPrefix = '';
            const isManifestObject = typeof config.manifest === 'object';
            if (isManifestObject && config.manifest.filePath) {
              zipPrefix = config.manifest.filePath;
            } else if (isManifestObject && config.manifest.fileName) {
              zipPrefix = path.dirname(config.manifest.fileName);
            } else if (config.filename) {
              zipPrefix = path.dirname(config.filename);
            }

            if (zipTypesPath) {
              compilation.emitAsset(
                path.join(zipPrefix, zipName),
                new compiler.webpack.sources.RawSource(
                  fs.readFileSync(zipTypesPath),
                  false,
                ),
              );
            }

            if (apiTypesPath) {
              compilation.emitAsset(
                path.join(zipPrefix, apiFileName),
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
  }
}
