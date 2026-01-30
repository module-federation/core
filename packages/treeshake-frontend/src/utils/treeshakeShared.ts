import i18n from '@/i18n';
import { scanResources, type LibResourceRecord } from './resourceScanner';
import { ENV_API_BASE } from '@/constant';

export interface TreeshakeResult {
  name: string;
  version: string;
  globalName: string;
  cdnUrl: string;
  type: 're-shake' | 'full';
  modules?: string[];
  canTreeShaking: boolean;
}

export interface RequestPayload {
  sharedName: string;
  sharedVersion: string;
  shared: [string, string, string[]][];
  target: string[];
  plugins: string[];
}

export interface BundleModules {
  names?: string[];
}
export interface BundleRes {
  js: string;
  size: number;
  modules: BundleModules;
  resourcePerf: LibResourceRecord;
}
export interface BundleStats {
  full: BundleRes;
  treeshake: BundleRes;
}

export const addProtoToUrl = (url: string) => {
  if (url.startsWith('//')) {
    return window.location.protocol + url;
  }
  return url;
};

const loadScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.body.appendChild(script);
  });
};

export const normalizeResponse = async ({
  sharedName,
  sharedVersion,
  raw,
  treeshakeModules,
  fullTreeshakeResult,
}: {
  sharedName: string;
  sharedVersion: string;
  raw: TreeshakeResult[];
  treeshakeModules: string[];
  fullTreeshakeResult: TreeshakeResult;
}): Promise<BundleStats> => {
  const treeshakeItem = raw.find(
    (item) => item.name === sharedName && item.version === sharedVersion,
  );
  const fullItem = fullTreeshakeResult;

  if (!fullItem || !treeshakeItem) {
    throw new Error(i18n.t('analyze.responseMissingJs'));
  }

  fullItem.cdnUrl = addProtoToUrl(fullItem.cdnUrl);
  treeshakeItem.cdnUrl = addProtoToUrl(treeshakeItem.cdnUrl);

  // Load scripts to generate performance entries
  await Promise.all([
    loadScript(fullItem.cdnUrl),
    loadScript(treeshakeItem.cdnUrl),
  ]);

  // Scan resources
  const records = await scanResources([fullItem.cdnUrl, treeshakeItem.cdnUrl]);

  const findRecord = (url: string) =>
    records.find((r) => r.url === url) ||
    ({
      id: url,
      url: url,
      libraries: [],
      transferSize: 0,
      encodedBodySize: 0,
      decodedBodySize: 0,
      sizeSource: 'unknown',
      sizeStatus: 'unavailable',
      duration: 0,
    } as LibResourceRecord);

  const fullRecord = findRecord(fullItem.cdnUrl);
  const treeshakeRecord = findRecord(treeshakeItem.cdnUrl);

  const fullRes: BundleRes = {
    js: fullRecord.content || fullItem.cdnUrl,
    size: fullRecord.encodedBodySize || 0,
    modules: { names: fullItem.modules },
    resourcePerf: fullRecord,
  };

  const treeshakeRes: BundleRes = {
    js: treeshakeRecord.content || treeshakeItem.cdnUrl,
    size: treeshakeRecord.encodedBodySize || 0,
    modules: { names: treeshakeModules || treeshakeItem.modules },
    resourcePerf: treeshakeRecord,
  };

  console.log('fullRecord: ', fullRecord);
  console.log('treeshakeRecord: ', treeshakeRecord);
  return { full: fullRes, treeshake: treeshakeRes };
};

export async function treeshakeShared(
  requestPayload: RequestPayload,
  fullTreeshakeResult: TreeshakeResult,
): Promise<(BundleStats & { sharedName: string })[]> {
  const url = ENV_API_BASE;
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const { shared, target, plugins, sharedName, sharedVersion } = requestPayload;
  const raw = JSON.stringify({
    shared,
    target,
    plugins,
    libraryType: 'global',
    hostName: '@treeshake/shared-host',
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  };

  const resp = await window.fetch(`${url}/build`, requestOptions);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }
  const result = await resp.json();
  const { status, data } = result;
  if (status !== 'success') {
    throw new Error(data);
  }

  const results: (BundleStats & { sharedName: string })[] = [];

  for (const item of shared) {
    const name = item[0];
    const version = item[1];
    const treeshakeModules = item[2];

    // For secondary items, we don't have fullTreeshakeResult.
    // We use the treeshake result as 'full' as a fallback to show valid data structure,
    // though savings will be 0.
    // If it is the primary item, we use the real fullTreeshakeResult.
    const isPrimary = name === sharedName && version === sharedVersion;

    // Find treeshake result in data
    const treeshakeItem = (data as TreeshakeResult[]).find(
      (r) => r.name === name && r.version === version,
    );

    if (!treeshakeItem) continue;

    const fullRes = isPrimary ? fullTreeshakeResult : treeshakeItem;

    try {
      const normalized = await normalizeResponse({
        sharedName: name,
        sharedVersion: version,
        raw: data as TreeshakeResult[],
        treeshakeModules: treeshakeModules,
        fullTreeshakeResult: fullRes,
      });
      results.push({ ...normalized, sharedName: name });
    } catch (e) {
      console.error(`Failed to normalize response for ${name}`, e);
    }
  }

  return results;
}
