import download from 'download';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Compiler } from 'webpack';

import {
  isObjectEmpty,
  Logger,
  LoggerInstance,
} from '@module-federation/utilities';

import { TypescriptCompiler } from '../lib/TypescriptCompiler';
import { normalizeOptions } from '../lib/normalizeOptions';
import { TypesCache } from '../lib/Caching';
import {
  CompilationParams,
  FederatedTypesPluginOptions,
  TypesStatsJson,
} from '../types';

import { FederatedTypesStatsPlugin } from './FederatedTypesStatsPlugin';

const PLUGIN_NAME = 'FederatedTypesPlugin';

export class FederatedTypesPlugin {
  private normalizeOptions!: ReturnType<typeof normalizeOptions>;
  private webpackCompilerOptions!: Compiler['options'];
  private logger!: LoggerInstance;

  constructor(private options: FederatedTypesPluginOptions) {}

  apply(compiler: Compiler) {
    const {
      disableDownloadingRemoteTypes = false,
      disableTypeCompilation = false,
    } = this.options;

    // Bail if both 'disableDownloadingRemoteTypes' & 'disableTypeCompilation' are 'truthy'
    if (disableDownloadingRemoteTypes && disableTypeCompilation) {
      return;
    }

    const { webpack } = compiler;

    this.logger = Logger.setLogger(
      compiler.getInfrastructureLogger(PLUGIN_NAME)
    );

    this.webpackCompilerOptions = compiler.options;

    this.normalizeOptions = normalizeOptions(this.options, compiler);

    const isMFPluginExists = this.webpackCompilerOptions.plugins.some(
      (plugin) => plugin.constructor.name === 'ModuleFederationPlugin'
    );

    if (isMFPluginExists) {
      throw new Error(
        `${PLUGIN_NAME} by default packs 'ModuleFederationPlugin' under the hood. Please remove 'ModuleFederation' Plugin from your configuration`
      );
    }

    const { context, watchOptions } =
      this.normalizeOptions.webpackCompilerOptions;

    const ignoredWatchOptions = watchOptions.ignored;

    const watchOptionsToIgnore = [
      path.join(
        context as string,
        this.normalizeOptions.typescriptFolderName,
        '**',
        '*'
      ),
    ];

    compiler.options.watchOptions.ignored = Array.isArray(ignoredWatchOptions)
      ? [...ignoredWatchOptions, ...watchOptionsToIgnore]
      : watchOptionsToIgnore;

    if (!disableDownloadingRemoteTypes) {
      compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, async (_, callback) => {
        this.logger.log('Preparing to download types from remotes on startup');
        await this.importRemoteTypes(callback);
      });

      compiler.hooks.watchRun.tapAsync(PLUGIN_NAME, async (_, callback) => {
        this.logger.log('Preparing to download types from remotes');
        await this.importRemoteTypes(callback);
      });
    }

    if (!disableTypeCompilation) {
      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (_, params) => {
        this.logger.log('Preparing to Generate types');

        const filesMap = this.compileTypes();

        (params as CompilationParams).federated_types = filesMap;
      });

      new FederatedTypesStatsPlugin(this.normalizeOptions).apply(compiler);
    }

    new webpack.container.ModuleFederationPlugin(
      this.options.federationConfig
    ).apply(compiler);
  }

  private compileTypes() {
    const exposedComponents = this.options.federationConfig.exposes;

    if (!exposedComponents) {
      return {};
    }

    // './Component': 'path/to/component' -> ['./Component', 'path/to/component']
    const compiler = new TypescriptCompiler(this.normalizeOptions);

    try {
      return compiler.generateDeclarationFiles(
        exposedComponents,
        this.options.additionalFilesToCompile
      );
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async importRemoteTypes(callback: any) {
    const remoteComponents = this.options.federationConfig.remotes;

    if (
      !remoteComponents ||
      (remoteComponents && isObjectEmpty(remoteComponents))
    ) {
      this.logger.log('No Remote components configured');
      return callback();
    }

    this.logger.log('Normalizing remote URLs');
    const remoteUrls = Object.entries(remoteComponents).map(
      ([remote, entry]) => {
        const remoteUrl = entry.substring(0, entry.lastIndexOf('/'));
        const [, url] = remoteUrl.split('@');

        return {
          origin: url ?? remoteUrl,
          remote,
        };
      }
    );

    remoteUrls.forEach(async ({ origin, remote }) => {
      const { typescriptFolderName } = this.normalizeOptions;

      try {
        this.logger.log(`Getting types index for remote '${remote}'`);
        const resp = await axios.get<TypesStatsJson>(
          `${origin}/${this.normalizeOptions.typesIndexJsonFileName}`
        );

        const statsJson = resp.data;

        this.logger.log(`Checking with Cache entries`);
        const { filesToCacheBust, filesToDelete } =
          TypesCache.getCacheBustedFiles(remote, statsJson);

        this.logger.log('filesToCacheBust', filesToCacheBust);
        this.logger.log('filesToDelete', filesToDelete);

        if (filesToDelete.length > 0) {
          filesToDelete.forEach((file) => {
            fs.unlinkSync(
              path.resolve(
                this.normalizeOptions.webpackCompilerOptions.context as string,
                typescriptFolderName,
                remote,
                file
              )
            );
          });
        }

        if (filesToCacheBust.length > 0) {
          await Promise.all(
            filesToCacheBust.map((file) => {
              const url = `${origin}/${typescriptFolderName}/${file}`;
              const destination = path.join(
                this.normalizeOptions.webpackCompilerOptions.context as string,
                typescriptFolderName,
                remote
              );

              this.logger.log('Downloading types...');
              return download(url, destination, {
                filename: file,
              });
            })
          );

          this.logger.log('downloading complete');
        }
        callback();
      } catch (error) {
        callback(error);
      }
    });
  }
}
