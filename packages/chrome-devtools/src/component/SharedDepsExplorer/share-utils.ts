import {
  GlobalShareScopeMap,
  Shared,
  SharedConfig,
} from '@module-federation/runtime/types';

export type LoadedStatus = 'loaded' | 'loading' | 'not-loaded';
export type ReuseStatus = boolean;

export interface ShareStats {
  totalProviders: number;
  totalScopes: number;
  totalPackages: number;
  totalVersions: number;
  loadedCount: number;
  reusedCount: number;
}

export interface NormalizedSharedVersion {
  id: string;
  provider: string;
  scope: string;
  packageName: string;
  version: string;
  from: string;
  useIn: string[];
  shareConfig: SharedConfig;
  strategy?: string;
  loaded?: boolean;
  loading?: unknown;
  loadedStatus: LoadedStatus;
  reuseStatus: ReuseStatus;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function computeLoadedStatus(entry: Shared): LoadedStatus {
  if (entry.loaded === true) {
    return 'loaded';
  }

  if (entry.loading) {
    return 'loading';
  }

  return 'not-loaded';
}

export function computeReuseStatus(entry: Shared): ReuseStatus {
  const useIn = Array.isArray(entry.useIn) ? entry.useIn : [];
  const { from } = entry;

  const reused = useIn.some((consumer) => consumer && consumer !== from);

  return reused;
}

interface NormalizeParams {
  provider: string;
  scope: string;
  packageName: string;
  versionKey: string;
  entry: Shared;
}

function normalizeEntry({
  provider,
  scope,
  packageName,
  versionKey,
  entry,
}: NormalizeParams): NormalizedSharedVersion | null {
  if (!isRecord(entry)) {
    return null;
  }

  const sharedEntry = entry;
  const loadedStatus = computeLoadedStatus(sharedEntry);
  const reuseStatus = computeReuseStatus(sharedEntry);
  const useIn = Array.isArray(sharedEntry.useIn) ? sharedEntry.useIn : [];

  return {
    id: `${provider}::${scope}::${packageName}::${versionKey}`,
    provider,
    scope,
    packageName,
    version: sharedEntry.version || versionKey,
    from: sharedEntry.from,
    useIn,
    shareConfig: sharedEntry.shareConfig ?? {},
    strategy: sharedEntry.strategy,
    loaded: sharedEntry.loaded,
    loading: sharedEntry.loading,
    loadedStatus,
    reuseStatus,
  };
}

export function normalizeShareData(
  raw: GlobalShareScopeMap | null | undefined,
): NormalizedSharedVersion[] {
  if (!raw || !isRecord(raw)) {
    return [];
  }

  const items: NormalizedSharedVersion[] = [];

  Object.entries(raw).forEach(([topKey, topValue]) => {
    if (!isRecord(topValue)) {
      return;
    }

    // legacy 模式：顶层 key 为 "default"，下一层直接是共享 scope（这里默认命名为 default）
    if (topKey === 'default') {
      const provider = 'default';
      const scope = 'default';
      const packagesObj = topValue;

      Object.entries(packagesObj).forEach(([pkgName, versions]) => {
        if (pkgName === 'version' || !isRecord(versions)) {
          return;
        }

        Object.entries(versions).forEach(([versionKey, entry]) => {
          const normalized = normalizeEntry({
            provider,
            scope,
            packageName: pkgName,
            versionKey,
            entry: entry as unknown as Shared,
          });
          if (normalized) {
            items.push(normalized);
          }
        });
      });

      return;
    }

    // 标准模式：顶层为 provider，下一层为 shareScope
    const provider = topKey;
    const scopesObj = topValue;

    Object.entries(scopesObj).forEach(([scopeName, scopeValue]) => {
      if (scopeName === 'version' || !isRecord(scopeValue)) {
        return;
      }

      const packagesObj = scopeValue;

      Object.entries(packagesObj).forEach(([pkgName, versions]) => {
        if (pkgName === 'version' || !isRecord(versions)) {
          return;
        }

        Object.entries(versions).forEach(([versionKey, entry]) => {
          const normalized = normalizeEntry({
            provider,
            scope: scopeName,
            packageName: pkgName,
            versionKey,
            entry,
          });
          if (normalized) {
            items.push(normalized);
          }
        });
      });
    });
  });

  return items;
}

export function computeShareStats(
  versions: NormalizedSharedVersion[],
): ShareStats {
  const providerSet = new Set<string>();
  const scopeSet = new Set<string>();
  const packageSet = new Set<string>();
  let loadedCount = 0;
  let reusedCount = 0;

  versions.forEach((v) => {
    providerSet.add(v.provider);
    scopeSet.add(v.scope);
    packageSet.add(v.packageName);

    if (v.loadedStatus === 'loaded') {
      loadedCount += 1;
    }
    if (v.reuseStatus) {
      reusedCount += 1;
    }
  });

  return {
    totalProviders: providerSet.size,
    totalScopes: scopeSet.size,
    totalPackages: packageSet.size,
    totalVersions: versions.length,
    loadedCount,
    reusedCount,
  };
}

export function groupByProviderScopePackage(
  versions: NormalizedSharedVersion[],
) {
  const tree: Record<
    string,
    Record<string, Record<string, NormalizedSharedVersion[]>>
  > = {};

  versions.forEach((v) => {
    if (!tree[v.provider]) {
      tree[v.provider] = {};
    }
    if (!tree[v.provider][v.scope]) {
      tree[v.provider][v.scope] = {};
    }
    if (!tree[v.provider][v.scope][v.packageName]) {
      tree[v.provider][v.scope][v.packageName] = [];
    }

    tree[v.provider][v.scope][v.packageName].push(v);
  });

  return tree;
}

export function getFilterOptions(versions: NormalizedSharedVersion[]) {
  const providerSet = new Set<string>();
  const scopeSet = new Set<string>();
  const packageSet = new Set<string>();
  const versionSet = new Set<string>();

  versions.forEach((v) => {
    providerSet.add(v.provider);
    scopeSet.add(v.scope);
    packageSet.add(v.packageName);
    versionSet.add(v.version);
  });

  return {
    providers: Array.from(providerSet).sort(),
    scopes: Array.from(scopeSet).sort(),
    packages: Array.from(packageSet).sort(),
    versions: Array.from(versionSet).sort(),
  };
}

export function findPackageProvider(
  versions: NormalizedSharedVersion[],
  packageName: string,
  version?: string,
) {
  const candidates = versions.filter(
    (v) => v.packageName === packageName && (!version || v.version === version),
  );

  if (!candidates.length) {
    return null;
  }

  const providers = Array.from(new Set(candidates.map((v) => v.from))).sort();
  const hasLoaded = candidates.some((v) => v.loadedStatus === 'loaded');
  const hasLoading =
    !hasLoaded && candidates.some((v) => v.loadedStatus === 'loading');

  let status: LoadedStatus = 'not-loaded';
  if (hasLoaded) {
    status = 'loaded';
  } else if (hasLoading) {
    status = 'loading';
  }

  return {
    packageName,
    version: version || candidates[0]?.version,
    providers,
    status,
  };
}

export function getReusedVersions(
  versions: NormalizedSharedVersion[],
): NormalizedSharedVersion[] {
  return versions.filter((v) => v.reuseStatus === true);
}
