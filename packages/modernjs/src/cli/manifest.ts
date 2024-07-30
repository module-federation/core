import path from 'path';
import { Stats, Manifest } from '@module-federation/sdk';
import { fs } from '@modern-js/utils';
import { MODERN_JS_SERVER_DIR } from '../constant';
import { BundlerPlugin } from '../types';

function mergeStats(browserStats: Stats, nodeStats: Stats): Stats {
  const ssrRemoteEntry = nodeStats.metaData.remoteEntry;
  ssrRemoteEntry.path = MODERN_JS_SERVER_DIR;
  browserStats.metaData.ssrRemoteEntry = ssrRemoteEntry;

  return browserStats;
}

function mergeManifest(
  browserManifest: Manifest,
  nodeManifest: Manifest,
): Manifest {
  const ssrRemoteEntry = nodeManifest.metaData.remoteEntry;
  ssrRemoteEntry.path = MODERN_JS_SERVER_DIR;
  browserManifest.metaData.ssrRemoteEntry = ssrRemoteEntry;

  return browserManifest;
}

function mergeStatsAndManifest(
  nodePlugin: BundlerPlugin,
  browserPlugin: BundlerPlugin,
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
  );
  const mergedManifest = mergeManifest(
    browserResourceInfo.manifest.manifest,
    nodeResourceInfo.manifest.manifest,
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
) {
  const {
    mergedStats,
    mergedStatsFilePath,
    mergedManifest,
    mergedManifestFilePath,
  } = mergeStatsAndManifest(nodePlugin, browserPlugin);

  fs.writeFileSync(
    path.resolve(outputDir, mergedStatsFilePath),
    JSON.stringify(mergedStats, null, 2),
  );
  fs.writeFileSync(
    path.resolve(outputDir, mergedManifestFilePath),
    JSON.stringify(mergedManifest, null, 2),
  );
}
