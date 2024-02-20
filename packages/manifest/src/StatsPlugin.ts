import { Compiler, WebpackPluginInstance } from 'webpack';
import { PluginOptions } from '@/types';
import { StatsManager } from '@/managers/StatsManager';
import { RemoteManager } from '@/managers/RemoteManager';
import { SharedManager } from '@/managers/SharedManager';
import { ManifestManager } from '@/managers/ManifestManager';

export class StatsPlugin implements WebpackPluginInstance {
  readonly name = 'StatsPlugin';
  private _options: PluginOptions;
  private _statsManager: StatsManager;
  private _manifestManager: ManifestManager;
  private _declarationFileName: string;

  constructor(options: PluginOptions, declarationFileName: string) {
    this._options = options;
    this._statsManager = new StatsManager();
    this._statsManager.init(this._options);
    this._manifestManager = new ManifestManager();
    this._manifestManager.init(this._options);
    this._declarationFileName = declarationFileName;
  }

  apply(compiler: Compiler): void {
    this._statsManager.validate(compiler);
    const remoteManager = new RemoteManager();
    remoteManager.init(this._options);
    const sharedManager = new SharedManager();
    sharedManager.init(this._options);

    compiler.hooks.thisCompilation.tap('generateStats', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'generateStats',
          // @ts-ignore use runtime variable in case peer dep not installed
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
        },
        async () => {
          if (!this._options?.manifest?.disableGenerate) {
            const stats = await this._statsManager.generateStats(
              compiler,
              compilation,
              {
                declarationFileName: this._declarationFileName,
              },
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
