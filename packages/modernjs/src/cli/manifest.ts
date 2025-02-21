import path from 'path';
import { Stats, Manifest } from '@module-federation/sdk';
import { fs } from '@modern-js/utils';
import { BundlerPlugin } from '../types';

function mergeStats(
  browserStats: Stats,
  nodeStats: Stats,
  ssrDir: string,
): Stats {
  const ssrRemoteEntry = nodeStats.metaData.remoteEntry;
  ssrRemoteEntry.path = ssrDir;
  browserStats.metaData.ssrRemoteEntry = ssrRemoteEntry;

  return browserStats;
}

function mergeManifest(
  browserManifest: Manifest,
  nodeManifest: Manifest,
  ssrDir: string,
): Manifest {
  const ssrRemoteEntry = nodeManifest.metaData.remoteEntry;
  ssrRemoteEntry.path = ssrDir;
  browserManifest.metaData.ssrRemoteEntry = ssrRemoteEntry;

  return browserManifest;
}

function mergeStatsAndManifest(
  nodePlugin: BundlerPlugin,
  browserPlugin: BundlerPlugin,
  ssrDir: string,
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
    ssrDir,
  );
  const mergedManifest = mergeManifest(
    browserResourceInfo.manifest.manifest,
    nodeResourceInfo.manifest.manifest,
    ssrDir,
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
  ssrDir: string,
) {
  const {
    mergedStats,
    mergedStatsFilePath,
    mergedManifest,
    mergedManifestFilePath,
  } = mergeStatsAndManifest(nodePlugin, browserPlugin, ssrDir);

  fs.writeFileSync(
    path.resolve(outputDir, mergedStatsFilePath),
    JSON.stringify(mergedStats, null, 2),
  );
  fs.writeFileSync(
    path.resolve(outputDir, mergedManifestFilePath),
    JSON.stringify(mergedManifest, null, 2),
  );
}
