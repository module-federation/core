import path from 'node:path';
import type { ConfigT } from 'metro-config';
import { MANIFEST_FILENAME } from './constants';
import { removeExtension, toPosixPath } from './helpers';

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
      return replaceInPath(url, hostEntryName, target);
    }
    // rewrite /mini.bundle -> /<tmp-dir>/mini.bundle
    if (pathname.match(remoteEntryPathRegex)) {
      const target = `${relativeTmpDirPath}/${remoteEntryName}`;
      return replaceInPath(url, remoteEntryName, target);
    }
    // rewrite /mf-manifest.json -> /[metro-project]/node_modules/.mf-metro/mf-manifest.json
    if (pathname.startsWith(`/${MANIFEST_FILENAME}`)) {
      const target = toPosixPath(manifestPath.replace(root, '[metro-project]'));
      return replaceInPath(url, MANIFEST_FILENAME, target);
    }
    // rewrite /@mf-types.zip and /@mf-types.d.ts -> /<tmp-dir>/<type-asset>
    const dtsAssets = getDtsAssetNames?.();
    const dtsAssetName = [dtsAssets?.zipName, dtsAssets?.apiFileName]
      .filter((value): value is string => Boolean(value))
      .find((value) => pathname === `/${value}`);
    if (dtsAssetName) {
      const target = `${relativeTmpDirPath}/${dtsAssetName}`;
      return replaceInPath(url, dtsAssetName, target);
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

// Metro passes request URLs as paths (/index.bundle?platform=ios), but HMR
// entry points and stack frames to symbolicate as full URLs
// (http://localhost:8081/index.bundle?platform=ios). The origin has to be left
// alone: an entry named `host` is also found in `localhost`.
const URL_ORIGIN_REGEX = /^(?:[a-z][a-z\d+.-]*:)?\/\/[^/?#]*/i;

function replaceInPath(url: string, searchValue: string, replaceValue: string) {
  const origin = url.match(URL_ORIGIN_REGEX)?.[0] ?? '';
  return origin + url.slice(origin.length).replace(searchValue, replaceValue);
}
