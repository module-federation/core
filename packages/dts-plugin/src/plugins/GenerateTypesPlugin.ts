import type { Compiler, WebpackPluginInstance } from 'webpack';
import fs from 'fs';
import path from 'path';
import { isDev, getCompilerOutputDir } from './utils';
import {
  normalizeOptions,
  type moduleFederationPlugin,
} from '@module-federation/sdk';
import {
  validateOptions,
  generateTypes,
  generateTypesInChildProcess,
  retrieveTypesAssetsInfo,
  type DTSManagerOptions,
} from '../core/index';

export class GenerateTypesPlugin implements WebpackPluginInstance {
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  defaultOptions: moduleFederationPlugin.DtsRemoteOptions;
  consumeTypesPromise: Promise<void>;
  callback: () => void;

  constructor(
    pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
    dtsOptions: moduleFederationPlugin.PluginDtsOptions,
    defaultOptions: moduleFederationPlugin.DtsRemoteOptions,
    consumeTypesPromise: Promise<void>,
    callback: () => void,
  ) {
    this.pluginOptions = pluginOptions;
    this.dtsOptions = dtsOptions;
    this.defaultOptions = defaultOptions;
    this.consumeTypesPromise = consumeTypesPromise;
    this.callback = callback;
  }

  apply(compiler: Compiler) {
    const {
      dtsOptions,
      defaultOptions,
      pluginOptions,
      consumeTypesPromise,
      callback,
    } = this;

    const normalizedGenerateTypes =
      normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
        true,
        defaultOptions,
        'mfOptions.dts.generateTypes',
      )(dtsOptions.generateTypes);

    if (!normalizedGenerateTypes) {
      callback();
      return;
    }

    const finalOptions: DTSManagerOptions = {
      remote: {
        implementation: dtsOptions.implementation,
        context: compiler.context,
        outputDir: getCompilerOutputDir(compiler),
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
    let compiledOnce = false;

    compiler.hooks.thisCompilation.tap('mf:generateTypes', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'mf:generateTypes',
          stage:
            // @ts-expect-error use runtime variable in case peer dep not installed
            compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          await consumeTypesPromise;
          try {
            if (pluginOptions.dev === false && compiledOnce) {
              return;
            }

            if (compiledOnce) {
              return;
            }

            const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
              retrieveTypesAssetsInfo(finalOptions.remote);
            if (zipName && compilation.getAsset(zipName)) {
              return;
            }

            await generateTypesFn(finalOptions);
            const config = finalOptions.remote.moduleFederationConfig;
            let zipPrefix = '';
            if (
              typeof config.manifest === 'object' &&
              config.manifest.filePath
            ) {
              zipPrefix = config.manifest.filePath;
            } else if (
              typeof config.manifest === 'object' &&
              config.manifest.fileName
            ) {
              zipPrefix = path.dirname(config.manifest.fileName);
            } else if (config.filename) {
              zipPrefix = path.dirname(config.filename);
            }

            const zipAssetName = path.join(zipPrefix, zipName);
            if (zipTypesPath && !compilation.getAsset(zipAssetName)) {
              compilation.emitAsset(
                path.join(zipPrefix, zipName),
                new compiler.webpack.sources.RawSource(
                  fs.readFileSync(zipTypesPath),
                  false,
                ),
              );
            }

            const apiAssetName = path.join(zipPrefix, apiFileName);
            if (apiTypesPath && !compilation.getAsset(apiAssetName)) {
              compilation.emitAsset(
                path.join(zipPrefix, apiFileName),
                new compiler.webpack.sources.RawSource(
                  fs.readFileSync(apiTypesPath),
                  false,
                ),
              );
            }
            compiledOnce = true;
            callback();
          } catch (err) {
            callback();
            console.error('Error in mf:generateTypes processAssets hook:', err);
          }
        },
      );
    });
  }
}
