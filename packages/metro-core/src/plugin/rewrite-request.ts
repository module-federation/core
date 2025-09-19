import path from 'node:path';
import type { ConfigT } from 'metro-config';
import { EXPO_VIRTUAL_METRO_ENTRY, MANIFEST_FILENAME } from './constants';
import { removeExtension } from './helpers';

type CreateRewriteRequestOptions = {
  config: ConfigT;
  originalEntryFilename: string;
  remoteEntryFilename: string;
  manifestPath: string;
  tmpDirPath: string;
};

export function createRewriteRequest({
  config,
  originalEntryFilename,
  remoteEntryFilename,
  manifestPath,
  tmpDirPath,
}: CreateRewriteRequestOptions) {
  // expo requests utilize the server.unstable_serverRoot
  // fallback to projectRoot when not configured, just like in Metro
  const root = config.server.unstable_serverRoot ?? config.projectRoot;

  const hostEntryName = removeExtension(originalEntryFilename);
  const remoteEntryName = removeExtension(remoteEntryFilename);
  const relativeTmpDirPath = path
    .relative(root, tmpDirPath)
    .split(path.sep)
    .join(path.posix.sep);
  const hostEntryPathRegex = getEntryPathRegex(hostEntryName);
  const remoteEntryPathRegex = getEntryPathRegex(remoteEntryName);
  const virtualMetroEntryPathRegex = getEntryPathRegex(
    EXPO_VIRTUAL_METRO_ENTRY,
  );

  return function rewriteRequest(url: string) {
    const { pathname } = new URL(url, 'protocol://host');
    // rewrite /index.bundle -> /<tmp-dir>/index.bundle?<params>
    if (pathname.match(hostEntryPathRegex)) {
      const target = `${relativeTmpDirPath}/${hostEntryName}`;
      return url.replace(hostEntryName, target);
    }
    // rewrite /.expo/.virtual-metro-entry -> /<tmp-dir>/index.bundle?<params>
    if (pathname.match(virtualMetroEntryPathRegex)) {
      const target = `${relativeTmpDirPath}/${hostEntryName}`;
      return url.replace(EXPO_VIRTUAL_METRO_ENTRY, target);
    }
    // rewrite /mini.bundle -> /<tmp-dir>/mini.bundle
    if (pathname.match(remoteEntryPathRegex)) {
      const target = `${relativeTmpDirPath}/${remoteEntryName}`;
      return url.replace(remoteEntryName, target);
    }
    // rewrite /mf-manifest.json -> /[metro-project]/node_modules/.mf-metro/mf-manifest.json
    if (pathname.startsWith(`/${MANIFEST_FILENAME}`)) {
      const target = manifestPath.replace(
        config.projectRoot,
        '[metro-project]',
      );
      return url.replace(MANIFEST_FILENAME, target);
    }
    // pass through to original rewriteRequestUrl
    if (config.server.rewriteRequestUrl) {
      return config.server.rewriteRequestUrl(url);
    }
    return url;
  };
}

function getEntryPathRegex(entryFilename: string) {
  return new RegExp(`\\/${entryFilename}(\\.js)?(\\.bundle)$`);
}
