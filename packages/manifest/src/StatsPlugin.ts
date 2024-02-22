import { Compiler, WebpackPluginInstance } from 'webpack';
import { moduleFederationPlugin } from '@module-federation/sdk';
import { ManifestManager } from './ManifestManager';
import { StatsManager } from './StatsManager';

export class StatsPlugin implements WebpackPluginInstance {
  readonly name = 'StatsPlugin';
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;
  private _statsManager: StatsManager;
  private _manifestManager: ManifestManager;

  constructor(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
    {
      pluginVersion,
      bundler,
    }: { pluginVersion: string; bundler: 'webpack' | 'rspack' },
  ) {
    this._options = options;
    this._statsManager = new StatsManager();
    this._statsManager.init(this._options, { pluginVersion, bundler });
    this._manifestManager = new ManifestManager();
    this._manifestManager.init(this._options);
  }

  apply(compiler: Compiler): void {
    this._statsManager.validate(compiler);

    compiler.hooks.thisCompilation.tap('generateStats', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'generateStats',
          // @ts-ignore use runtime variable in case peer dep not installed
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          if (this._options.manifest) {
            const stats = await this._statsManager.generateStats(
              compiler,
              compilation,
            );
            this._manifestManager.generateManifest({
              compilation,
              stats,
              publicPath: this._statsManager.getPublicPath(compiler),
              compiler,
            });
          }
        },
      );
    });
  }
}
