import chalk from 'chalk';
import {
  Stats,
  Manifest,
  ManifestFileName,
  ManifestExpose,
  StatsExpose,
  StatsShared,
  ManifestShared,
  ManifestRemote,
  simpleJoinRemoteEntry,
  StatsRemote,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { isDev } from './utils';
import type { Compilation, Compiler } from 'webpack';
import { PLUGIN_IDENTIFIER } from './constants';

interface GenerateManifestOptions {
  compilation: Compilation;
  stats: Stats;
  publicPath: string;
  compiler: Compiler;
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

  generateManifest(options: GenerateManifestOptions): void {
    const { compilation, publicPath, stats, compiler } = options;
    const { manifest: manifestOptions = {} } = this._options;
    const manifest: Manifest = {
      ...stats,
    };

    manifest.exposes = Object.keys(stats.exposes).reduce((sum, cur) => {
      const statsExpose = manifest.exposes[cur] as StatsExpose;
      const expose: ManifestExpose = {
        id: statsExpose.id,
        name: statsExpose.name,
        assets: statsExpose.assets,
        path: statsExpose.path,
      };
      sum.push(expose);
      return sum;
    }, [] as ManifestExpose[]);
    manifest.shared = Object.keys(stats.shared).reduce((sum, cur) => {
      const statsShared = manifest.shared[cur] as StatsShared;
      const shared: ManifestShared = {
        id: statsShared.id,
        name: statsShared.name,
        version: statsShared.version,
        singleton: statsShared.singleton,
        requiredVersion: statsShared.requiredVersion,
        hash: statsShared.hash,
        assets: statsShared.assets,
      };
      sum.push(shared);
      return sum;
    }, [] as ManifestShared[]);

    manifest.remotes = Object.keys(stats.remotes).reduce((sum, cur) => {
      const statsRemote = manifest.remotes[cur] as StatsRemote;
      // @ts-ignore version/entry will be added as follow
      const remote: ManifestRemote = {
        federationContainerName: statsRemote.federationContainerName,
        moduleName: statsRemote.moduleName,
        alias: statsRemote.alias,
      };

      if ('entry' in statsRemote) {
        // @ts-ignore
        remote.entry = statsRemote.entry;
      } else if ('version' in statsRemote) {
        // @ts-ignore
        remote.entry = statsRemote.version;
      }

      sum.push(remote);
      return sum;
    }, [] as ManifestRemote[]);

    this._manifest = manifest;
    let manifestFilePath =
      typeof manifestOptions === 'boolean'
        ? ''
        : manifestOptions.filePath || '';

    const manifestFileName = simpleJoinRemoteEntry(
      manifestFilePath,
      ManifestFileName,
    );

    compilation.emitAsset(
      manifestFileName,
      new compiler.webpack.sources.RawSource(JSON.stringify(manifest, null, 2)),
    );

    if (isDev()) {
      console.log(
        chalk`{bold {greenBright [ ${PLUGIN_IDENTIFIER} ]} {greenBright Vmok Link:} {cyan ${publicPath}${manifestFileName}}}`,
      );
    }
  }
}

export { ManifestManager };
