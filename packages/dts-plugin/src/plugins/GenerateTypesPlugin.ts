import fs from 'fs';
import path from 'path';
import { isDev, getCompilerOutputDir } from './utils';
import {
  logger,
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

import type { Compilation, Compiler, WebpackPluginInstance } from 'webpack';

export const DEFAULT_GENERATE_TYPES = {
  generateAPITypes: true,
  compileInChildProcess: true,
  abortOnError: false,
  extractThirdParty: false,
  extractRemoteTypes: false,
};

export const normalizeGenerateTypesOptions = ({
  context,
  outputDir,
  dtsOptions,
  pluginOptions,
}: {
  context?: string;
  outputDir?: string;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
}) => {
  const normalizedGenerateTypes =
    normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
      true,
      DEFAULT_GENERATE_TYPES,
      'mfOptions.dts.generateTypes',
    )(dtsOptions.generateTypes);

  if (!normalizedGenerateTypes) {
    return;
  }

  const normalizedConsumeTypes =
    normalizeOptions<moduleFederationPlugin.DtsHostOptions>(
      true,
      {},
      'mfOptions.dts.consumeTypes',
    )(dtsOptions.consumeTypes);

  const finalOptions: DTSManagerOptions = {
    remote: {
      implementation: dtsOptions.implementation,
      context,
      outputDir,
      moduleFederationConfig: pluginOptions,
      ...normalizedGenerateTypes,
    },
    host:
      normalizedConsumeTypes === false
        ? undefined
        : {
            context,
            moduleFederationConfig: pluginOptions,
            ...normalizedGenerateTypes,
          },
    extraOptions: dtsOptions.extraOptions || {},
    displayErrorInTerminal: dtsOptions.displayErrorInTerminal,
  };

  if (dtsOptions.tsConfigPath && !finalOptions.remote.tsConfigPath) {
    finalOptions.remote.tsConfigPath = dtsOptions.tsConfigPath;
  }

  validateOptions(finalOptions.remote);

  return finalOptions;
};

const getGenerateTypesFn = (dtsManagerOptions: DTSManagerOptions) => {
  let fn: typeof generateTypes | typeof generateTypesInChildProcess =
    generateTypes;
  if (dtsManagerOptions.remote.compileInChildProcess) {
    fn = generateTypesInChildProcess;
  }
  return fn;
};

export const generateTypesAPI = ({
  dtsManagerOptions,
}: {
  dtsManagerOptions: DTSManagerOptions;
}) => {
  const fn = getGenerateTypesFn(dtsManagerOptions);
  return fn(dtsManagerOptions);
};

export class GenerateTypesPlugin implements WebpackPluginInstance {
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  fetchRemoteTypeUrlsPromise: Promise<
    moduleFederationPlugin.DtsHostOptions['remoteTypeUrls'] | undefined
  >;
  callback: () => void;

  constructor(
    pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
    dtsOptions: moduleFederationPlugin.PluginDtsOptions,
    fetchRemoteTypeUrlsPromise: Promise<
      moduleFederationPlugin.DtsHostOptions['remoteTypeUrls'] | undefined
    >,
    callback: () => void,
  ) {
    this.pluginOptions = pluginOptions;
    this.dtsOptions = dtsOptions;
    this.fetchRemoteTypeUrlsPromise = fetchRemoteTypeUrlsPromise;
    this.callback = callback;
  }

  apply(compiler: Compiler) {
    const { dtsOptions, pluginOptions, fetchRemoteTypeUrlsPromise, callback } =
      this;

    const outputDir = getCompilerOutputDir(compiler);
    const context = compiler.context;

    const dtsManagerOptions = normalizeGenerateTypesOptions({
      context,
      outputDir,
      dtsOptions,
      pluginOptions,
    });

    if (!dtsManagerOptions) {
      callback();
      return;
    }

    const isProd = !isDev();

    const emitTypesFiles = async (compilation: Compilation) => {
      // Dev types will be generated by DevPlugin, the archive filename usually is dist/.dev-server.zip
      try {
        const { zipTypesPath, apiTypesPath, zipName, apiFileName } =
          retrieveTypesAssetsInfo(dtsManagerOptions.remote);

        if (isProd && zipName && compilation.getAsset(zipName)) {
          callback();
          return;
        }

        logger.debug('start generating types...');
        await generateTypesAPI({ dtsManagerOptions });
        logger.debug('generate types success!');
        const config = dtsManagerOptions.remote.moduleFederationConfig;
        let zipPrefix = '';
        if (typeof config.manifest === 'object' && config.manifest.filePath) {
          zipPrefix = config.manifest.filePath;
        } else if (
          typeof config.manifest === 'object' &&
          config.manifest.fileName
        ) {
          zipPrefix = path.dirname(config.manifest.fileName);
        } else if (config.filename) {
          zipPrefix = path.dirname(config.filename);
        }

        if (isProd) {
          const zipAssetName = path.join(zipPrefix, zipName);
          const apiAssetName = path.join(zipPrefix, apiFileName);
          if (zipTypesPath && !compilation.getAsset(zipAssetName)) {
            compilation.emitAsset(
              zipAssetName,
              new compiler.webpack.sources.RawSource(
                fs.readFileSync(zipTypesPath),
                false,
              ),
            );
          }

          if (apiTypesPath && !compilation.getAsset(apiAssetName)) {
            compilation.emitAsset(
              apiAssetName,
              new compiler.webpack.sources.RawSource(
                fs.readFileSync(apiTypesPath),
                false,
              ),
            );
          }
          callback();
        } else {
          const isEEXIST = (err: NodeJS.ErrnoException) => {
            return err.code == 'EEXIST';
          };
          if (zipTypesPath) {
            const zipContent = fs.readFileSync(zipTypesPath);
            const zipOutputPath = path.join(
              compiler.outputPath,
              zipPrefix,
              zipName,
            );
            await new Promise<void>((resolve, reject) => {
              compiler.outputFileSystem.mkdir(
                path.dirname(zipOutputPath),
                {
                  recursive: true,
                },
                // @ts-ignore  type fixed in  https://github.com/webpack/webpack/releases/tag/v5.91.0
                (err) => {
                  if (err && !isEEXIST(err)) {
                    reject(err);
                  } else {
                    compiler.outputFileSystem.writeFile(
                      zipOutputPath,
                      // @ts-ignore
                      zipContent,
                      (writeErr) => {
                        if (writeErr && !isEEXIST(writeErr)) {
                          reject(writeErr);
                        } else {
                          resolve();
                        }
                      },
                    );
                  }
                },
              );
            });
          }

          if (apiTypesPath) {
            const apiContent = fs.readFileSync(apiTypesPath);
            const apiOutputPath = path.join(
              compiler.outputPath,
              zipPrefix,
              apiFileName,
            );
            await new Promise<void>((resolve, reject) => {
              compiler.outputFileSystem.mkdir(
                path.dirname(apiOutputPath),
                {
                  recursive: true,
                },
                // @ts-ignore  type fixed in  https://github.com/webpack/webpack/releases/tag/v5.91.0
                (err) => {
                  if (err && !isEEXIST(err)) {
                    reject(err);
                  } else {
                    compiler.outputFileSystem.writeFile(
                      apiOutputPath,
                      // @ts-ignore
                      apiContent,
                      (writeErr) => {
                        if (writeErr && !isEEXIST(writeErr)) {
                          reject(writeErr);
                        } else {
                          resolve();
                        }
                      },
                    );
                  }
                },
              );
            });
          }

          callback();
        }
      } catch (err) {
        callback();
        if (dtsManagerOptions.displayErrorInTerminal) {
          console.error(err);
        }
        logger.debug('generate types fail!');
      }
    };

    compiler.hooks.thisCompilation.tap('mf:generateTypes', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'mf:generateTypes',
          stage:
            // @ts-expect-error use runtime variable in case peer dep not installed
            compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          await fetchRemoteTypeUrlsPromise;
          const emitTypesFilesPromise = emitTypesFiles(compilation);
          if (isProd) {
            await emitTypesFilesPromise;
          }
        },
      );
    });
  }
}
