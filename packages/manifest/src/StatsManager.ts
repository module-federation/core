/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-depth */

import path from 'path';
import {
  StatsShared,
  StatsExpose,
  StatsRemote,
  StatsBuildInfo,
  BasicStatsMetaData,
  StatsMetaData,
  Stats,
  StatsAssets,
  StatsRemoteVal,
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
} from './utils';
import {
  ContainerManager,
  RemoteManager,
  SharedManager,
  PKGJsonManager,
  utils,
} from '@module-federation/managers';

declare const __VERSION__: string;

class StatsManager {
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions = {};
  private _publicPath?: string;
  private _pluginVersion?: string;
  private _containerManager: ContainerManager = new ContainerManager();
  private _remoteManager: RemoteManager = new RemoteManager();
  private _sharedManager: SharedManager = new SharedManager();
  private _pkgJsonManager: PKGJsonManager = new PKGJsonManager();

  get buildInfo(): StatsBuildInfo {
    const type = this._pkgJsonManager.getExposeGarfishModuleType();
    const pkg = this._pkgJsonManager.readPKGJson(process.cwd());

    return {
      buildVersion: utils.getBuildVersion(),
      buildName: utils.getBuildName() || pkg['name'],
    };
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

      const remoteEntryPoint = compilation.entrypoints.get(name!);
      assert(remoteEntryPoint, 'Can not get remoteEntry entryPoint!');
      const remoteEntryNameChunk = remoteEntryPoint.chunks.find(
        (c) => c.name && c.name === name,
      );
      assert(remoteEntryNameChunk, 'Can not get remoteEntry chunk!');
      assert(
        remoteEntryNameChunk.files.size > 1,
        'remoteEntry chunk should not have multiple files!',
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
        const exposeKey = exposeFileNameImportMap[chunk.name];
        assets[exposeKey] = getAssetsByChunk(chunk);
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
        chunk!.getAllInitialChunks().forEach((syncChunk) => {
          syncChunk.id &&
            manifestOverrideChunkIDMap[sharedModuleName].sync.add(syncChunk.id);
        });

        chunk!.getAllAsyncChunks().forEach((asyncChunk) => {
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
      const remotes: StatsRemote[] = [];
      const remotesConsumerMap: { [remoteKey: string]: StatsRemote } = {};

      const exposesMap: { [exposeKey: string]: StatsExpose } = {};
      const sharedMap: { [sharedKey: string]: StatsShared } = {};

      const remoteManagerNormalizedOptions =
        this._remoteManager.normalizedOptions;
      const sharedManagerNormalizedOptions =
        this._sharedManager.normalizedOptions;

      filteredModules.forEach(({ identifier, reasons, nameForCondition }) => {
        if (!identifier) {
          return;
        }
        const data = identifier.split(' ');
        if (data[0] === 'remote') {
          if (data.length === 4) {
            const moduleName = data[3].replace('./', '');
            const remoteAlias = data[2].replace(
              'webpack/container/reference/',
              '',
            );
            const normalizedRemote =
              remoteManagerNormalizedOptions[remoteAlias];
            const basicRemote: StatsRemoteVal = {
              alias: normalizedRemote.alias,
              consumingGarfishModuleName: name,
              garfishModuleName:
                remoteManagerNormalizedOptions[remoteAlias].name,
              moduleName,
              // @ts-ignore to deduplicate
              usedIn: new Set(),
            };
            if (!nameForCondition) {
              return;
            }
            let remote: StatsRemote;
            if ('version' in normalizedRemote) {
              remote = {
                ...basicRemote,
                version: normalizedRemote.version,
              };
            } else {
              remote = {
                ...basicRemote,
                entry: normalizedRemote.entry,
              };
            }

            remotes.push(remote);
            remotesConsumerMap[nameForCondition] = remote;
          }
          if (reasons) {
            reasons.forEach(({ userRequest, resolvedModule, type }) => {
              if (
                userRequest &&
                resolvedModule &&
                remotesConsumerMap[userRequest]
              ) {
                // @ts-ignore to deduplicate
                remotesConsumerMap[userRequest].usedIn.add(
                  resolvedModule.replace('./', ''),
                );
              }
            });
          }
        } else if (data[0] === 'container' && data[1] === 'entry') {
          JSON.parse(data[3]).forEach(([prefixedName, file]) => {
            const exposeModuleName = prefixedName.replace('./', '');
            exposesMap[file.import[0]] = {
              path: prefixedName,
              id: `${name}:${exposeModuleName}`,
              name: exposeModuleName,
              // @ts-ignore to deduplicate
              requires: new Set(),
              file: path.relative(process.cwd(), file.import[0]),
              assets: {
                js: {
                  async: [],
                  sync: [],
                },
                css: {
                  async: [],
                  sync: [],
                },
              },
            };
          });
        }
      });

      filteredModules.forEach((mod) => {
        const { identifier, issuerName, reasons, moduleType } = mod;
        if (!identifier) {
          return;
        }
        if (moduleType === 'provide-module') {
          const data = identifier.split(' ');
          let pkgName, pkgVersion;
          if (data[3].startsWith('@')) {
            const splitInfo = data[3].split('@');
            splitInfo[0] = '@';
            pkgName = splitInfo[0] + splitInfo[1];
            pkgVersion = splitInfo[2];
          } else if (data[3].includes('@')) {
            [pkgName, pkgVersion] = data[3].split('@');
          } else {
            pkgName = data[2];
            pkgVersion = sharedManagerNormalizedOptions[pkgName].version;
          }

          sharedMap[pkgName] = {
            ...sharedMap[pkgName],
            ...sharedManagerNormalizedOptions[pkgName],
            id: name!,
            name: pkgName,
            version: pkgVersion,
            assets: {
              js: {
                async: [],
                sync: [],
              },
              css: {
                async: [],
                sync: [],
              },
            },
            // @ts-ignore to deduplicate
            usedIn: new Set(),
          };
          if (issuerName) {
            // This is a hack
            if (exposesMap[issuerName]) {
              // @ts-ignore to deduplicate
              exposesMap[issuerName].requires.add(pkgName);
              // @ts-ignore to deduplicate
              sharedMap[pkgName].usedIn.add(issuerName);
            }
          }
          if (reasons) {
            reasons.forEach(({ module }) => {
              // filters out entrypoints
              if (module) {
                if (exposesMap[module]) {
                  // @ts-ignore to deduplicate
                  exposesMap[module].requires.add(pkgName);
                  // @ts-ignore to deduplicate
                  sharedMap[pkgName].usedIn.add(module);
                }
              }
            });
          }
        }

        if (moduleType === 'vmok-consume-shared-module') {
          const data = identifier.split('|');
          let pkgVersion = '';
          const pkgName = data[2];

          if (data[3].startsWith('=')) {
            pkgVersion = data[3].replace('=', '');
          } else {
            pkgVersion = sharedManagerNormalizedOptions[pkgName].version;
          }

          sharedMap[pkgName] = {
            ...sharedManagerNormalizedOptions[pkgName],
            id: pkgName,
            name: pkgName,
            version: pkgVersion,
            assets: {
              js: {
                async: [],
                sync: [],
              },
              css: {
                async: [],
                sync: [],
              },
            },
            // @ts-ignore to deduplicate
            usedIn: new Set(),
          };
          if (issuerName) {
            // This is a hack
            if (exposesMap[issuerName]) {
              // @ts-ignore to deduplicate
              exposesMap[issuerName].requires.add(pkgName);
              // @ts-ignore to deduplicate
              sharedMap[pkgName].usedIn.add(issuerName);
            }
          }
          if (reasons) {
            reasons.forEach(({ module }) => {
              // filters out entrypoints
              if (module) {
                if (exposesMap[module]) {
                  // @ts-ignore to deduplicate
                  exposesMap[module].requires.add(pkgName);
                  // @ts-ignore to deduplicate
                  sharedMap[pkgName].usedIn.add(module);
                }
              }
            });
          }
        }
      });

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
    { pluginVersion }: { pluginVersion: string },
  ): void {
    this._options = options;
    this._pluginVersion = pluginVersion;
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
      const { manifest: manifestOptions = {} } = this._options;
      let statsFilePath =
        typeof manifestOptions === 'boolean'
          ? ''
          : manifestOptions.filePath || '';

      const statsFileName = simpleJoinRemoteEntry(statsFilePath, StatsFileName);
      compilation.emitAsset(
        statsFileName,
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
      console.error('PublicPath can only be string!');
      process.exit(1);
    }
  }
}

export { StatsManager };
