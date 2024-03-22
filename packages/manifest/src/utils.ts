import { Chunk, Compilation, StatsCompilation, StatsModule } from 'webpack';
import chalk from 'chalk';
import path from 'path';
import {
  StatsAssets,
  moduleFederationPlugin,
  simpleJoinRemoteEntry,
  ManifestFileName,
  StatsFileName,
  normalizeOptions,
  MetaDataTypes,
} from '@module-federation/sdk';
import { retrieveTypesAssetsInfo } from '@module-federation/dts-kit';
import { HOT_UPDATE_SUFFIX, PLUGIN_IDENTIFIER } from './constants';

function getSharedModuleName(name: string): string {
  const [_type, _shared, _module, _shareScope, sharedInfo] = name.split(' ');
  return sharedInfo.split('@').slice(0, -1).join('@');
}

export function getAssetsByChunkIDs(
  compilation: Compilation,
  chunkIDMap: Record<string, Set<string | number>>,
): Record<string, { js: string[]; css: string[] }> {
  const arrayChunks = Array.from(compilation.chunks);
  const assetMap: Record<string, { css: Set<string>; js: Set<string> }> = {};

  Object.keys(chunkIDMap).forEach((key) => {
    const chunkIDs = Array.from(chunkIDMap[key]);
    if (!assetMap[key]) {
      assetMap[key] = {
        css: new Set(),
        js: new Set(),
      };
    }
    chunkIDs.forEach((chunkID) => {
      const chunk = arrayChunks.find((item) => item.id === chunkID);
      if (chunk) {
        [...chunk.files].forEach((asset) => {
          if (asset.endsWith('.css')) {
            assetMap[key].css.add(asset);
          } else {
            if (process.env['NODE_ENV'] === 'development') {
              if (!asset.includes(HOT_UPDATE_SUFFIX)) {
                assetMap[key].js.add(asset);
              }
            } else {
              assetMap[key].js.add(asset);
            }
          }
        });
      }
    });
  });

  const assets: Record<string, { js: string[]; css: string[] }> = {};
  Object.keys(assetMap).map((key) => {
    assets[key] = {
      js: Array.from(assetMap[key].js),
      css: Array.from(assetMap[key].css),
    };
  });

  return assets;
}

export function findChunk(
  id: string | number,
  chunks: Set<Chunk>,
): Chunk | void {
  for (const chunk of chunks) {
    if (id === chunk.id) {
      return chunk;
    }
  }
}

export function getSharedModules(
  stats: StatsCompilation,
  sharedModules: StatsModule[],
): [string, StatsModule][] {
  // 获取入口文件就是实际内容的 module
  const entryContentModuleNames: string[] = [];
  let effectiveSharedModules: [string, StatsModule][] =
    stats.modules?.reduce(
      (sum, module) => {
        for (const sharedModule of sharedModules) {
          if (sharedModule.name === module.issuerName) {
            entryContentModuleNames.push(sharedModule.name!);
            sum.push([getSharedModuleName(module.issuerName!), module]);
            return sum;
          }
        }
        return sum;
      },
      [] as [string, StatsModule][],
    ) || [];

  // 获取入口文件仅作为 Re Export 的 module
  const entryReExportModules = sharedModules.filter(
    (sharedModule) => !entryContentModuleNames.includes(sharedModule.name!),
  );

  if (entryReExportModules.length) {
    effectiveSharedModules = effectiveSharedModules.concat(
      stats.modules!.reduce(
        (sum, module) => {
          let flag = false;
          for (const entryReExportModule of entryReExportModules) {
            if (flag) {
              break;
            }
            if (module.reasons) {
              for (const issueModule of module.reasons) {
                if (issueModule.moduleName === entryReExportModule.name) {
                  sum.push([
                    getSharedModuleName(entryReExportModule.name!),
                    module,
                  ]);
                  flag = true;
                  break;
                }
              }
            }
          }
          return sum;
        },
        [] as [string, StatsModule][],
      ),
    );
  }
  return effectiveSharedModules;
}

export function getAssetsByChunk(chunk: Chunk): StatsAssets {
  const assesSet = {
    js: {
      sync: new Set() as Set<string>,
      async: new Set() as Set<string>,
    },
    css: {
      sync: new Set() as Set<string>,
      async: new Set() as Set<string>,
    },
  };

  const collectChunkFiles = (
    targetChunk: Chunk,
    type: 'sync' | 'async',
  ): void => {
    [...targetChunk.groupsIterable].forEach((chunkGroup) => {
      chunkGroup.getFiles().forEach((file) => {
        if (file.endsWith('.css')) {
          assesSet.css[type].add(file);
        } else {
          assesSet.js[type].add(file);
        }
      });
    });
  };
  collectChunkFiles(chunk, 'sync');

  [...chunk.getAllAsyncChunks()].forEach((asyncChunk) => {
    asyncChunk.files.forEach((file) => {
      if (file.endsWith('.css')) {
        assesSet.css.async.add(file);
      } else {
        assesSet.js.async.add(file);
      }
    });
    collectChunkFiles(asyncChunk, 'async');
  });

  const assets: StatsAssets = {
    js: {
      sync: Array.from(assesSet.js.sync),
      async: Array.from(assesSet.js.async),
    },
    css: {
      sync: Array.from(assesSet.css.sync),
      async: Array.from(assesSet.css.async),
    },
  };

  return assets;
}

export function assert(condition: any, msg: string): asserts condition {
  if (!condition) {
    error(msg);
  }
}

export function error(msg: string | Error | unknown): never {
  throw new Error(`[ ${PLUGIN_IDENTIFIER} ]: ${msg}`);
}

export function isDev(): boolean {
  return process.env['NODE_ENV'] === 'development';
}

export function getFileNameWithOutExt(str: string): string {
  return str.replace(path.extname(str), '');
}

export function getFileName(
  manifestOptions?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest'],
): {
  statsFileName: string;
  manifestFileName: string;
} {
  if (!manifestOptions) {
    return {
      statsFileName: StatsFileName,
      manifestFileName: ManifestFileName,
    };
  }

  let filePath =
    typeof manifestOptions === 'boolean' ? '' : manifestOptions.filePath || '';
  let fileName =
    typeof manifestOptions === 'boolean' ? '' : manifestOptions.fileName || '';

  const JSON_EXT = '.json';
  const addExt = (name: string): string => {
    if (name.endsWith(JSON_EXT)) {
      return name;
    }
    return `${name}${JSON_EXT}`;
  };
  const insertSuffix = (name: string, suffix: string): string => {
    return name.replace(JSON_EXT, `${suffix}${JSON_EXT}`);
  };
  const manifestFileName = fileName ? addExt(fileName) : ManifestFileName;
  const statsFileName = fileName
    ? insertSuffix(manifestFileName, '-stats')
    : StatsFileName;

  return {
    statsFileName: simpleJoinRemoteEntry(filePath, statsFileName),
    manifestFileName: simpleJoinRemoteEntry(filePath, manifestFileName),
  };
}

export function getTypesMetaInfo(
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions,
  context: string,
): MetaDataTypes {
  const defaultRemoteOptions = {
    generateAPITypes: true,
    compileInChildProcess: true,
  };
  const defaultTypesMetaInfo: MetaDataTypes = {
    path: '',
    name: '',
    zip: '',
    api: '',
  };
  try {
    const normalizedDtsOptions =
      normalizeOptions<moduleFederationPlugin.PluginDtsOptions>(
        true,
        {
          disableGenerateTypes: false,
          remote: defaultRemoteOptions,
          host: {},
        },
        'mfOptions.dts',
      )(pluginOptions.dts);
    if (normalizedDtsOptions === false) {
      return defaultTypesMetaInfo;
    }

    const normalizedRemote =
      normalizeOptions<moduleFederationPlugin.DtsRemoteOptions>(
        true,
        defaultRemoteOptions,
        'mfOptions.dts.remote',
      )(normalizedDtsOptions.remote);

    if (normalizedRemote === false) {
      return defaultTypesMetaInfo;
    }

    const { apiFileName, zipName } = retrieveTypesAssetsInfo({
      ...normalizedRemote,
      context,
      moduleFederationConfig: pluginOptions,
    });

    return {
      path: '',
      name: '',
      zip: zipName,
      api: apiFileName,
    };
  } catch (err) {
    console.warn(
      chalk`{bold {yellow [ ${PLUGIN_IDENTIFIER} ]: getTypesMetaInfo failed, it will use the default types meta info, and the errors as belows: ${err} }}`,
    );
    return defaultTypesMetaInfo;
  }
}
