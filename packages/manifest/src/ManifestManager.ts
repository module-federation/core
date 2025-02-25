import chalk from 'chalk';
import {
  Stats,
  Manifest,
  ManifestExpose,
  ManifestShared,
  ManifestRemote,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { getFileName, isDev } from './utils';
import logger from './logger';
import type { Compilation, Compiler } from 'webpack';
import { ManifestInfo } from './types';

interface GenerateManifestOptions {
  compilation: Compilation;
  stats: Stats;
  publicPath: string;
  compiler: Compiler;
  bundler: 'webpack' | 'rspack';
  additionalData?: moduleFederationPlugin.PluginManifestOptions['additionalData'];
}

class ManifestManager {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions = {};
  private _manifest?: Manifest;

  get manifest(): Manifest | undefined {
    return this._manifest;
  }

  init(options: moduleFederationPlugin.ModuleFederationPluginOptions): void {
    this._options = options;
  }

  get fileName(): string {
    return getFileName(this._options.manifest).manifestFileName;
  }

  async generateManifest(
    options: GenerateManifestOptions,
    extraOptions: { disableEmit?: boolean } = {},
  ): Promise<ManifestInfo> {
    const {
      compilation,
      publicPath,
      stats,
      compiler,
      bundler,
      additionalData,
    } = options;
    const { disableEmit } = extraOptions;
    const manifest: Manifest = {
      ...stats,
    };

    manifest.exposes = stats.exposes.reduce((sum, cur) => {
      const expose: ManifestExpose = {
        id: cur.id,
        name: cur.name,
        assets: cur.assets,
        path: cur.path,
      };
      sum.push(expose);
      return sum;
    }, [] as ManifestExpose[]);
    manifest.shared = stats.shared.reduce((sum, cur) => {
      const shared: ManifestShared = {
        id: cur.id,
        name: cur.name,
        version: cur.version,
        singleton: cur.singleton,
        requiredVersion: cur.requiredVersion,
        hash: cur.hash,
        assets: cur.assets,
      };
      sum.push(shared);
      return sum;
    }, [] as ManifestShared[]);

    manifest.remotes = stats.remotes.reduce((sum, cur) => {
      // @ts-ignore version/entry will be added as follow
      const remote: ManifestRemote = {
        federationContainerName: cur.federationContainerName,
        moduleName: cur.moduleName,
        alias: cur.alias,
      };

      if ('entry' in cur) {
        // @ts-ignore
        remote.entry = cur.entry;
      } else if ('version' in cur) {
        // @ts-ignore
        remote.entry = cur.version;
      }

      sum.push(remote);
      return sum;
    }, [] as ManifestRemote[]);

    this._manifest = manifest;

    const manifestFileName = this.fileName;

    if (additionalData) {
      const ret = await additionalData({
        manifest: this._manifest,
        stats,
        pluginOptions: this._options,
        compiler,
        compilation,
        bundler,
      });
      this._manifest = ret || this._manifest;
    }

    if (!disableEmit) {
      compilation.emitAsset(
        manifestFileName,
        new compiler.webpack.sources.RawSource(
          JSON.stringify(this._manifest, null, 2),
        ),
      );
    }

    if (isDev()) {
      logger.info(
        `Manifest Link: ${chalk.cyan(
          `${
            publicPath === 'auto' ? '{auto}/' : publicPath
          }${manifestFileName}`,
        )} `,
      );
    }

    return {
      manifest: this._manifest,
      filename: manifestFileName,
    };
  }
}

export { ManifestManager };
