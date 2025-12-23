import fs from 'fs';
import path from 'path';
import { Compiler, WebpackPluginInstance } from 'webpack';
import {
  bindLoggerToCompiler,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { ManifestManager } from './ManifestManager';
import { StatsManager } from './StatsManager';
import { PLUGIN_IDENTIFIER } from './constants';
import logger from './logger';
import {
  __getCachedClientManifestJson,
  applyRscManifestMetadata,
  inferRscLayer,
} from './rscManifestMetadata';

async function waitForClientManifest({
  compilation,
  outputPath,
  clientManifestFilename,
  timeoutMs,
  pollIntervalMs,
}: {
  compilation: any;
  outputPath: string;
  clientManifestFilename: string;
  timeoutMs: number;
  pollIntervalMs: number;
}): Promise<boolean> {
  const timeout =
    typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : 0;
  const interval =
    typeof pollIntervalMs === 'number' && pollIntervalMs > 0
      ? pollIntervalMs
      : 50;
  const start = Date.now();
  const manifestPath = path.join(outputPath, clientManifestFilename);

  while (true) {
    if (compilation.getAsset?.(clientManifestFilename)) return true;
    if (__getCachedClientManifestJson(outputPath, clientManifestFilename))
      return true;

    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, 'utf8');
        JSON.parse(raw);
        return true;
      } catch (_e) {
        // keep waiting for the file to be fully written
      }
    }

    if (timeout > 0 && Date.now() - start > timeout) return false;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

async function ensureSsrClientManifestAvailable({
  compiler,
  compilation,
  rscOptions,
}: {
  compiler: Compiler;
  compilation: any;
  rscOptions: moduleFederationPlugin.ManifestRscOptions;
}): Promise<void> {
  if (!rscOptions || typeof rscOptions !== 'object') return;

  const compilerConditionNames = Array.isArray(
    (compiler.options as any)?.resolve?.conditionNames,
  )
    ? ((compiler.options as any).resolve.conditionNames as string[])
    : undefined;

  const conditionNames =
    (rscOptions as any).conditionNames || compilerConditionNames;
  const layer =
    (rscOptions as any).layer || inferRscLayer(compiler, conditionNames);

  if (layer !== 'ssr') return;

  const outputPath = (compiler.options as any)?.output?.path;
  if (typeof outputPath !== 'string' || outputPath.length === 0) return;

  const clientManifestFilename =
    typeof (rscOptions as any).clientManifest === 'string' &&
    (rscOptions as any).clientManifest.length > 0
      ? ((rscOptions as any).clientManifest as string)
      : 'react-client-manifest.json';

  if (compilation.getAsset?.(clientManifestFilename)) return;

  if (__getCachedClientManifestJson(outputPath, clientManifestFilename)) return;

  const ok = await waitForClientManifest({
    compilation,
    outputPath,
    clientManifestFilename,
    timeoutMs: 120000,
    pollIntervalMs: 50,
  });

  if (!ok) {
    throw new Error(
      `[ ${PLUGIN_IDENTIFIER} ]: Timed out waiting for ${clientManifestFilename} in ${outputPath}. ` +
        'SSR manifest generation requires the client compiler to emit the React client manifest.',
    );
  }
}

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
                this._options.manifest.rsc
              ) {
                await ensureSsrClientManifestAvailable({
                  compiler,
                  compilation,
                  rscOptions: this._options.manifest.rsc,
                });
                updatedStats = applyRscManifestMetadata({
                  stats: updatedStats,
                  compiler,
                  compilation,
                  rscOptions: this._options.manifest.rsc,
                  mfOptions: this._options,
                });
              }
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

              compilation.updateAsset(
                this._statsManager.fileName,
                new compiler.webpack.sources.RawSource(
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
              const source = new compiler.webpack.sources.RawSource(
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
              this._options.manifest.rsc
            ) {
              await ensureSsrClientManifestAvailable({
                compiler,
                compilation,
                rscOptions: this._options.manifest.rsc,
              });
              stats = applyRscManifestMetadata({
                stats,
                compiler,
                compilation,
                rscOptions: this._options.manifest.rsc,
                mfOptions: this._options,
              });
            }

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

            compilation.emitAsset(
              this._statsManager.fileName,
              new compiler.webpack.sources.RawSource(
                JSON.stringify(stats, null, 2),
              ),
            );
            compilation.emitAsset(
              this._manifestManager.fileName,
              new compiler.webpack.sources.RawSource(
                JSON.stringify(manifest, null, 2),
              ),
            );
          }
        },
      );
    });
  }
}
