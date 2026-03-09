import type { SharedItem } from '@/components/analyze/AnalyzeForm';
import { addProtoToUrl } from './treeshakeShared';

type StatsShared = {
  name: string;
  version: string;
  usedExports?: string[];
};

type StatsRemote = {
  federationContainerName?: string;
  name?: string;
  version?: string;
  entry?: string;
};

type Stats = {
  shared: StatsShared[];
  remotes?: StatsRemote[];
};

const normalizeRemoteName = (name: string) => name.replace(/^app:/, '');

export const parseBuildConfigFromManifest = async (url: string) => {
  const urlWithProto = addProtoToUrl(url);
  const sharedItems: SharedItem[] = [];
  const pureShared: string[] = [];
  const remotes: Array<{ name: string; version?: string }> = [];

  const res = await fetch(urlWithProto);
  if (!res.ok) {
    throw new Error(`Failed to fetch manifest: HTTP ${res.status}`);
  }

  const statsJson = (await res.json()) as Stats;

  if (statsJson.shared?.length) {
    const hasUsedExports = statsJson.shared.some(
      (s) => s.usedExports && s.usedExports.length > 0,
    );
    statsJson.shared.forEach((s) => {
      if (hasUsedExports && (!s.usedExports || s.usedExports.length === 0)) {
        pureShared.push(`${s.name}@${s.version}`);
        return;
      }
      sharedItems.push({
        id: `${s.name}@${s.version}`,
        name: s.name,
        version: s.version,
        exports: s.usedExports ?? [],
      });
    });
  }

  if (statsJson.remotes?.length) {
    statsJson.remotes.forEach((remote) => {
      const rawName = remote.federationContainerName ?? remote.name ?? '';
      if (!rawName) return;
      const name = normalizeRemoteName(rawName);
      const version =
        remote.version ?? (remote.entry ? String(remote.entry) : undefined);
      remotes.push({ name, version });
    });
  }

  return { pureShared, sharedItems, remotes };
};

export async function fetchRegistryTreeshakeConfig(manifestUrl: string) {
  return parseBuildConfigFromManifest(manifestUrl);
}
