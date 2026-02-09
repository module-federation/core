import { Compiler, WebpackPluginInstance } from 'webpack';
import {
  bindLoggerToCompiler,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { ManifestManager } from './ManifestManager';
import { StatsManager } from './StatsManager';
import { PLUGIN_IDENTIFIER } from './constants';
import logger from './logger';

export class StatsPlugin implements WebpackPluginInstance {
  readonly name = 'StatsPlugin';
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions = {};
  private _statsManager: StatsManager = new StatsManager();
  private _manifestManager: ManifestManager = new ManifestManager();
  private _enable: boolean = true;
  private _bundler: 'webpack' | 'rspack' = 'webpack';

  constructor(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
    {
      pluginVersion,
      bundler,
    }: { pluginVersion: string; bundler: 'webpack' | 'rspack' },
  ) {
    try {
      this._options = options;
      this._bundler = bundler;
      this._statsManager.init(this._options, { pluginVersion, bundler });
      this._manifestManager.init(this._options);
    } catch (err) {
      if (err instanceof Error) {
        err.message = `[ ${PLUGIN_IDENTIFIER} ]: Manifest will not generate, because: ${err.message}`;
      }
      logger.error(err);
      this._enable = false;
    }
  }

  apply(compiler: Compiler): void {
    bindLoggerToCompiler(logger, compiler, PLUGIN_IDENTIFIER);
    if (!this._enable) {
      return;
    }
    const res = this._statsManager.validate(compiler);

    if (!res) {
      return;
    }
    compiler.hooks.thisCompilation.tap('generateStats', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'generateStats',
          // @ts-ignore use runtime variable in case peer dep not installed
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          if (this._options.manifest !== false) {
            const existedStats = compilation.getAsset(
              this._statsManager.fileName,
            );
            // new rspack should hit
            if (existedStats) {
              let updatedStats = this._statsManager.updateStats(
                JSON.parse(existedStats.source.source().toString()),
                compiler,
              );
              if (
                typeof this._options.manifest === 'object' &&
                this._options.manifest.additionalData
              ) {
                updatedStats =
                  (await this._options.manifest.additionalData({
                    stats: updatedStats,
                    compiler,
                    compilation,
                    bundler: this._bundler,
                  })) || updatedStats;
              }

              const webpackSources =
                compiler.webpack?.sources ||
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                require('webpack').sources;
              compilation.updateAsset(
                this._statsManager.fileName,
                new webpackSources.RawSource(
                  JSON.stringify(updatedStats, null, 2),
                ),
              );
              const updatedManifest = this._manifestManager.updateManifest({
                compilation,
                stats: updatedStats,
                publicPath: this._statsManager.getPublicPath(compiler),
                compiler,
                bundler: this._bundler,
              });
              const source = new webpackSources.RawSource(
                JSON.stringify(updatedManifest, null, 2),
              );
              compilation.updateAsset(this._manifestManager.fileName, source);

              return;
            }

            // webpack + legacy rspack
            let stats = await this._statsManager.generateStats(
              compiler,
              compilation,
            );

            if (
              typeof this._options.manifest === 'object' &&
              this._options.manifest.additionalData
            ) {
              stats =
                (await this._options.manifest.additionalData({
                  stats,
                  compiler,
                  compilation,
                  bundler: this._bundler,
                })) || stats;
            }

            const manifest = await this._manifestManager.generateManifest({
              compilation,
              stats: stats,
              publicPath: this._statsManager.getPublicPath(compiler),
              compiler,
              bundler: this._bundler,
            });

            const webpackSources =
              compiler.webpack?.sources ||
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              require('webpack').sources;
            compilation.emitAsset(
              this._statsManager.fileName,
              new webpackSources.RawSource(JSON.stringify(stats, null, 2)),
            );
            compilation.emitAsset(
              this._manifestManager.fileName,
              new webpackSources.RawSource(JSON.stringify(manifest, null, 2)),
            );
          }
        },
      );
    });
  }
}
