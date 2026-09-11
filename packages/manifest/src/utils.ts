import { Chunk, Compilation } from 'webpack';
import type {
  StatsCompilation,
  StatsModule,
} from 'webpack/lib/stats/DefaultStatsFactoryPlugin';
import path from 'path';
import fs from 'fs';
import {
  StatsAssets,
  moduleFederationPlugin,
  simpleJoinRemoteEntry,
  ManifestFileName,
  StatsFileName,
  normalizeOptions,
  MetaDataTypes,
} from '@module-federation/sdk';
import {
  isTSProject,
  retrieveTypesAssetsInfo,
} from '@module-federation/dts-plugin/core';
import { HOT_UPDATE_SUFFIX, PLUGIN_IDENTIFIER } from './constants';
import logger from './logger';

function isHotFile(file: string) {
  return file.includes(HOT_UPDATE_SUFFIX);
}

const collectAssets = (
  assets: string[],
  jsTargetSet: Set<string>,
  cssTargetSet: Set<string>,
) => {
  assets.forEach((file) => {
    if (file.endsWith('.css')) {
      cssTargetSet.add(file);
    } else {
      if (isDev()) {
        if (!isHotFile(file)) {
          jsTargetSet.add(file);
        }
      } else {
        jsTargetSet.add(file);
      }
    }
  });
};

/** Remove the optional `(layer)` segment without splitting spaces in its name. */
export function splitSharedIdentifier(
  identifier: string,
  scopeTokenIndex: number,
): { tokens: string[]; layer?: string } {
  const tokens = identifier.split(' ');
  if (!tokens[scopeTokenIndex]?.startsWith('(')) return { tokens };
  const remainder = tokens.slice(scopeTokenIndex + 1).join(' ');
  const layered = remainder.match(/^\((.*)\) (\S+@[\s\S]*)$/);
  if (!layered) return { tokens };
  return {
    tokens: [...tokens.slice(0, scopeTokenIndex + 1), ...layered[2].split(' ')],
    layer: layered[1],
  };
}

export function getSharedIdentity(
  identifier: string,
  scopeTokenIndex: number,
  moduleLayer?: string | null,
) {
  const { tokens, layer: readableLayer } = splitSharedIdentifier(
    identifier,
    scopeTokenIndex,
  );
  const webpackConsume = identifier.startsWith('consume-shared-module|')
    ? identifier.split('|')
    : undefined;
  const webpackLayer = webpackConsume?.[8];
  const layer = webpackConsume
    ? (moduleLayer ??
      (webpackLayer === 'undefined' || webpackLayer === 'null'
        ? undefined
        : webpackLayer))
    : readableLayer;
  const suffix = identifier.match(/ \[identity:(.*)\]$/)?.[1];
  if (suffix) {
    const bytes = Buffer.from(suffix);
    let offset = 0;
    const component = () => {
      const end = bytes.indexOf(58, offset);
      if (end < offset) throw new Error('Invalid shared identity');
      const length = Number(bytes.toString('utf8', offset, end));
      if (
        !Number.isSafeInteger(length) ||
        length < 0 ||
        end + 1 + length > bytes.length
      )
        throw new Error('Invalid shared identity');
      offset = end + 1 + length;
      return bytes.toString('utf8', end + 1, offset);
    };
    try {
      const scope = component();
      const marker = String.fromCharCode(bytes[offset++]);
      if (marker !== 'l' && marker !== 'n')
        throw new Error('Invalid shared identity');
      const parsedLayer = marker === 'l' ? component() : undefined;
      const name = component();
      if (offset !== bytes.length) throw new Error('Invalid shared identity');
      const scopeBytes = Buffer.from(scope);
      let cursor = scope.indexOf(':') + 1;
      const scopes: string[] = [];
      const count = scope[0] === 's' ? 1 : Number(scope.slice(1, cursor - 1));
      if (scope[0] === 's') cursor = 1;
      if (
        (scope[0] !== 's' && scope[0] !== 'm') ||
        !Number.isSafeInteger(count) ||
        count < 0
      )
        throw new Error('Invalid shared scope');
      for (let index = 0; index < count; index++) {
        const end = scopeBytes.indexOf(58, cursor);
        const length = Number(scopeBytes.toString('utf8', cursor, end));
        if (
          end < cursor ||
          !Number.isSafeInteger(length) ||
          length < 0 ||
          end + 1 + length > scopeBytes.length
        )
          throw new Error('Invalid shared scope');
        scopes.push(scopeBytes.toString('utf8', end + 1, end + 1 + length));
        cursor = end + 1 + length;
      }
      if (cursor !== scopeBytes.length) throw new Error('Invalid shared scope');
      return {
        key: suffix,
        name,
        layer: parsedLayer,
        shareScope: scope[0] === 's' ? scopes[0] : scopes,
      };
    } catch {
      // Ignore unsupported suffixes and retain the readable-format fallback.
    }
  }
  const shareScope =
    webpackConsume?.[1] || tokens[scopeTokenIndex]?.slice(1, -1) || 'default';
  const nameAndVersion = tokens[scopeTokenIndex + 1] || '';
  const name =
    webpackConsume?.[2] ||
    nameAndVersion.slice(0, nameAndVersion.lastIndexOf('@'));
  const component = (value: string) => `${Buffer.byteLength(value)}:${value}`;
  const key = `${component(`s${component(shareScope)}`)}${layer === undefined ? 'n' : `l${component(layer)}`}${component(name)}`;
  return { key, name, layer, shareScope };
}

function getSharedModuleName(name: string, identifier?: string): string {
  const identity = getSharedIdentity(
    identifier?.includes(' [identity:') ||
      identifier?.startsWith('consume shared module ')
      ? identifier
      : name,
    3,
  );
  return identity.layer !== undefined || Array.isArray(identity.shareScope)
    ? identity.key
    : identity.name;
}

export function getAssetsByChunkIDs(
  compilation: Compilation,
  chunkIDMap: Record<string, Set<string | number>>,
): Record<string, { js: string[]; css: string[] }> {
  const arrayChunks = Array.from(compilation.chunks) as Chunk[];
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
        collectAssets([...chunk.files], assetMap[key].js, assetMap[key].css);
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
            sum.push([
              getSharedModuleName(module.issuerName!, sharedModule.identifier),
              module,
            ]);
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
                    getSharedModuleName(
                      entryReExportModule.name!,
                      entryReExportModule.identifier,
                    ),
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

export function getAssetsByChunk(
  chunk: Chunk,
  entryPointNames: Array<string>,
): StatsAssets {
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
      if (chunkGroup.name && !entryPointNames.includes(chunkGroup.name)) {
        collectAssets(
          chunkGroup.getFiles(),
          assesSet.js[type],
          assesSet.css[type],
        );
      }
    });
  };
  collectChunkFiles(chunk, 'sync');

  [...chunk.getAllAsyncChunks()].forEach((asyncChunk) => {
    collectAssets(
      [...asyncChunk.files],
      assesSet.js['async'],
      assesSet.css['async'],
    );
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
        isTSProject(pluginOptions.dts, context),
        {
          generateTypes: defaultRemoteOptions,
          consumeTypes: {},
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
        'mfOptions.dts.generateTypes',
      )(normalizedDtsOptions.generateTypes);

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
    logger.warn(
      `getTypesMetaInfo failed, it will use the default types meta info, and the errors as belows: ${err}`,
    );
    return defaultTypesMetaInfo;
  }
}
