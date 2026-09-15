/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-depth */
import {
  StatsRemote,
  StatsBuildInfo,
  BasicStatsMetaData,
  StatsMetaData,
  Stats,
  StatsAssets,
  moduleFederationPlugin,
  RemoteEntryType,
  getManifestFileName,
  StatsMetaDataWithGetPublicPath,
  StatsMetaDataWithPublicPath,
  StatsShared,
} from '@module-federation/sdk';
import { Compilation, Compiler } from 'webpack';
import type { StatsCompilation } from 'webpack/lib/stats/DefaultStatsFactoryPlugin';
import {
  isDev,
  getAssetsByChunk,
  findChunk,
  getAssetsByChunkIDs,
  getSharedModules,
  assert,
  getTypesMetaInfo,
} from './utils';
import logger from './logger';
import {
  ContainerManager,
  RemoteManager,
  SharedManager,
  PKGJsonManager,
  utils,
  UNKNOWN_MODULE_NAME,
} from '@module-federation/managers';
import { HOT_UPDATE_SUFFIX } from './constants';
import { ModuleHandler, getExposeItem, getShareItem } from './ModuleHandler';
import { StatsInfo } from './types';
import { collectGraph } from './collectGraph';

class StatsManager {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions = {};
  private _publicPath?: string;
  private _pluginVersion?: string;
  private _bundler: 'webpack' | 'rspack' = 'webpack';
  private _containerManager: ContainerManager = new ContainerManager();
  private _remoteManager: RemoteManager = new RemoteManager();
  private _sharedManager: SharedManager = new SharedManager();
  private _pkgJsonManager: PKGJsonManager = new PKGJsonManager();

  private getBuildInfo(
    context?: string,
    target?: string | string[],
  ): StatsBuildInfo {
    const rootPath = context || process.cwd();
    const pkg = this._pkgJsonManager.readPKGJson(rootPath);

    const statsBuildInfo: StatsBuildInfo = {
      buildVersion: utils.getBuildVersion(rootPath),
      buildName: utils.getBuildName() || pkg['name'],
    };
    if (this._sharedManager.enableTreeShaking) {
      statsBuildInfo.target = target
        ? Array.isArray(target)
          ? target
          : [target]
        : [];
      statsBuildInfo.plugins = this._options.treeShakingSharedPlugins || [];
      statsBuildInfo.excludePlugins =
        this._options.treeShakingSharedExcludePlugins || [];
    }

    return statsBuildInfo;
  }

  get fileName(): string {
    return getManifestFileName(this._options.manifest).statsFileName;
  }

  setMetaDataPublicPath(
    metaData: BasicStatsMetaData,
    compiler: Compiler,
  ): StatsMetaData {
    if (this._options.getPublicPath) {
      if ('publicPath' in metaData) {
        // @ts-ignore
        delete metaData.publicPath;
      }

      (
        metaData as StatsMetaData<StatsMetaDataWithGetPublicPath>
      ).getPublicPath = this._options.getPublicPath;
    } else {
      (metaData as StatsMetaData<StatsMetaDataWithPublicPath>).publicPath =
        this.getPublicPath(compiler);
    }
    return metaData as StatsMetaData;
  }

  private _getMetaData(
    compiler: Compiler,
    compilation: Compilation,
    extraOptions?: object,
  ): StatsMetaData {
    const { context } = compiler.options;
    const {
      _options: { name },
    } = this;
    const buildInfo = this.getBuildInfo(
      context,
      compilation.options.target || '',
    );
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
        // The runtime loader type follows the configured container library type.
        type:
          (this._options?.library?.type as RemoteEntryType | undefined) ||
          'global',
      },
      types: getTypesMetaInfo(this._options, compiler.context),
      globalName: globalName,
      pluginVersion: this._pluginVersion,
    };

    return this.setMetaDataPublicPath(metaData, compiler);
  }

  private _getModuleAssets(
    compilation: Compilation,
    entryPointNames: string[],
  ): Record<string, StatsAssets> {
    const { chunks } = compilation;
    const exposes = this._containerManager.containerPluginExposesOptions;
    const exposeKeysByChunk = new Map<string, string[]>();
    for (const [key, options] of Object.entries(exposes)) {
      if (
        typeof options === 'object' &&
        !Array.isArray(options) &&
        options.name
      ) {
        const keys = exposeKeysByChunk.get(options.name) || [];
        keys.push(key);
        exposeKeysByChunk.set(options.name, keys);
      }
    }
    const assets: Record<string, StatsAssets> = {};

    chunks.forEach((chunk) => {
      // Optimizers can merge equal expose chunks under just one chunk name.
      // Their named groups still identify every expose that loads those assets.
      const names = new Set([
        chunk.name,
        ...[...chunk.groupsIterable].map((group) => group.name),
      ]);
      const assetKeys = new Set<string>();
      for (const name of names) {
        if (typeof name !== 'string') continue;
        // Split chunks retain the expose name followed by a hash suffix.
        const matchedKey = exposeKeysByChunk.has(name)
          ? name
          : [...exposeKeysByChunk.keys()].find((key) =>
              name.startsWith(key + '-'),
            );
        if (matchedKey) {
          for (const key of exposeKeysByChunk.get(matchedKey)!)
            assetKeys.add(key);
        }
      }
      if (!assetKeys.size) return;
      const chunkAssets = getAssetsByChunk(chunk, entryPointNames);

      for (const assetKey of assetKeys) {
        if (!assets[assetKey]) {
          assets[assetKey] = chunkAssets;
        } else {
          // Merge split chunk assets, deduplicating with Set
          assets[assetKey] = {
            js: {
              sync: [
                ...new Set([
                  ...assets[assetKey].js.sync,
                  ...chunkAssets.js.sync,
                ]),
              ],
              async: [
                ...new Set([
                  ...assets[assetKey].js.async,
                  ...chunkAssets.js.async,
                ]),
              ],
            },
            css: {
              sync: [
                ...new Set([
                  ...assets[assetKey].css.sync,
                  ...chunkAssets.css.sync,
                ]),
              ],
              async: [
                ...new Set([
                  ...assets[assetKey].css.async,
                  ...chunkAssets.css.async,
                ]),
              ],
            },
          };
        }
      }
    });

    return assets;
  }
  private _getProvideSharedAssets(
    compilation: Compilation,
    stats: StatsCompilation,
    entryPointNames: string[],
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
        if (!chunk) {
          return;
        }
        [...chunk.groupsIterable].forEach((group) => {
          if (group.name && !entryPointNames.includes(group.name)) {
            manifestOverrideChunkIDMap[sharedModuleName].sync.add(group.id);
          }
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
    extraOptions?: object,
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
              layer: exposes[exposeKey].layer,
            },
          });
        });
        stats.shared = Object.entries(
          this._sharedManager.normalizedOptions,
        ).reduce<StatsShared[]>((sum, cur) => {
          const [pkgName, normalizedShareOptions] = cur;
          sum.push(
            getShareItem({
              pkgName,
              normalizedShareOptions,
              pkgVersion: normalizedShareOptions.version || UNKNOWN_MODULE_NAME,
              hostName: name,
            }),
          );
          return sum;
        }, []);
        return stats;
      }

      const graph =
        this._bundler === 'webpack' &&
        !(typeof manifestOptions === 'object' && manifestOptions.useLegacyStats)
          ? collectGraph(compilation, {
              name: name!,
              exposes: this._containerManager.containerPluginExposesOptions,
              shared: this._sharedManager.normalizedOptions,
              remotes: this._remoteManager.normalizedOptions,
            })
          : undefined;

      if (graph) {
        Object.assign(stats, graph);
      } else {
        const webpackStats = compilation.getStats().toJson({
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
          ...(this._bundler === 'webpack' ? { cached: true } : {}),
          cachedModules: true,
        });
        const moduleHandler = new ModuleHandler(
          this._options,
          webpackStats.modules || [],
          { bundler: this._bundler },
        );
        const { remotes, exposesMap, sharedMap } = moduleHandler.collect();
        const entryPointNames = [...compilation.entrypoints.keys()];
        const sharedAssets = this._getProvideSharedAssets(
          compilation,
          webpackStats,
          entryPointNames,
        );
        const moduleAssets = this._getModuleAssets(
          compilation,
          entryPointNames,
        );
        for (const [key, shared] of Object.entries(sharedMap)) {
          if (sharedAssets[key]) shared.assets = sharedAssets[key];
        }
        for (const [key, expose] of Object.entries(exposesMap)) {
          if (moduleAssets[key]) expose.assets = moduleAssets[key];
        }
        stats.remotes = remotes;
        stats.shared = Object.values(sharedMap);
        stats.exposes = Object.values(exposesMap);
      }

      const remoteNames = new Set(
        stats.remotes.map((remote) => remote.federationContainerName),
      );
      stats.remotes = stats.remotes.map((remote) => ({
        ...remote,
        usedIn: Array.from(remote.usedIn),
      }));
      for (const remote of this._remoteManager.statsRemoteWithEmptyUsedIn) {
        if (!remoteNames.has(remote.federationContainerName))
          stats.remotes.push(remote);
      }
      stats.shared = stats.shared.map((shared) => ({
        ...shared,
        usedIn: Array.from(shared.usedIn),
      }));
      const sharedAssets = new Set<unknown>(
        stats.shared.flatMap(({ assets: { js, css } }) => [
          ...js.sync,
          ...js.async,
          ...css.async,
          css.sync,
        ]),
      );
      stats.exposes = stats.exposes.map((expose) => {
        const { js, css } = expose.assets;
        return {
          ...expose,
          ...(expose.requires
            ? { requires: [...new Set(expose.requires)] }
            : {}),
          assets: {
            js: {
              sync: js.sync.filter((asset) => !sharedAssets.has(asset)),
              async: js.async.filter((asset) => !sharedAssets.has(asset)),
            },
            css: {
              sync: css.sync.filter((asset) => !sharedAssets.has(asset)),
              async: css.async.filter((asset) => !sharedAssets.has(asset)),
            },
          },
        };
      });

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

  updateStats(stats: Stats, compiler: Compiler): Stats {
    const { metaData } = stats;
    const configuredRemoteEntryType = this._options.library?.type;
    if (configuredRemoteEntryType && metaData.remoteEntry) {
      // Rspack may pre-emit stats with the default `global` type even when
      // the configured container library and emitted remote entry are ESM.
      // The configured library is authoritative for runtime loader selection.
      metaData.remoteEntry.type = configuredRemoteEntryType;
    }
    if (!metaData.types) {
      metaData.types = getTypesMetaInfo(this._options, compiler.context);
    }
    if (!metaData.pluginVersion) {
      metaData.pluginVersion = this._pluginVersion;
    }
    this.setMetaDataPublicPath(metaData, compiler);
    return stats;
  }

  async generateStats(
    compiler: Compiler,
    compilation: Compilation,
  ): Promise<Stats> {
    try {
      const stats = await this._generateStats(compiler, compilation);
      return stats;
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
