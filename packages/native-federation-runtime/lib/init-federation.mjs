import { mergeImportMaps } from './model/import-map';
import { getExternalUrl, setExternalUrl } from './model/externals';
import { joinPaths, getDirectory } from './utils/path-utils';
import { addRemote } from './model/remotes';
import { appendImportMap } from './utils/add-import-map';

export async function initFederation(remotesOrManifestUrl = {}) {
  const remotes =
    typeof remotesOrManifestUrl === 'string'
      ? await loadManifest(remotesOrManifestUrl)
      : remotesOrManifestUrl;

  const hostImportMap = await processHostInfo();
  const remotesImportMap = await processRemoteInfos(remotes);
  const importMap = mergeImportMaps(hostImportMap, remotesImportMap);

  appendImportMap(importMap);
  return importMap;
}

async function loadManifest(remotes) {
  return await fetch(remotes).then((r) => r.json());
}

async function processRemoteInfos(remotes) {
  const processRemoteInfoPromises = Object.keys(remotes).map(
    async (remoteName) => {
      try {
        const url = remotes[remoteName];
        return await processRemoteInfo(url, remoteName);
      } catch (e) {
        console.error(
          `Error loading remote entry for ${remoteName} from file ${remotes[remoteName]}`,
        );
        return null;
      }
    },
  );

  const remoteImportMaps = await Promise.all(processRemoteInfoPromises);
  const importMap = remoteImportMaps.reduce(
    (acc, remoteImportMap) =>
      remoteImportMap ? mergeImportMaps(acc, remoteImportMap) : acc,
    { imports: {}, scopes: {} },
  );

  return importMap;
}

export async function processRemoteInfo(federationInfoUrl, remoteName) {
  const baseUrl = getDirectory(federationInfoUrl);
  const remoteInfo = await loadFederationInfo(federationInfoUrl);

  if (!remoteName) {
    remoteName = remoteInfo.name;
  }

  const importMap = createRemoteImportMap(remoteInfo, remoteName, baseUrl);
  addRemote(remoteName, { ...remoteInfo, baseUrl });

  return importMap;
}

function createRemoteImportMap(remoteInfo, remoteName, baseUrl) {
  const imports = processExposed(remoteInfo, remoteName, baseUrl);
  const scopes = processRemoteImports(remoteInfo, baseUrl);

  return { imports, scopes };
}

async function loadFederationInfo(url) {
  const info = await fetch(url).then((r) => r.json());
  return info;
}

function processRemoteImports(remoteInfo, baseUrl) {
  const scopes = {};
  const scopedImports = {};

  for (const shared of remoteInfo.shared) {
    const outFileName =
      getExternalUrl(shared) ?? joinPaths(baseUrl, shared.outFileName);
    setExternalUrl(shared, outFileName);
    scopedImports[shared.packageName] = outFileName;
  }

  scopes[baseUrl + '/'] = scopedImports;
  return scopes;
}

function processExposed(remoteInfo, remoteName, baseUrl) {
  const imports = {};

  for (const exposed of remoteInfo.exposes) {
    const key = joinPaths(remoteName, exposed.key);
    const value = joinPaths(baseUrl, exposed.outFileName);
    imports[key] = value;
  }

  return imports;
}

async function processHostInfo() {
  const hostInfo = await loadFederationInfo('./remoteEntry.json');
  const imports = hostInfo.shared.reduce(
    (acc, cur) => ({ ...acc, [cur.packageName]: './' + cur.outFileName }),
    {},
  );

  for (const shared of hostInfo.shared) {
    setExternalUrl(shared, './' + shared.outFileName);
  }

  return { imports, scopes: {} };
}
