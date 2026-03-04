import { InitContainerEntryOptions, WebpackRequire } from './types';

const shouldDebug =
  typeof process !== 'undefined' && Boolean(process.env?.RSC_MF_DEBUG);

const debugLog = (message: string, data?: Record<string, unknown>) => {
  if (!shouldDebug) {
    return;
  }
  if (data) {
    // eslint-disable-next-line no-console
    console.error('[mf:initContainerEntry]', message, data);
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[mf:initContainerEntry]', message);
};

export function initContainerEntry(
  options: InitContainerEntryOptions,
): WebpackRequire['I'] | void {
  const {
    webpackRequire,
    shareScope,
    initScope,
    shareScopeKey,
    remoteEntryInitOptions,
  } = options;
  if (!webpackRequire.S) return;
  if (
    !webpackRequire.federation ||
    !webpackRequire.federation.instance ||
    !webpackRequire.federation.initOptions
  )
    return;

  const federationInstance = webpackRequire.federation.instance;

  federationInstance.initOptions({
    name: webpackRequire.federation.initOptions.name,
    remotes: [],
    ...remoteEntryInitOptions,
  });

  const hostShareScopeKeys = remoteEntryInitOptions?.shareScopeKeys;
  const hostShareScopeMap = remoteEntryInitOptions?.shareScopeMap;
  const normalizedHostShareScopeKeys = Array.isArray(hostShareScopeKeys)
    ? hostShareScopeKeys
    : typeof hostShareScopeKeys === 'string' && hostShareScopeKeys
      ? [hostShareScopeKeys]
      : [];
  const normalizedContainerShareScopeKeys = Array.isArray(shareScopeKey)
    ? shareScopeKey
    : [shareScopeKey || 'default'];

  const shareScopeKeysForInit = Array.from(
    new Set(
      normalizedHostShareScopeKeys.length
        ? normalizedHostShareScopeKeys
        : normalizedContainerShareScopeKeys,
    ),
  );

  debugLog('input', {
    shareScopeKey: Array.isArray(shareScopeKey)
      ? shareScopeKey.join(',')
      : shareScopeKey || 'default',
    hostShareScopeKeys: shareScopeKeysForInit.join(','),
    hostShareScopeMapKeys: hostShareScopeMap
      ? Object.keys(hostShareScopeMap).join(',')
      : '',
  });

  shareScopeKeysForInit.forEach((scopeKey, index) => {
    let scopeValue = shareScope;
    if (hostShareScopeMap) {
      if (!hostShareScopeMap[scopeKey]) {
        hostShareScopeMap[scopeKey] = {};
      }
      scopeValue = hostShareScopeMap[scopeKey];
    } else if (index > 0) {
      scopeValue = {};
    }
    federationInstance.initShareScopeMap(scopeKey, scopeValue, {
      hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
    });
  });

  if (webpackRequire.federation.attachShareScopeMap) {
    webpackRequire.federation.attachShareScopeMap(webpackRequire);
  }
  const remoteShareScopeMap = (federationInstance as any).shareScopeMap;
  debugLog('post-initShareScopeMap', {
    remoteShareScopeMapKeys: remoteShareScopeMap
      ? Object.keys(remoteShareScopeMap).join(',')
      : '',
    sameSsrRef:
      Boolean(hostShareScopeMap?.ssr) &&
      remoteShareScopeMap?.ssr === hostShareScopeMap?.ssr,
    sameRscRef:
      Boolean(hostShareScopeMap?.rsc) &&
      remoteShareScopeMap?.rsc === hostShareScopeMap?.rsc,
    sameDefaultRef:
      Boolean(hostShareScopeMap?.default) &&
      remoteShareScopeMap?.default === hostShareScopeMap?.default,
  });
  if (typeof webpackRequire.federation.prefetch === 'function') {
    webpackRequire.federation.prefetch();
  }

  if (shareScopeKeysForInit.length === 1) {
    // @ts-ignore
    return webpackRequire.I(shareScopeKeysForInit[0], initScope);
  }

  const proxyInitializeSharing = Boolean(
    webpackRequire.federation.initOptions.shared,
  );

  if (proxyInitializeSharing) {
    // @ts-ignore
    return webpackRequire.I(shareScopeKeysForInit, initScope);
  }

  // @ts-ignore
  return Promise.all(
    shareScopeKeysForInit.map((key) => webpackRequire.I(key, initScope)),
  ).then(() => true);
}
