import { Compiler, WebpackPluginInstance } from 'webpack';
import {
  bindLoggerToCompiler,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { ManifestManager } from './ManifestManager';
import { StatsManager } from './StatsManager';
import { PLUGIN_IDENTIFIER } from './constants';
import logger from './logger';
import { StatsInfo, ManifestInfo, ResourceInfo } from './types';

export class StatsPlugin implements WebpackPluginInstance {
  readonly name = 'StatsPlugin';
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions = {};
  private _statsManager: StatsManager = new StatsManager();
  private _manifestManager: ManifestManager = new ManifestManager();
  private _enable: boolean = true;
  private _bundler: 'webpack' | 'rspack' = 'webpack';
  statsInfo?: StatsInfo;
  manifestInfo?: ManifestInfo;

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
            console.log('existedStats: ', existedStats);
            if (existedStats) {
              const xxx = existedStats.source.source().toString();
              console.log(existedStats.source.source().toString());
              const updatedStats = this._statsManager.updateStats(
                JSON.parse(xxx),
                compiler,
                compilation,
              );
              this._manifestManager.updateManifest({
                compilation,
                stats: updatedStats,
                publicPath: this._statsManager.getPublicPath(compiler),
                compiler,
                bundler: this._bundler,
              });
              return;
            }

            this.statsInfo = await this._statsManager.generateStats(
              compiler,
              compilation,
            );
            this.manifestInfo = await this._manifestManager.generateManifest({
              compilation,
              stats: this.statsInfo.stats,
              publicPath: this._statsManager.getPublicPath(compiler),
              compiler,
              bundler: this._bundler,
              additionalData:
                typeof this._options.manifest === 'object'
                  ? this._options.manifest.additionalData
                  : undefined,
            });
          }
        },
      );
    });
  }
}
