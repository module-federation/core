import path from 'node:path';
import type { ConfigT } from 'metro-config';
import { MANIFEST_FILENAME } from './constants';
import { removeExtension } from './helpers';

type CreateRewriteRequestOptions = {
  config: ConfigT;
  originalEntryFilename: string;
  remoteEntryFilename: string;
  manifestPath: string;
  tmpDirPath: string;
  getDtsAssetNames?: () => {
    zipName?: string;
    apiFileName?: string;
  };
};

export function createRewriteRequest({
  config,
  originalEntryFilename,
  remoteEntryFilename,
  manifestPath,
  tmpDirPath,
  getDtsAssetNames,
}: CreateRewriteRequestOptions) {
  const hostEntryName = removeExtension(originalEntryFilename);
  const remoteEntryName = removeExtension(remoteEntryFilename);
  const relativeTmpDirPath = path
    .relative(config.projectRoot, tmpDirPath)
    .split(path.sep)
    .join(path.posix.sep);
  const hostEntryPathRegex = getEntryPathRegex(hostEntryName);
  const remoteEntryPathRegex = getEntryPathRegex(remoteEntryName);

  return function rewriteRequest(url: string) {
    const root = config.projectRoot;
    const { pathname } = new URL(url, 'protocol://host');
    // rewrite /index.bundle -> /<tmp-dir>/index.bundle
    if (pathname.match(hostEntryPathRegex)) {
      const target = `${relativeTmpDirPath}/${hostEntryName}`;
      return url.replace(hostEntryName, target);
    }
    // rewrite /mini.bundle -> /<tmp-dir>/mini.bundle
    if (pathname.match(remoteEntryPathRegex)) {
      const target = `${relativeTmpDirPath}/${remoteEntryName}`;
      return url.replace(remoteEntryName, target);
    }
    // rewrite /mf-manifest.json -> /[metro-project]/node_modules/.mf-metro/mf-manifest.json
    if (pathname.startsWith(`/${MANIFEST_FILENAME}`)) {
      const target = manifestPath.replace(root, '[metro-project]');
      return url.replace(MANIFEST_FILENAME, target);
    }
    // rewrite /@mf-types.zip and /@mf-types.d.ts -> /<tmp-dir>/<type-asset>
    const dtsAssets = getDtsAssetNames?.();
    const dtsAssetName = [dtsAssets?.zipName, dtsAssets?.apiFileName]
      .filter((value): value is string => Boolean(value))
      .find((value) => pathname === `/${value}`);
    if (dtsAssetName) {
      const target = `${relativeTmpDirPath}/${dtsAssetName}`;
      return url.replace(dtsAssetName, target);
    }
    // pass through to original rewriteRequestUrl
    if (config.server.rewriteRequestUrl) {
      return config.server.rewriteRequestUrl(url);
    }
    return url;
  };
}

function getEntryPathRegex(entryFilename: string) {
  return new RegExp(`^\\/${entryFilename}(\\.js)?(\\.bundle)$`);
}
