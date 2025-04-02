import path from 'path';
import { Stats, Manifest } from '@module-federation/sdk';
import { fs } from '@modern-js/utils';
import { BundlerPlugin } from '../types';

function mergeStats(
  browserStats: Stats,
  nodeStats: Stats,
  ssrPublicPath: string,
): Stats {
  const ssrRemoteEntry = nodeStats.metaData.remoteEntry;
  browserStats.metaData.ssrRemoteEntry = ssrRemoteEntry;
  if ('publicPath' in browserStats.metaData) {
    browserStats.metaData.ssrPublicPath = ssrPublicPath;
  }
  return browserStats;
}

function mergeManifest(
  browserManifest: Manifest,
  nodeManifest: Manifest,
  ssrPublicPath: string,
): Manifest {
  const ssrRemoteEntry = nodeManifest.metaData.remoteEntry;
  browserManifest.metaData.ssrRemoteEntry = ssrRemoteEntry;
  if ('publicPath' in browserManifest.metaData) {
    browserManifest.metaData.ssrPublicPath = ssrPublicPath;
  }
  return browserManifest;
}

function mergeStatsAndManifest(
  nodePlugin: BundlerPlugin,
  browserPlugin: BundlerPlugin,
  ssrPublicPath: string,
): {
  mergedStats: Stats;
  mergedStatsFilePath: string;
  mergedManifest: Manifest;
  mergedManifestFilePath: string;
} {
  const nodeResourceInfo = nodePlugin.statsResourceInfo;
  const browserResourceInfo = browserPlugin.statsResourceInfo;
  if (
    !browserResourceInfo ||
    !nodeResourceInfo ||
    !browserResourceInfo.stats ||
    !nodeResourceInfo.stats ||
    !browserResourceInfo.manifest ||
    !nodeResourceInfo.manifest
  ) {
    throw new Error('can not get browserResourceInfo or nodeResourceInfo');
  }
  const mergedStats = mergeStats(
    browserResourceInfo.stats.stats,
    nodeResourceInfo.stats.stats,
    ssrPublicPath,
  );
  const mergedManifest = mergeManifest(
    browserResourceInfo.manifest.manifest,
    nodeResourceInfo.manifest.manifest,
    ssrPublicPath,
  );

  return {
    mergedStats: mergedStats,
    mergedStatsFilePath: browserResourceInfo.stats.filename,
    mergedManifest: mergedManifest,
    mergedManifestFilePath: browserResourceInfo.manifest.filename,
  };
}

export function updateStatsAndManifest(
  nodePlugin: BundlerPlugin,
  browserPlugin: BundlerPlugin,
  outputDir: string,
  ssrPublicPath: string,
) {
  const {
    mergedStats,
    mergedStatsFilePath,
    mergedManifest,
    mergedManifestFilePath,
  } = mergeStatsAndManifest(nodePlugin, browserPlugin, ssrPublicPath);

  fs.writeFileSync(
    path.resolve(outputDir, mergedStatsFilePath),
    JSON.stringify(mergedStats, null, 2),
  );
  fs.writeFileSync(
    path.resolve(outputDir, mergedManifestFilePath),
    JSON.stringify(mergedManifest, null, 2),
  );
}
