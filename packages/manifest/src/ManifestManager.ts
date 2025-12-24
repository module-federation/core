import chalk from 'chalk';
import {
  Stats,
  Manifest,
  ManifestExpose,
  ManifestShared,
  ManifestRemote,
  moduleFederationPlugin,
  getManifestFileName,
} from '@module-federation/sdk';
import { isDev } from './utils';
import logger from './logger';
import type { Compilation, Compiler } from 'webpack';

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

  init(options: moduleFederationPlugin.ModuleFederationPluginOptions): void {
    this._options = options;
  }

  get fileName(): string {
    return getManifestFileName(this._options.manifest).manifestFileName;
  }

  updateManifest(options: GenerateManifestOptions): Manifest {
    const manifest = this.generateManifest(options);

    return manifest;
  }

  generateManifest(options: GenerateManifestOptions): Manifest {
    const { publicPath, stats, compiler } = options;
    // Initialize manifest with required properties from stats
    const { id, name, metaData } = stats;
    const manifest: Manifest = {
      id,
      name,
      metaData,
      shared: [],
      remotes: [],
      exposes: [],
    };

    if (manifest.metaData?.buildInfo) {
      delete manifest.metaData.buildInfo.target;
      delete manifest.metaData.buildInfo.plugins;
    }

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
        fallback: cur.fallback,
        fallbackName: cur.fallbackName,
        fallbackType: cur.fallbackType,
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

    if (
      isDev() &&
      (process.env['MF_SSR_PRJ']
        ? compiler.options.target !== 'async-node'
        : true)
    ) {
      logger.info(
        `Manifest Link: ${chalk.cyan(
          `${publicPath === 'auto' ? '{auto}/' : publicPath}${this.fileName}`,
        )} `,
      );
    }

    return manifest;
  }
}

export { ManifestManager };
