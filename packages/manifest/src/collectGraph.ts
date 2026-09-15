import type { Compilation, Module, Chunk } from 'webpack';
import type DependenciesBlock from 'webpack/lib/DependenciesBlock';
import type {
  StatsAssets,
  StatsExpose,
  StatsRemote,
  StatsShared,
  Stats,
} from '@module-federation/sdk';
import type {
  ContainerManager,
  RemoteManager,
  SharedManager,
} from '@module-federation/managers';
import path from 'path';
import { getExposeItem, getShareItem } from './ModuleHandler';
import {
  getAssetsByChunk,
  getAssetsByChunkIDs,
  getSharedIdentityKey,
} from './utils';

type ProvideData = {
  name: string;
  version: string;
  shareScope: string | string[];
  shareConfig: { layer?: string };
};
type SharedData =
  | ProvideData
  | {
      shareKey: string;
      shareScope: string | string[];
      shareConfig: { layer?: string };
    };
type RemoteModule = Module & { request: string; internalRequest: string };

export function collectGraph(
  compilation: Compilation,
  {
    name: hostName,
    exposes,
    shared,
    remotes: configuredRemotes,
  }: {
    name: string;
    exposes: ContainerManager['containerPluginExposesOptions'];
    shared: SharedManager['normalizedOptions'];
    remotes: RemoteManager['normalizedOptions'];
  },
): Pick<Stats, 'exposes' | 'shared' | 'remotes'> | undefined {
  const { moduleGraph, chunkGraph, codeGenerationResults } = compilation;
  if (!codeGenerationResults) return undefined;
  const sharedData = new Map<Module, SharedData>();
  for (const module of compilation.modules) {
    if (!['provide-module', 'consume-shared-module'].includes(module.type))
      continue;
    for (const runtime of chunkGraph.getModuleRuntimes(module)) {
      if (!codeGenerationResults.has(module, runtime)) continue;
      const key =
        module.type === 'provide-module'
          ? 'share-init-option'
          : 'consume-shared';
      const data = codeGenerationResults.getData(module, runtime, key);
      if (!data) return undefined;
      sharedData.set(module, data);
      break;
    }
  }

  const exposesMap: Record<string, StatsExpose> = {};
  const sharedMap: Record<string, StatsShared> = {};
  const remotes: StatsRemote[] = [];
  const sharedKeys = new Map<Module, string>();
  const entryNames = [...compilation.entrypoints.keys()];

  const addAssets = (target: StatsAssets, chunks: Iterable<Chunk>) => {
    for (const chunk of chunks) {
      const assets = getAssetsByChunk(chunk, entryNames);
      for (const type of ['js', 'css'] as const)
        for (const loading of ['sync', 'async'] as const)
          target[type][loading] = [
            ...new Set([...target[type][loading], ...assets[type][loading]]),
          ];
    }
  };
  const dependencies = function* (block: DependenciesBlock): Generator<Module> {
    for (const dependency of block.dependencies) {
      const module = moduleGraph.getModule(dependency);
      if (module) yield module;
    }
    for (const child of block.blocks) yield* dependencies(child);
  };

  for (const [key, file] of Object.entries(exposes || {})) {
    exposesMap[key] = getExposeItem({
      exposeKey: key,
      name: hostName,
      file,
    });
  }

  const configuredShared = Object.entries(shared).sort(
    ([a, av], [b, bv]) => (bv.shareKey || b).length - (av.shareKey || a).length,
  );
  const providersFirst = [...sharedData].sort(
    ([a], [b]) =>
      Number(a.type === 'consume-shared-module') -
      Number(b.type === 'consume-shared-module'),
  );
  for (const [module, data] of providersFirst) {
    const consume = module.type === 'consume-shared-module';
    const name = 'shareKey' in data ? data.shareKey : data.name;
    const scope = data.shareScope;
    const layer = data.shareConfig.layer ?? undefined;
    const layered = layer !== undefined || Array.isArray(scope);
    const key = layered ? getSharedIdentityKey(name, scope, layer) : name;
    const configured = configuredShared.filter(([key, value]) => {
      const shareKey = value.shareKey || key;
      return (
        (shareKey === name ||
          (shareKey.endsWith('/') && name.startsWith(shareKey))) &&
        JSON.stringify(value.shareScope ?? 'default') === JSON.stringify(scope)
      );
    });
    const normalized = (configured.find(([, value]) => value.layer === layer) ??
      configured.find(([, value]) => value.layer === undefined))?.[1];
    const version =
      'version' in data
        ? JSON.parse(data.version)
        : (normalized?.version ?? sharedMap[key]?.version);
    if (!name || !version) continue;
    sharedKeys.set(module, key);
    if (!sharedMap[key]) {
      const row = getShareItem({
        pkgName: name,
        pkgVersion: version,
        normalizedShareOptions: layered ? normalized : shared[name],
        hostName,
      });
      if (layered) {
        row.id = `${hostName}:shared:${key}`;
        if (layer !== undefined) row.layer = layer;
        if (scope !== 'default') row.shareScope = scope;
      }
      sharedMap[key] = row;
    }
    if (consume) {
      const ids = new Set<string | number>();
      for (const fallback of dependencies(module)) {
        for (const chunk of chunkGraph.getModuleChunksIterable(fallback)) {
          if (chunk.id !== null) ids.add(chunk.id);
          for (const group of chunk.groupsIterable) {
            if (group.name && !entryNames.includes(group.name))
              for (const sibling of group.chunks)
                if (sibling.id !== null) ids.add(sibling.id);
          }
        }
      }
      const assets = getAssetsByChunkIDs(compilation, { shared: ids }).shared;
      for (const type of ['js', 'css'] as const)
        sharedMap[key].assets[type].sync = [
          ...new Set([...sharedMap[key].assets[type].sync, ...assets[type]]),
        ];
    }
  }

  for (const module of compilation.modules) {
    if (module.type !== 'remote-module') continue;
    const { request, internalRequest } = module as RemoteModule;
    const alias =
      internalRequest === '.'
        ? request
        : request.slice(0, -internalRequest.slice(1).length);
    if (!configuredRemotes[alias]) continue;
    const normalized = configuredRemotes[alias];
    const usedIn = new Set<string>();
    for (const connection of moduleGraph.getIncomingConnections(module)) {
      const resource = connection.originModule?.nameForCondition();
      if (resource)
        usedIn.add(
          path.relative(
            compilation.compiler.context || process.cwd(),
            resource,
          ),
        );
    }
    const row: StatsRemote = {
      alias: normalized.alias,
      consumingFederationContainerName: hostName,
      federationContainerName: normalized.name,
      moduleName: internalRequest.replace('./', ''),
      usedIn: [...usedIn],
      ...('version' in normalized
        ? { version: normalized.version }
        : { entry: normalized.entry }),
    };
    remotes.push(row);
  }

  for (const module of compilation.modules) {
    for (const block of module.blocks) {
      const dependency = block.dependencies.find(
        (dep) => dep.type === 'container exposed',
      );
      if (!dependency) continue;
      const key = (dependency as typeof dependency & { exposedName: string })
        .exposedName;
      const expose = exposesMap[key];
      if (!expose) continue;
      const group = chunkGraph.getBlockChunkGroup(block);
      if (group) addAssets(expose.assets, group.chunks);
      for (const exposed of dependencies(block)) {
        for (const target of [exposed, ...dependencies(exposed)]) {
          const sharedKey = sharedKeys.get(target);
          if (sharedKey) {
            const shared = sharedMap[sharedKey];
            expose.requires.push(shared.name);
            (shared.usedIn as unknown as Set<string>).add(key);
          }
        }
      }
    }
  }
  return {
    exposes: Object.values(exposesMap),
    shared: Object.values(sharedMap),
    remotes,
  };
}
