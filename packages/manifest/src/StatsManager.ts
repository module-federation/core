/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-depth */

import chalk from 'chalk';
import {
  StatsRemote,
  StatsBuildInfo,
  BasicStatsMetaData,
  StatsMetaData,
  Stats,
  StatsAssets,
  StatsFileName,
  moduleFederationPlugin,
  simpleJoinRemoteEntry,
} from '@module-federation/sdk';
import { Compilation, Compiler, StatsCompilation, StatsModule } from 'webpack';
import {
  getAssetsByChunk,
  findChunk,
  getAssetsByChunkIDs,
  getSharedModules,
  assert,
  getFileNameWithOutExt,
} from './utils';
import {
  ContainerManager,
  RemoteManager,
  SharedManager,
  PKGJsonManager,
  utils,
} from '@module-federation/managers';
import { HOT_UPDATE_SUFFIX, PLUGIN_IDENTIFIER } from './constants';
import { ModuleHandler } from './ModuleHandler';

class StatsManager {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions = {};
  private _publicPath?: string;
  private _pluginVersion?: string;
  private _bundler: 'webpack' | 'rspack' = 'webpack';
  private _containerManager: ContainerManager = new ContainerManager();
  private _remoteManager: RemoteManager = new RemoteManager();
  private _sharedManager: SharedManager = new SharedManager();
  private _pkgJsonManager: PKGJsonManager = new PKGJsonManager();

  get buildInfo(): StatsBuildInfo {
    const pkg = this._pkgJsonManager.readPKGJson(process.cwd());

    return {
      buildVersion: utils.getBuildVersion(),
      buildName: utils.getBuildName() || pkg['name'],
    };
  }

  get fileName(): string {
    const { manifest: manifestOptions = {} } = this._options;
    let statsFilePath =
      typeof manifestOptions === 'boolean'
        ? ''
        : manifestOptions.filePath || '';

    return simpleJoinRemoteEntry(statsFilePath, StatsFileName);
  }

  private _getMetaData(
    compiler: Compiler,
    compilation: Compilation,
    extraOptions?: {},
  ): StatsMetaData {
    const { context } = compiler.options;

    const {
      _options: { name },
      buildInfo,
    } = this;
    const type = this._pkgJsonManager.getExposeGarfishModuleType(
      context || process.cwd(),
    );

    const getRemoteEntryName = (): string => {
      if (!this._containerManager.enable) {
        return '';
      }

      assert(name, 'name is required');

      const remoteEntryPoint = compilation.entrypoints.get(name);
      assert(remoteEntryPoint, 'Can not get remoteEntry entryPoint!');

      const remoteEntryNameChunk = compilation.namedChunks.get(name);

      assert(remoteEntryNameChunk, 'Can not get remoteEntry chunk!');
      assert(
        Array.from(remoteEntryNameChunk.files).filter(
          (f) => !f.includes(HOT_UPDATE_SUFFIX),
        ).length === 1,
        `remoteEntry chunk should not have multiple files!, current files: ${Array.from(
          remoteEntryNameChunk.files,
        ).join(',')}`,
      );

      const remoteEntryName = [...remoteEntryNameChunk.files][0];

      return remoteEntryName;
    };

    const globalName = this._containerManager.globalEntryName;
    assert(
      globalName,
      'Can not get library.name, please ensure you have set library.name and the type is "string" !',
    );
    assert(
      this._pluginVersion,
      'Can not get pluginVersion, please ensure you have set pluginVersion !',
    );

    const metaData: BasicStatsMetaData = {
      name: name!,
      type,
      buildInfo,
      remoteEntry: {
        name: getRemoteEntryName(),
        path: '',
        // same as the types supported by runtime, currently only global/var/script is supported
        type: 'global',
      },
      types: {
        name: '',
        path: '',
      },
      globalName: globalName,
      pluginVersion: this._pluginVersion,
    };

    return {
      ...metaData,
      publicPath: this.getPublicPath(compiler),
    };
  }

  private _getFilteredModules(stats: StatsCompilation): StatsModule[] {
    const filteredModules = stats.modules!.filter((module) => {
      if (!module || !module.name) {
        return false;
      }
      const array = [
        module.name.includes('container entry'),
        module.name.includes('remote '),
        module.name.includes('shared module '),
        module.name.includes('provide module '),
      ];
      return array.some((item) => item);
    });

    return filteredModules;
  }

  private _getModuleAssets(
    compilation: Compilation,
  ): Record<string, StatsAssets> {
    const { chunks } = compilation;
    const { exposeFileNameImportMap } = this._containerManager;
    const assets: Record<string, StatsAssets> = {};

    chunks.forEach((chunk) => {
      if (
        typeof chunk.name === 'string' &&
        exposeFileNameImportMap[chunk.name]
      ) {
        // TODO: support multiple import
        const exposeKey = exposeFileNameImportMap[chunk.name][0];
        assets[getFileNameWithOutExt(exposeKey)] = getAssetsByChunk(chunk);
      }
    });

    return assets;
  }

  private _getProvideSharedAssets(
    compilation: Compilation,
    stats: StatsCompilation,
  ): StatsAssets {
    const sharedModules = stats.modules!.filter((module) => {
      if (!module || !module.name) {
        return false;
      }
      const array = [module.name.includes('consume shared module ')];
      return array.some((item) => item);
    });

    const manifestOverrideChunkIDMap: Record<
      string,
      { async: Set<string | number>; sync: Set<string | number> }
    > = {};
    const effectiveSharedModules = getSharedModules(stats, sharedModules);

    effectiveSharedModules.forEach((item) => {
      const [sharedModuleName, sharedModule] = item;
      if (!manifestOverrideChunkIDMap[sharedModuleName]) {
        manifestOverrideChunkIDMap[sharedModuleName] = {
          async: new Set(),
          sync: new Set(),
        };
      }
      sharedModule.chunks!.forEach((chunkID) => {
        const chunk = findChunk(chunkID, compilation.chunks);

        manifestOverrideChunkIDMap[sharedModuleName].sync.add(chunkID);
        Array.from(chunk!.getAllInitialChunks()).forEach((syncChunk) => {
          syncChunk.id &&
            manifestOverrideChunkIDMap[sharedModuleName].sync.add(syncChunk.id);
        });

        Array.from(chunk!.getAllAsyncChunks()).forEach((asyncChunk) => {
          asyncChunk.id &&
            manifestOverrideChunkIDMap[sharedModuleName].async.add(
              asyncChunk.id,
            );
        });
      });
    });

    const assets: StatsAssets = {
      js: {
        async: [],
        sync: [],
      },
      css: {
        async: [],
        sync: [],
      },
    };

    Object.keys(manifestOverrideChunkIDMap).forEach((override) => {
      const asyncAssets = getAssetsByChunkIDs(compilation, {
        [override]: manifestOverrideChunkIDMap[override].async,
      });

      const syncAssets = getAssetsByChunkIDs(compilation, {
        [override]: manifestOverrideChunkIDMap[override].sync,
      });
      assets[override] = {
        js: {
          async: asyncAssets[override].js,
          sync: syncAssets[override].js,
        },
        css: {
          async: asyncAssets[override].css,
          sync: syncAssets[override].css,
        },
      };
    });
    return assets;
  }

  private async _generateStats(
    compiler: Compiler,
    compilation: Compilation,
    extraOptions?: {},
  ): Promise<Stats> {
    try {
      const { name, manifest: manifestOptions = {} } = this._options;

      const metaData = this._getMetaData(compiler, compilation, extraOptions);

      const stats: Stats = {
        id: name!,
        name: name!,
        metaData,
        shared: [],
        remotes: [],
        exposes: [],
      };

      if (
        typeof manifestOptions === 'object' &&
        manifestOptions.disableAssetsAnalyze
      ) {
        const remotes: StatsRemote[] =
          this._remoteManager.statsRemoteWithEmptyUsedIn;
        stats.remotes = remotes;
        return stats;
      }

      const liveStats = compilation.getStats();
      const webpackStats = liveStats.toJson({
        all: false,
        modules: true,
        builtAt: true,
        hash: true,
        ids: true,
        version: true,
        entrypoints: true,
        assets: false,
        chunks: false,
        reasons: true,
      });

      const filteredModules = this._getFilteredModules(webpackStats);
      const moduleHandler = new ModuleHandler(this._options, filteredModules, {
        bundler: this._bundler,
      });
      const { remotes, exposesMap, sharedMap } = moduleHandler.collect();

      await Promise.all([
        new Promise<void>((resolve) => {
          const sharedAssets = this._getProvideSharedAssets(
            compilation,
            webpackStats,
          );

          Object.keys(sharedMap).forEach((sharedKey) => {
            const assets = sharedAssets[sharedKey];
            if (assets) {
              sharedMap[sharedKey].assets = assets;
            }
          });
          resolve();
        }),
        new Promise<void>((resolve) => {
          const moduleAssets = this._getModuleAssets(compilation);

          Object.keys(exposesMap).forEach((exposeKey) => {
            const assets = moduleAssets[exposeKey];
            if (assets) {
              exposesMap[exposeKey].assets = assets;
            }
            exposesMap[exposeKey].requires = Array.from(
              exposesMap[exposeKey].requires,
            );
          });
          resolve();
        }),
      ]);

      await Promise.all([
        new Promise<void>((resolve) => {
          stats.remotes = remotes.map((remote) => ({
            ...remote,
            usedIn: Array.from(remote.usedIn.values()),
          }));
          resolve();
        }),
        new Promise<void>((resolve) => {
          stats.shared = Object.values(sharedMap).map((shared) => ({
            ...shared,
            usedIn: Array.from(shared.usedIn),
          }));
          resolve();
        }),
        new Promise<void>((resolve) => {
          stats.exposes = Object.values(exposesMap).map((expose) => ({
            ...expose,
          }));
          resolve();
        }),
      ]);

      return stats;
    } catch (err) {
      throw err;
    }
  }

  getPublicPath(compiler: Compiler): string {
    if (this._publicPath) {
      return this._publicPath;
    }
    const {
      output: { publicPath: originalPublicPath },
    } = compiler.options;

    let publicPath = originalPublicPath as string;

    this._publicPath = publicPath;
    return publicPath;
  }

  init(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
    {
      pluginVersion,
      bundler,
    }: { pluginVersion: string; bundler: 'webpack' | 'rspack' },
  ): void {
    this._options = options;
    this._pluginVersion = pluginVersion;
    this._bundler = bundler;

    this._containerManager = new ContainerManager();
    this._containerManager.init(options);
    this._remoteManager = new RemoteManager();
    this._remoteManager.init(options);
    this._sharedManager = new SharedManager();
    this._sharedManager.init(options);
  }

  async generateStats(
    compiler: Compiler,
    compilation: Compilation,
    extraOptions?: {},
  ): Promise<Stats> {
    try {
      const stats = await this._generateStats(compiler, compilation);

      compilation.emitAsset(
        this.fileName,
        new compiler.webpack.sources.RawSource(JSON.stringify(stats, null, 2)),
      );
      return stats;
    } catch (err) {
      throw err;
    }
  }

  validate(compiler: Compiler): void {
    const {
      output: { publicPath },
    } = compiler.options;

    if (typeof publicPath !== 'string') {
      console.error(
        chalk`{bold {red [ ${PLUGIN_IDENTIFIER} ]: PublicPath can only be string, but got ${publicPath}}}`,
      );
      process.exit(1);
    }
  }
}

export { StatsManager };
