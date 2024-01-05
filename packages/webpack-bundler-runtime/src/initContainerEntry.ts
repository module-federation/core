import {
  InitContainerEntryOptions,
  WebpackRequire,
  ShareScopeMap,
} from './types';

function isLegacyHost(
  shareScope: InitContainerEntryOptions['shareScope'],
  remoteEntryInitOptions: InitContainerEntryOptions['remoteEntryInitOptions'],
): boolean {
  if (
    remoteEntryInitOptions &&
    typeof remoteEntryInitOptions === 'object' &&
    remoteEntryInitOptions.hostId
  ) {
    return false;
  }
  if ('version' in shareScope && typeof shareScope['version'] !== 'object') {
    return true;
  }
  if ('region' in shareScope && typeof shareScope['region'] !== 'object') {
    return true;
  }
  return false;
}

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
  var name = shareScopeKey || 'default';
  webpackRequire.federation.instance.initOptions({
    name: webpackRequire.federation.initOptions.name,
    remotes: [],
    ...remoteEntryInitOptions,
  });
  if (isLegacyHost(shareScope, remoteEntryInitOptions)) {
    const prevShareScope = globalThis.__FEDERATION__.__SHARE__['default'];
    if (prevShareScope) {
      webpackRequire.federation.instance.initShareScopeMap(
        name,
        prevShareScope as unknown as ShareScopeMap[string],
      );
    }
  } else {
    webpackRequire.federation.instance.initShareScopeMap(name, shareScope);
  }

  webpackRequire.S[name] = shareScope;
  if (webpackRequire.federation.attachShareScopeMap) {
    webpackRequire.federation.attachShareScopeMap(webpackRequire);
  }

  // @ts-ignore
  return webpackRequire.I(name, initScope);
}
