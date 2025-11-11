import path from 'path';
import { Stats, Manifest } from '@module-federation/sdk';
import fs from 'fs-extra';
type AssetResource<T> = {
  data: T;
  filename: string;
};

export type StatsAssetResource = {
  stats?: AssetResource<Stats>;
  manifest?: AssetResource<Manifest>;
};

function mergeStats(browserStats: Stats, nodeStats: Stats): Stats {
  const ssrRemoteEntry = nodeStats.metaData.remoteEntry;
  browserStats.metaData.ssrRemoteEntry = ssrRemoteEntry;
  if ('publicPath' in browserStats.metaData) {
    // @ts-ignore nodeStats has the same structure with browserStats
    browserStats.metaData.ssrPublicPath = nodeStats.metaData.publicPath;
  }
  return browserStats;
}

function mergeManifest(
  browserManifest: Manifest,
  nodeManifest: Manifest,
): Manifest {
  const ssrRemoteEntry = nodeManifest.metaData.remoteEntry;
  browserManifest.metaData.ssrRemoteEntry = ssrRemoteEntry;
  if ('publicPath' in browserManifest.metaData) {
    // @ts-ignore nodeStats has the same structure with browserStats
    browserManifest.metaData.ssrPublicPath = nodeManifest.metaData.publicPath;
  }
  return browserManifest;
}

function mergeStatsAndManifest(
  nodeAssets: StatsAssetResource,
  browserAssets: StatsAssetResource,
): {
  mergedStats: Stats;
  mergedStatsFilePath: string;
  mergedManifest: Manifest;
  mergedManifestFilePath: string;
} {
  const { stats: browserStats, manifest: browserManifest } = browserAssets;
  const { stats: nodeStats, manifest: nodeManifest } = nodeAssets;

  if (!browserStats || !nodeStats || !browserManifest || !nodeManifest) {
    throw new Error('Failed to read stats or manifest assets for merge');
  }
  const mergedStats = mergeStats(browserStats.data, nodeStats.data);
  const mergedManifest = mergeManifest(browserManifest.data, nodeManifest.data);

  return {
    mergedStats: mergedStats,
    mergedStatsFilePath: browserStats.filename,
    mergedManifest: mergedManifest,
    mergedManifestFilePath: browserManifest.filename,
  };
}

export function updateStatsAndManifest(
  nodeAssets: StatsAssetResource,
  browserAssets: StatsAssetResource,
  outputDir: string,
) {
  const {
    mergedStats,
    mergedStatsFilePath,
    mergedManifest,
    mergedManifestFilePath,
  } = mergeStatsAndManifest(nodeAssets, browserAssets);

  fs.writeFileSync(
    path.resolve(outputDir, mergedStatsFilePath),
    JSON.stringify(mergedStats, null, 2),
  );
  fs.writeFileSync(
    path.resolve(outputDir, mergedManifestFilePath),
    JSON.stringify(mergedManifest, null, 2),
  );
}
