import type { ShareScopeMap } from '../type';

export type SharedVersions = ShareScopeMap[string][string];
const LAYERED_SHARES = Symbol.for('module-federation.share-scope.layers');
type LayeredShareScope = ShareScopeMap[string] & {
  [LAYERED_SHARES]?: Map<string, Map<string, SharedVersions>>;
};

export function getOwnEntry<T>(entries: Record<string, T>, key: string) {
  return Object.prototype.hasOwnProperty.call(entries, key)
    ? entries[key]
    : undefined;
}

export function defineEntry<T>(
  entries: Record<string, T>,
  key: string,
  value: T,
) {
  Object.defineProperty(entries, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
  return value;
}

// Share scopes are exchanged by reference. Keep ordinary version entries
// unchanged for older runtimes; layered-only packages must not create empty
// enumerable package entries that those runtimes mistake for a provider.
export function getSharedVersions(
  scope: ShareScopeMap[string] | undefined,
  pkgName: string,
  layer?: string | null,
  create = false,
): SharedVersions | undefined {
  if (!scope) return;
  if (layer == null) {
    return (
      getOwnEntry(scope, pkgName) ??
      (create ? defineEntry(scope, pkgName, {}) : undefined)
    );
  }
  const layeredScope = scope as LayeredShareScope;
  let packages = layeredScope[LAYERED_SHARES];
  if (!packages && create) {
    packages = new Map();
    Object.defineProperty(scope, LAYERED_SHARES, {
      value: packages,
      configurable: true,
    });
  }
  let layers = packages?.get(pkgName);
  if (!layers && create) {
    layers = new Map();
    packages!.set(pkgName, layers);
  }
  let versions = layers?.get(layer);
  if (!versions && create) {
    versions = {};
    layers!.set(layer, versions);
  }
  return versions;
}

export function getAllSharedVersions(scope: ShareScopeMap[string]) {
  const entries = Object.entries(scope).map(([pkgName, versions]) => ({
    pkgName,
    layer: undefined as string | undefined,
    versions,
  }));
  for (const [pkgName, layers] of (scope as LayeredShareScope)[
    LAYERED_SHARES
  ] || []) {
    for (const [layer, versions] of layers)
      entries.push({ pkgName, layer, versions });
  }
  return entries;
}

export function removeSharedVersion(
  scope: ShareScopeMap[string],
  pkgName: string,
  layer: string | undefined,
  version: string,
) {
  const versions = getSharedVersions(scope, pkgName, layer);
  if (!versions) return;
  delete versions[version];
  if (Object.keys(versions).length) return;
  if (layer === undefined) {
    delete scope[pkgName];
    return;
  }
  const layeredScope = scope as LayeredShareScope;
  const packages = layeredScope[LAYERED_SHARES];
  const layers = packages?.get(pkgName);
  layers?.delete(layer);
  if (!layers?.size) packages?.delete(pkgName);
  if (!packages?.size) delete layeredScope[LAYERED_SHARES];
}
