import {
  GlobalModuleInfo,
  ModuleInfo,
  isManifestProvider,
  getResourceUrl,
  isBrowserEnv,
} from '@module-federation/sdk';
import {
  EntryAssets,
  ModuleFederationRuntimePlugin,
  PreloadAssets,
  PreloadConfig,
  PreloadOptions,
  RemoteInfoOptionalVersion,
  Remote,
} from '../type';
import { assignRemoteInfo } from './snapshot';
import { getInfoWithoutType, getPreloaded, setPreloaded } from '../global';
import { ModuleFederation } from '../core';
import { defaultPreloadArgs, normalizePreloadExposes } from '../utils/preload';
import { getRegisteredShare } from '../shared';
import {
  arrayOptions,
  getFMId,
  getRemoteEntryInfoFromSnapshot,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
} from '../utils';
declare global {
  // eslint-disable-next-line no-var
  var __INIT_VMOK_DEPLOY_GLOBAL_DATA__: boolean | undefined;
}
type SnapshotVisitor = (
  snapshotInfo: ModuleInfo,
  remoteInfo: RemoteInfoOptionalVersion,
  isRoot: boolean,
) => void;
function walkSnapshot(
  globalSnapshot: GlobalModuleInfo,
  remoteInfo: RemoteInfoOptionalVersion,
  visit: SnapshotVisitor,
  isRoot: boolean,
  memo: Record<string, boolean> = {},
  remoteSnapshot?: ModuleInfo,
): void {
  const id = getFMId(remoteInfo);
  const { value: snapshotValue } = getInfoWithoutType(globalSnapshot, id);
  const effectiveSnapshot = remoteSnapshot || snapshotValue;
  if (!effectiveSnapshot || isManifestProvider(effectiveSnapshot)) {
    return;
  }
  visit(effectiveSnapshot, remoteInfo, isRoot);
  const remotesInfo = effectiveSnapshot.remotesInfo;
  if (!remotesInfo) return;
  for (const key of Object.keys(remotesInfo)) {
    if (memo[key]) continue;
    memo[key] = true;
    const parts = key.split(':');
    const name = parts.length <= 2 ? parts[0] : parts[1];
    const remoteValue = remotesInfo[key];
    walkSnapshot(
      globalSnapshot,
      { name, version: remoteValue.matchedVersion },
      visit,
      false,
      memo,
      undefined,
    );
  }
}
const EMPTY_ASSETS: PreloadAssets = {
  cssAssets: [],
  jsAssetsWithoutEntry: [],
  entryAssets: [],
};
const isExisted = (type: 'link' | 'script', url: string) =>
  document.querySelector(
    `${type}[${type === 'link' ? 'href' : 'src'}="${url}"]`,
  );
function resolvePreloadConfig(
  rootConfig: PreloadConfig,
  depsRemote: PreloadConfig['depsRemote'],
  remoteInfo: RemoteInfoOptionalVersion,
  isRoot: boolean,
): PreloadConfig | null {
  if (isRoot) return rootConfig;
  if (Array.isArray(depsRemote)) {
    const matched = depsRemote.find(
      (remoteConfig) =>
        remoteConfig.nameOrAlias === remoteInfo.name ||
        remoteConfig.nameOrAlias === remoteInfo.alias,
    );
    return matched ? defaultPreloadArgs(matched) : null;
  }
  if (depsRemote === true) return rootConfig;
  return null;
}
function mapAssets(
  snapshot: ModuleInfo,
  assets: string[],
  filter?: PreloadConfig['filter'],
): string[] {
  const mapped = assets.map((asset) => getResourceUrl(snapshot, asset));
  return filter ? mapped.filter(filter) : mapped;
}
function collectEntryAsset(
  entryAssets: EntryAssets[],
  snapshot: ModuleInfo,
  remoteInfo: RemoteInfoOptionalVersion,
): void {
  const entryInfo = getRemoteEntryInfoFromSnapshot(snapshot);
  const url = entryInfo.url ? getResourceUrl(snapshot, entryInfo.url) : '';
  if (!url) return;
  entryAssets.push({
    name: remoteInfo.name,
    moduleInfo: {
      name: remoteInfo.name,
      entry: url,
      type: 'remoteEntryType' in snapshot ? snapshot.remoteEntryType : 'global',
      entryGlobalName:
        'globalName' in snapshot ? snapshot.globalName : remoteInfo.name,
      shareScope: '',
      version: 'version' in snapshot ? snapshot.version : undefined,
    },
    url,
  });
}
function collectModuleAssets(
  origin: ModuleFederation,
  snapshot: ModuleInfo,
  remoteInfo: RemoteInfoOptionalVersion,
  preloadConfig: PreloadConfig,
  cssAssets: string[],
  jsAssets: string[],
): void {
  if (!('modules' in snapshot)) return;
  const exposes = normalizePreloadExposes(preloadConfig.exposes);
  const modules = exposes.length
    ? snapshot.modules.filter((m) => exposes.includes(m.moduleName))
    : snapshot.modules;
  if (!modules?.length) return;
  for (const info of modules) {
    const fullPath = `${remoteInfo.name}/${info.moduleName}`;
    origin.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
      id: info.moduleName === '.' ? remoteInfo.name : fullPath,
      name: remoteInfo.name,
      remoteSnapshot: snapshot,
      preloadConfig,
      remote: remoteInfo as Remote,
      origin,
    });
    if (getPreloaded(fullPath)) continue;
    if (preloadConfig.resourceCategory === 'all') {
      cssAssets.push(
        ...mapAssets(snapshot, info.assets.css.async, preloadConfig.filter),
      );
      cssAssets.push(
        ...mapAssets(snapshot, info.assets.css.sync, preloadConfig.filter),
      );
      jsAssets.push(
        ...mapAssets(snapshot, info.assets.js.async, preloadConfig.filter),
      );
      jsAssets.push(
        ...mapAssets(snapshot, info.assets.js.sync, preloadConfig.filter),
      );
    } else {
      cssAssets.push(
        ...mapAssets(snapshot, info.assets.css.sync, preloadConfig.filter),
      );
      jsAssets.push(
        ...mapAssets(snapshot, info.assets.js.sync, preloadConfig.filter),
      );
    }
    setPreloaded(fullPath);
  }
}
function collectLoadedSharedAssets(
  origin: ModuleFederation,
  remoteSnapshot: ModuleInfo,
  loadedSharedJsAssets: Set<string>,
  loadedSharedCssAssets: Set<string>,
): void {
  if (!remoteSnapshot.shared?.length) return;
  for (const shared of remoteSnapshot.shared) {
    const shareInfos = origin.options.shared?.[shared.sharedName];
    if (!shareInfos) continue;
    const matched = shared.version
      ? shareInfos.find((s) => s.version === shared.version)
      : shareInfos;
    if (!matched) continue;
    for (const shareInfo of arrayOptions(matched)) {
      const { shared: reg } =
        getRegisteredShare(
          origin.shareScopeMap,
          shared.sharedName,
          shareInfo,
          origin.sharedHandler.hooks.lifecycle.resolveShare,
        ) || {};
      if (reg && typeof reg.lib === 'function') {
        shared.assets.js.sync.forEach((a) => loadedSharedJsAssets.add(a));
        shared.assets.css.sync.forEach((a) => loadedSharedCssAssets.add(a));
      }
    }
  }
}
function filterExistingAssets(
  type: 'link' | 'script',
  assets: string[],
  loadedSet: Set<string>,
): string[] {
  return assets.filter(
    (asset) => !loadedSet.has(asset) && !isExisted(type, asset),
  );
}
// eslint-disable-next-line max-lines-per-function
export function generatePreloadAssets(
  origin: ModuleFederation,
  preloadOptions: PreloadOptions[number],
  remote: RemoteInfoOptionalVersion,
  globalSnapshot: GlobalModuleInfo,
  remoteSnapshot: ModuleInfo,
): PreloadAssets {
  const cssAssets: string[] = [];
  const jsAssets: string[] = [];
  const entryAssets: EntryAssets[] = [];
  const loadedSharedJsAssets = new Set<string>();
  const loadedSharedCssAssets = new Set<string>();
  const { preloadConfig: rootPreloadConfig } = preloadOptions;
  const { depsRemote } = rootPreloadConfig;
  walkSnapshot(
    globalSnapshot,
    remote,
    (snapshot, remoteInfo, isRoot) => {
      const preloadConfig = resolvePreloadConfig(
        rootPreloadConfig,
        depsRemote,
        remoteInfo,
        isRoot,
      );
      if (!preloadConfig) return;
      collectEntryAsset(entryAssets, snapshot, remoteInfo);
      collectModuleAssets(
        origin,
        snapshot,
        remoteInfo,
        preloadConfig,
        cssAssets,
        jsAssets,
      );
    },
    true,
    {},
    remoteSnapshot,
  );
  collectLoadedSharedAssets(
    origin,
    remoteSnapshot,
    loadedSharedJsAssets,
    loadedSharedCssAssets,
  );
  return {
    cssAssets: filterExistingAssets('link', cssAssets, loadedSharedCssAssets),
    jsAssetsWithoutEntry: filterExistingAssets(
      'script',
      jsAssets,
      loadedSharedJsAssets,
    ),
    entryAssets: entryAssets.filter((entry) => !isExisted('script', entry.url)),
  };
}
export const generatePreloadAssetsPlugin: () => ModuleFederationRuntimePlugin =
  () => ({
    name: 'generate-preload-assets-plugin',
    async generatePreloadAssets({
      origin,
      preloadOptions,
      remoteInfo,
      remote,
      globalSnapshot,
      remoteSnapshot,
    }) {
      if (!isBrowserEnv()) return EMPTY_ASSETS;
      if (isRemoteInfoWithEntry(remote) && isPureRemoteEntry(remote)) {
        return {
          cssAssets: [],
          jsAssetsWithoutEntry: [],
          entryAssets: [
            {
              name: remote.name,
              url: remote.entry,
              moduleInfo: {
                name: remoteInfo.name,
                entry: remote.entry,
                type: remoteInfo.type || 'global',
                entryGlobalName: '',
                shareScope: '',
              },
            },
          ],
        };
      }
      assignRemoteInfo(remoteInfo, remoteSnapshot);
      return generatePreloadAssets(
        origin,
        preloadOptions,
        remoteInfo,
        globalSnapshot,
        remoteSnapshot,
      );
    },
  });
