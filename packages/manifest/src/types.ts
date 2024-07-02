import { Manifest, Stats } from '@module-federation/sdk';

export type StatsInfo = {
  stats: Stats;
  filename: string;
};

export type ManifestInfo = {
  manifest: Manifest;
  filename: string;
};

export type ResourceInfo = {
  stats: StatsInfo;
  manifest: ManifestInfo;
};
