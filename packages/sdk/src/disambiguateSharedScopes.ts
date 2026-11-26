import type { ModuleInfo, StatsShared } from './types';

type SnapshotShare = ModuleInfo['shared'][number];
type Share = SnapshotShare | StatsShared;

function identityWithoutScope(share: Share): string {
  return JSON.stringify([
    'sharedName' in share ? share.sharedName : share.name,
    share.version,
    share.layer,
  ]);
}

export function disambiguateSharedScopes<T extends Share>(shared: T[]): T[] {
  if (!shared.some((share) => share.shareScope === undefined)) return shared;
  const scoped = new Set<string>();
  for (const share of shared) {
    if (share.shareScope !== undefined) scoped.add(identityWithoutScope(share));
  }
  if (!scoped.size) return shared;
  return shared.map((share) =>
    share.shareScope === undefined && scoped.has(identityWithoutScope(share))
      ? { ...share, shareScope: 'default' }
      : share,
  );
}
