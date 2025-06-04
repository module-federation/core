import path from 'path';
import { Stats, Manifest } from '@module-federation/sdk';
import fs from 'fs-extra';
import type { ModuleFederationPlugin as WebpackModuleFederationPlugin } from '@module-federation/enhanced';
import type { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';

type BundlerPlugin =
  | WebpackModuleFederationPlugin
  | RspackModuleFederationPlugin;

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
