/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-depth */
import fs from 'fs';
import path from 'path';
import {
  StatsRemote,
  StatsBuildInfo,
  BasicStatsMetaData,
  StatsMetaData,
  Stats,
  StatsAssets,
  moduleFederationPlugin,
  RemoteEntryType,
  encodeName,
  MFPrefetchCommon,
} from '@module-federation/sdk';
import {
  Compilation,
  Compiler,
  StatsCompilation,
  StatsModule,
  Chunk,
} from 'webpack';
import {
  isDev,
  getAssetsByChunk,
  findChunk,
  getAssetsByChunkIDs,
  getSharedModules,
  assert,
  getFileNameWithOutExt,
  getFileName,
  getTypesMetaInfo,
} from './utils';
import logger from './logger';
import {
  ContainerManager,
  RemoteManager,
  SharedManager,
  PKGJsonManager,
  utils,
} from '@module-federation/managers';
import { HOT_UPDATE_SUFFIX } from './constants';
import { ModuleHandler, getExposeItem } from './ModuleHandler';
import { StatsInfo } from './types';

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
    return getFileName(this._options.manifest).statsFileName;
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
      const files = Array.from(
        remoteEntryNameChunk.files as Iterable<string>,
      ).filter(
        (f: string) => !f.includes(HOT_UPDATE_SUFFIX) && !f.endsWith('.css'),
      );
      assert(files.length > 0, 'no files found for remoteEntry chunk');
      assert(
        files.length === 1,
        `remoteEntry chunk should not have multiple files!, current files: ${files.join(
          ',',
        )}`,
      );

      const remoteEntryName = files[0];

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
        type:
          (this._options?.library?.type as RemoteEntryType | undefined) ||
          'global',
      },
      types: getTypesMetaInfo(this._options, compiler.context, compilation),
      globalName: globalName,
      pluginVersion: this._pluginVersion,
    };

    let prefetchInterface = false;
    const prefetchFilePath = path.resolve(
      compiler.options.context || process.cwd(),
      `node_modules/.mf/${encodeName(name!)}/${MFPrefetchCommon.fileName}`,
    );
    const existPrefetch = fs.existsSync(prefetchFilePath);
    if (existPrefetch) {
      const content = fs.readFileSync(prefetchFilePath).toString();
      if (content) {
        prefetchInterface = true;
      }
    }
    metaData.prefetchInterface = prefetchInterface;

    if (this._options.getPublicPath) {
      if ('publicPath' in metaData) {
        delete metaData.publicPath;
      }
      return {
        ...metaData,
        getPublicPath: this._options.getPublicPath,
      };
    }
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
    const entryPointNames = [...compilation.entrypoints.values()]
      .map((e) => e.name)
      .filter((v) => !!v) as Array<string>;

    chunks.forEach((chunk) => {
      if (
        typeof chunk.name === 'string' &&
        exposeFileNameImportMap[chunk.name]
      ) {
        // TODO: support multiple import
        const exposeKey = exposeFileNameImportMap[chunk.name][0];
        assets[getFileNameWithOutExt(exposeKey)] = getAssetsByChunk(
          chunk,
          entryPointNames,
        );
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
          async: new Set<string | number>(),
          sync: new Set<string | number>(),
        };
      }
      sharedModule.chunks!.forEach((chunkID: string | number) => {
        const chunk = findChunk(chunkID, compilation.chunks);

        manifestOverrideChunkIDMap[sharedModuleName].sync.add(chunkID);
        Array.from(chunk!.getAllInitialChunks() as Iterable<Chunk>).forEach(
          (syncChunk: Chunk) => {
            syncChunk.id &&
              manifestOverrideChunkIDMap[sharedModuleName].sync.add(
                syncChunk.id,
              );
          },
        );

        Array.from(chunk!.getAllAsyncChunks() as Iterable<Chunk>).forEach(
          (asyncChunk: Chunk) => {
            asyncChunk.id &&
              manifestOverrideChunkIDMap[sharedModuleName].async.add(
                asyncChunk.id,
              );
          },
        );
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
      const {
        name,
        manifest: manifestOptions = {},
        exposes = {},
      } = this._options;

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
        stats.exposes = Object.keys(exposes).map((exposeKey) => {
          return getExposeItem({
            exposeKey,
            name: name!,
            file: {
              import: exposes[exposeKey].import,
            },
          });
        });
        return stats;
      }

      const liveStats = compilation.getStats();
      const statsOptions: Record<string, boolean> = {
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
      };
      if (this._bundler === 'webpack') {
        statsOptions['cached'] = true;
        statsOptions['cachedModules'] = true;
      }
      const webpackStats = liveStats.toJson(statsOptions);

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
          const remoteMemo: Set<string> = new Set();
          stats.remotes = remotes.map((remote) => {
            remoteMemo.add(remote.federationContainerName);
            return {
              ...remote,
              usedIn: Array.from(remote.usedIn.values()),
            };
          });
          const statsRemoteWithEmptyUsedIn =
            this._remoteManager.statsRemoteWithEmptyUsedIn;
          statsRemoteWithEmptyUsedIn.forEach((remoteInfo) => {
            if (!remoteMemo.has(remoteInfo.federationContainerName)) {
              stats.remotes.push(remoteInfo);
            }
          });
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
    extraOptions: { disableEmit?: boolean } = {},
  ): Promise<StatsInfo> {
    try {
      const { disableEmit } = extraOptions;
      const existedStats = compilation.getAsset(this.fileName);
      if (existedStats && !isDev()) {
        return {
          stats: JSON.parse(existedStats.source.source().toString()),
          filename: this.fileName,
        };
      }
      const { manifest: manifestOptions = {} } = this._options;
      let stats = await this._generateStats(compiler, compilation);

      if (
        typeof manifestOptions === 'object' &&
        manifestOptions.additionalData
      ) {
        const ret = await manifestOptions.additionalData({
          stats,
          pluginOptions: this._options,
          compiler,
          compilation,
          bundler: this._bundler,
        });
        stats = ret || stats;
      }

      if (!disableEmit) {
        compilation.emitAsset(
          this.fileName,
          new compiler.webpack.sources.RawSource(
            JSON.stringify(stats, null, 2),
          ),
        );
      }

      return {
        stats,
        filename: this.fileName,
      };
    } catch (err) {
      throw err;
    }
  }

  validate(compiler: Compiler): boolean {
    const {
      output: { publicPath },
    } = compiler.options;

    if (typeof publicPath !== 'string') {
      logger.warn(
        `Manifest will not generate, because publicPath can only be string, but got '${publicPath}'`,
      );
      return false;
    } else if (publicPath === 'auto') {
      logger.warn(
        `Manifest will use absolute path resolution via its host at runtime, reason: publicPath='${publicPath}'`,
      );
      return true;
    }

    return true;
  }
}

export { StatsManager };
