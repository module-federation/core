import { styleText } from 'node:util';
import {
  Stats,
  Manifest,
  ManifestExpose,
  ManifestShared,
  ManifestRemote,
  moduleFederationPlugin,
  getManifestFileName,
  getServiceUrl,
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

    if (metaData.buildInfo) {
      'target' in metaData.buildInfo && delete metaData.buildInfo.target;
      'plugins' in metaData.buildInfo && delete metaData.buildInfo.plugins;
    }

    const manifest: Manifest = {
      id,
      name,
      metaData,
      shared: [],
      remotes: [],
      exposes: [],
    };

    manifest.exposes = stats.exposes.reduce((sum, cur) => {
      if (
        cur.isService ||
        Object.prototype.hasOwnProperty.call(cur, 'servicePath')
      ) {
        if (cur.render !== 'bridge') {
          throw new Error(
            `Service expose ${cur.name} must use Bridge rendering.`,
          );
        }
        try {
          getServiceUrl(metaData.serviceBaseUrl, cur.servicePath as string);
        } catch (error) {
          throw new Error(
            `Service expose ${cur.name}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
      const expose: ManifestExpose = {
        id: cur.id,
        name: cur.name,
        assets: cur.assets,
        path: cur.path,
        ...(cur.render !== undefined && { render: cur.render }),
        ...(Object.prototype.hasOwnProperty.call(cur, 'servicePath') && {
          servicePath: cur.servicePath,
        }),
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
        `Manifest Link: ${styleText('cyan', `${publicPath === 'auto' ? '{auto}/' : publicPath}${this.fileName}`)} `,
      );
    }

    return manifest;
  }
}

export { ManifestManager };
