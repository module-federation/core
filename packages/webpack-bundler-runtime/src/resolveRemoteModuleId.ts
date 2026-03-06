import type { ResolveRemoteModuleIdOptions } from './types';

const normalizeExpose = (expose: string) => {
  if (!expose || expose === '.') {
    return '.';
  }
  return expose.startsWith('./') ? expose : `./${expose}`;
};

const normalizeExposeCandidates = (expose: string): string[] => {
  const normalized = normalizeExpose(expose);
  if (normalized === '.') {
    return ['.'];
  }
  if (normalized.startsWith('./')) {
    return [normalized, normalized.slice(2)];
  }
  return [normalized, `./${normalized}`];
};

const getRemoteNameCandidates = (
  options: ResolveRemoteModuleIdOptions,
): Set<string> => {
  const names = new Set<string>([options.alias]);
  const remoteInfos =
    options.webpackRequire.federation?.bundlerRuntimeOptions?.remotes
      ?.remoteInfos;
  const aliasRemoteInfos = remoteInfos?.[options.alias];
  if (Array.isArray(aliasRemoteInfos)) {
    for (const info of aliasRemoteInfos) {
      if (typeof info?.name === 'string' && info.name) {
        names.add(info.name);
      }
    }
  }
  return names;
};

export function resolveRemoteModuleId(
  options: ResolveRemoteModuleIdOptions,
): string | undefined {
  const mapping =
    options.webpackRequire.remotesLoadingData?.moduleIdToRemoteDataMapping;
  if (!mapping) {
    return undefined;
  }

  const exposeCandidates = new Set(normalizeExposeCandidates(options.expose));
  const remoteNameCandidates = getRemoteNameCandidates(options);
  let resolvedModuleId: string | undefined;

  for (const [moduleId, remoteData] of Object.entries(mapping)) {
    if (
      !remoteData ||
      typeof remoteData.name !== 'string' ||
      !remoteData.name ||
      typeof remoteData.remoteName !== 'string' ||
      !remoteNameCandidates.has(remoteData.remoteName)
    ) {
      continue;
    }
    if (!exposeCandidates.has(remoteData.name)) {
      continue;
    }

    if (!resolvedModuleId) {
      resolvedModuleId = moduleId;
      continue;
    }

    if (resolvedModuleId !== moduleId) {
      return undefined;
    }
  }

  return resolvedModuleId;
}
